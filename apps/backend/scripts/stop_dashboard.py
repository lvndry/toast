#!/usr/bin/env python3
"""Stop the Streamlit dashboard."""

import subprocess
import sys


def stop_dashboard():
    """Stop the Streamlit dashboard process."""
    try:
        # Find and kill streamlit processes
        result = subprocess.run(
            ["pkill", "-f", "streamlit.*dashboard"], capture_output=True, text=True
        )

        if result.returncode == 0:
            print("✅ Streamlit dashboard stopped successfully")
        else:
            print("ℹ️  No running Streamlit dashboard found")

    except Exception as e:
        print(f"❌ Error stopping dashboard: {e}")
        return False

    return True


if __name__ == "__main__":
    success = stop_dashboard()
    if not success:
        sys.exit(1)
