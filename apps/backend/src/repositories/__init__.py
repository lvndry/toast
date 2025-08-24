"""Repositories layer for data persistence access.

Each repository module exposes simple CRUD helpers that the services layer
can compose. For now, these delegate to existing functions in `src.db` to
avoid disruptive changes while we migrate toward a full repository pattern.
"""
