#!/usr/bin/env python3
"""
Script to run the Toast Streamlit dashboard
"""

import os
import subprocess
import sys


def main():
    # Set the working directory to the backend folder
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Run streamlit with the dashboard app
    cmd = [
        sys.executable,
        "-m",
        "streamlit",
        "run",
        "src/dashboard/app.py",
        "--server.port",
        "8501",
        "--server.address",
        "0.0.0.0",
    ]

    print("Starting Toast Dashboard...")
    print("Dashboard will be available at: http://localhost:8501")
    print("Press Ctrl+C to stop the dashboard")

    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\nDashboard stopped.")
    except subprocess.CalledProcessError as e:
        print(f"Error running dashboard: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
