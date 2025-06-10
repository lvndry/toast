import asyncio
import concurrent.futures
from typing import Coroutine, TypeVar

import streamlit as st

T = TypeVar("T")


def run_async(coro: Coroutine[None, None, T]) -> T | None:
    """Run async function in a completely isolated thread with its own event loop

    Args:
        coro: The coroutine to run

    Returns:
        The result of the coroutine with its original type preserved, or None if an error occurs
    """

    def run_in_thread():
        # Create a completely fresh event loop in this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(coro)
        finally:
            # Cancel all pending tasks before closing the loop
            pending_tasks = asyncio.all_tasks(loop)
            for task in pending_tasks:
                task.cancel()

            # Wait for all tasks to be cancelled
            if pending_tasks:
                loop.run_until_complete(
                    asyncio.gather(*pending_tasks, return_exceptions=True)
                )

            loop.close()

    # Run in a separate thread to avoid any event loop conflicts
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        try:
            return future.result()
        except concurrent.futures.TimeoutError:
            st.error("Database operation timed out")
            return None
        except Exception as e:
            st.error(f"Database error: {str(e)}")
            return None
