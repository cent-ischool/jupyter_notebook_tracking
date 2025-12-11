#!/usr/bin/env python3
"""Reset the edit time metadata in a Jupyter notebook."""

import argparse
import json
import sys


def main():
    parser = argparse.ArgumentParser(description="Reset edit time in a Jupyter notebook to zero")
    parser.add_argument("path", help="Path to the notebook file")
    args = parser.parse_args()

    try:
        with open(args.path, "r", encoding="utf-8") as f:
            notebook = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found: {args.path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in notebook: {e}", file=sys.stderr)
        sys.exit(1)

    if "metadata" not in notebook:
        notebook["metadata"] = {}

    old_time = notebook["metadata"].get("total_edit_time_seconds", 0)
    old_user = notebook["metadata"].get("last_edit_by", "")
    old_editors = notebook["metadata"].get("editors", {})

    notebook["metadata"]["total_edit_time_seconds"] = 0
    if "last_edit_by" in notebook["metadata"]:
        del notebook["metadata"]["last_edit_by"]
    if "editors" in notebook["metadata"]:
        del notebook["metadata"]["editors"]

    with open(args.path, "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=1)

    print(f"Reset total_edit_time_seconds from {old_time}s to 0s")
    if old_user:
        print(f"Cleared last_edit_by (was: {old_user})")
    if old_editors:
        print(f"Cleared editors (was: {old_editors})")


if __name__ == "__main__":
    main()
