import asyncio
import concurrent.futures
import threading
import warnings
from collections.abc import Coroutine
from contextlib import contextmanager
from typing import TypeVar

import streamlit as st

from core.logging import get_logger

logger = get_logger(__name__)

T = TypeVar("T")


@contextmanager
def suppress_streamlit_warnings():
    """Context manager to suppress Streamlit ScriptRunContext warnings in worker threads."""
    warnings.filterwarnings("ignore", message="missing ScriptRunContext")
    try:
        yield
    finally:
        # Restore warnings if needed
        warnings.filterwarnings("default", message="missing ScriptRunContext")


def run_async(coro: Coroutine[None, None, T]) -> T | None:
    """Run async function in a completely isolated thread with its own event loop

    Args:
        coro: The coroutine to run

    Returns:
        The result of the coroutine with its original type preserved, or None if an error occurs
    """

    def run_in_thread():
        # Suppress Streamlit ScriptRunContext warnings in worker threads
        with suppress_streamlit_warnings():
            # Create a completely fresh event loop in this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(coro)
            except Exception as e:
                # Log the error for debugging
                logger.error(f"Error in async operation: {e}")
                return None
            finally:
                try:
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
                except Exception as e:
                    # If there's an error closing the loop, just log it
                    print(f"Error closing event loop: {e}")

    # Use a thread-local approach to avoid conflicts
    _thread_local = threading.local()

    # Run in a separate thread to avoid any event loop conflicts
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(run_in_thread)
        try:
            return future.result(timeout=30)  # 30 second timeout
        except concurrent.futures.TimeoutError:
            st.error("Database operation timed out. Please try again.")
            return None
        except Exception as e:
            st.error(f"Database error: {str(e)}")
            return None


def run_async_with_retry(coro: Coroutine[None, None, T], max_retries: int = 3) -> T | None:
    """Run async function with retry logic for better reliability

    Args:
        coro: The coroutine to run
        max_retries: Maximum number of retry attempts

    Returns:
        The result of the coroutine, or None if all retries fail
    """
    for attempt in range(max_retries):
        try:
            result = run_async(coro)
            if result is not None:
                return result
        except Exception as e:
            if attempt == max_retries - 1:  # Last attempt
                st.error(f"Failed after {max_retries} attempts: {str(e)}")
            else:
                st.warning(f"Attempt {attempt + 1} failed, retrying...")
                import time

                time.sleep(1)  # Brief delay before retry

    return None


def run_in_thread_with_warning_suppression(func, *args, **kwargs):
    """Run a function in a separate thread with Streamlit warning suppression.

    Args:
        func: The function to run
        *args: Arguments to pass to the function
        **kwargs: Keyword arguments to pass to the function

    Returns:
        The result of the function
    """

    def run_in_thread():
        with suppress_streamlit_warnings():
            return func(*args, **kwargs)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        try:
            return future.result()
        except Exception as e:
            logger.error(f"Error in threaded operation: {e}")
            return None
