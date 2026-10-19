"""
WSGI Application Entrypoint.
Exposes the Flask app instance for production Gunicorn deployment on Render.
"""
import os
from backend.app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
