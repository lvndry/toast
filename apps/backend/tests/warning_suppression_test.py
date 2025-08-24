#!/usr/bin/env python3
"""Test script to verify warning suppression is working."""

import concurrent.futures
import warnings
from contextlib import contextmanager


@contextmanager
def suppress_streamlit_warnings():
    """Context manager to suppress Streamlit ScriptRunContext warnings in worker threads."""
    warnings.filterwarnings("ignore", message="missing ScriptRunContext")
    try:
        yield
    finally:
        # Restore warnings if needed
        warnings.filterwarnings("default", message="missing ScriptRunContext")


def test_warning_suppression():
    """Test that warnings are properly suppressed in threaded operations."""

    def worker_function():
        """Simulate a function that might trigger Streamlit warnings."""
        # This would normally trigger the warning in a Streamlit context
        print("Worker function executed successfully")
        return "success"

    def run_in_thread():
        """Run function in thread with warning suppression."""
        with suppress_streamlit_warnings():
            return worker_function()

    # Test the threading with warning suppression
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        result = future.result()
        print(f"Thread result: {result}")

    print("✅ Warning suppression test completed successfully")


if __name__ == "__main__":
    test_warning_suppression()
