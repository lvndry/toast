#!/usr/bin/env python3
"""Run Streamlit dashboard with proper environment setup."""

import os
import subprocess
import sys
from pathlib import Path


def check_environment():
    """Check if required environment variables are set."""
    required_vars = ["MONGO_URI"]
    missing_vars = []

    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n💡 Please set these variables in your .env file or environment.")
        return False

    print("✅ Environment variables check passed")
    return True


def test_database_connection():
    """Test database connection before starting dashboard."""
    try:
        import asyncio

        from src.dashboard.test_connection import test_connection

        print("🔗 Testing database connection...")
        success = asyncio.run(test_connection())

        if not success:
            print("❌ Database connection failed. Please check your MONGO_URI.")
            return False

        return True

    except Exception as e:
        print(f"❌ Error testing database connection: {e}")
        return False


def run_streamlit():
    """Run the Streamlit dashboard."""
    try:
        # Get the path to the dashboard app
        dashboard_path = Path(__file__).parent / "src" / "dashboard" / "app.py"

        if not dashboard_path.exists():
            print(f"❌ Dashboard app not found at {dashboard_path}")
            return False

        print("🚀 Starting Streamlit dashboard...")
        print(f"📁 Dashboard path: {dashboard_path}")
        print("🌐 Dashboard will be available at: http://localhost:8501")
        print("🔄 Press Ctrl+C to stop the dashboard")
        print("-" * 50)

        # Run streamlit
        subprocess.run(
            [
                sys.executable,
                "-m",
                "streamlit",
                "run",
                str(dashboard_path),
                "--server.port",
                "8501",
                "--server.address",
                "0.0.0.0",
                "--server.headless",
                "true",
                "--browser.gatherUsageStats",
                "false",
            ]
        )

        return True

    except KeyboardInterrupt:
        print("\n👋 Dashboard stopped by user")
        return True
    except Exception as e:
        print(f"❌ Error running dashboard: {e}")
        return False


def main():
    """Main function to run the dashboard."""
    print("🍞 Toast AI Dashboard")
    print("=" * 30)

    # Check environment
    if not check_environment():
        sys.exit(1)

    # Test database connection
    if not test_database_connection():
        print("\n💡 Troubleshooting tips:")
        print("• Check that your MongoDB instance is running")
        print("• Verify your MONGO_URI is correct")
        print("• Make sure you have network access to your MongoDB")
        print("• Try running: python src/dashboard/test_connection.py")
        sys.exit(1)

    # Run dashboard
    success = run_streamlit()

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
