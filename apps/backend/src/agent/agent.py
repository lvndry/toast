import json
from collections.abc import AsyncGenerator

from src.agent.tools import check_compliance, search_query
from src.core.logging import get_logger
from src.llm import acompletion_with_fallback

logger = get_logger(__name__)


class Agent:
    def __init__(self, system_prompt: str):
        self.system_prompt = system_prompt

    async def chat(
        self, messages: list[dict[str, str]], company_slug: str
    ) -> AsyncGenerator[str, None]:
        """
        Run the agent loop:
        1. Check if tool use is needed (non-streaming).
        2. If tool needed, execute and recurse.
        3. If no tool needed, stream the response.
        """
        # Ensure system prompt is at the start
        if not messages or messages[0]["role"] != "system":
            messages = [{"role": "system", "content": self.system_prompt}] + messages

        # Define tools
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "search_query",
                    "description": "Search for information in the company's legal documents.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The search query to find relevant information.",
                            },
                        },
                        "required": ["query"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "check_compliance",
                    "description": "Check if the company's documents comply with a specific regulation (e.g. GDPR, CCPA).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "regulation": {
                                "type": "string",
                                "description": "The regulation to check (e.g. 'GDPR', 'CCPA').",
                            },
                        },
                        "required": ["regulation"],
                    },
                },
            },
        ]

        # Step 1: Decide on action (Tool vs Answer)
        try:
            response = await acompletion_with_fallback(
                messages=messages,
                tools=tools,
                tool_choice="auto",
            )
        except Exception as e:
            logger.error(f"Agent error in decision step: {e}")
            yield "I encountered an error while processing your request."
            return

        message = response.choices[0].message
        tool_calls = message.tool_calls

        # Step 2: Handle Tool Calls
        if tool_calls:
            logger.info(f"Agent decided to use tools: {len(tool_calls)} calls")

            # Add the assistant's tool call message to history
            messages.append(message.model_dump())

            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                if function_name == "search_query":
                    query = function_args.get("query")
                    logger.info(f"Executing search_query: {query}")

                    # Yield a status update to the user (optional, but good for UX)
                    # yield f"Searching for: {query}...\n\n"

                    try:
                        # Execute tool
                        search_results = await search_query(query, company_slug)

                        # Format results for the model
                        if not search_results.get("matches"):
                            content = "No relevant information found."
                        else:
                            chunks = []
                            for match in search_results["matches"]:
                                chunks.append(
                                    f"Source: {match['metadata'].get('url', 'Unknown')}\n"
                                    f"Content: {match['metadata'].get('chunk_text', '')}"
                                )
                            content = "\n\n---\n\n".join(chunks)

                    except Exception as e:
                        logger.error(f"Tool execution failed: {e}")
                        content = f"Error executing search: {str(e)}"

                elif function_name == "check_compliance":
                    regulation = function_args.get("regulation")
                    logger.info(f"Executing check_compliance: {regulation}")

                    try:
                        assessment = await check_compliance(regulation, company_slug)
                        content = assessment
                    except Exception as e:
                        logger.error(f"Tool execution failed: {e}")
                        content = f"Error checking compliance: {str(e)}"

                else:
                    content = "Unknown tool."

                # Add tool result to history
                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": content,
                    }
                )

            # Step 3: Recurse (Stream the final answer based on tool outputs)
            # We call chat again (or just stream from here).
            # Calling chat again allows for multi-step reasoning (e.g. search -> not found -> search again).
            # But for "super fast", let's just stream the answer now.
            # Actually, let's allow one level of recursion for now to keep it simple but "agentic".
            # To support true multi-step, we'd loop. Let's do a simple loop.
            async for chunk in self._stream_response(messages):
                yield chunk

        else:
            # No tool call, just stream the response
            # We need to stream the content from the *current* response if it has content,
            # but we used a non-streaming call. So we just yield the content.
            # OR, we can make a second streaming call to get the token-by-token effect.
            # Since the user wants "streaming", re-generating with stream=True is better UX
            # than dumping a block of text, even if it costs a bit more latency/tokens.
            # Optimization: If the first response already has content, we could just yield it.
            # But for consistency, let's stream.
            if message.content:
                yield message.content
            else:
                # This shouldn't happen if no tools and no content, but just in case
                async for chunk in self._stream_response(messages):
                    yield chunk

    async def _stream_response(self, messages: list[dict[str, str]]) -> AsyncGenerator[str, None]:
        """Helper to stream the final response."""
        logger.debug(f"Streaming response with messages: {json.dumps(messages, default=str)}")
        try:
            response = await acompletion_with_fallback(
                messages=messages,
                stream=True,
            )

            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            logger.error(f"Error streaming response: {e}")
            yield "I encountered an error while generating the response."
