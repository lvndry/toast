import asyncio
import concurrent.futures

import streamlit as st


def run_async(coro):
    """Run async function in a completely isolated thread with its own event loop"""

    def run_in_thread():
        # Create a completely fresh event loop in this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()

    # Run in a separate thread to avoid any event loop conflicts
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        try:
            return future.result(timeout=10)  # 10 second timeout
        except concurrent.futures.TimeoutError:
            st.error("Database operation timed out")
            return None
        except Exception as e:
            st.error(f"Database error: {str(e)}")
            return None
