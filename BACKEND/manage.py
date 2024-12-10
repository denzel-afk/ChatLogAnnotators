#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Add a conditional to execute the data insertion script
    if len(sys.argv) > 1 and sys.argv[1] == "insert_data":
        # Import and run the custom data insertion script
        from crud.insert_data import insert_data
        insert_data()
    else:
        execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
