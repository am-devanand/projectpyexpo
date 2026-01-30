"""
WSGI config for citycare project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'citycare.settings')

application = get_wsgi_application()
