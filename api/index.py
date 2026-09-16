import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1] / 'project_root' / 'backend'
sys.path.insert(0, str(BACKEND_DIR))

from main_app import app

# Vercel discovers this Flask application as the WSGI entry point.
