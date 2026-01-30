import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'citycare.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

def test_auth(username, password):
    user = authenticate(username=username, password=password)
    if user:
        print(f"✅ SUCCESS: {username} authenticated. Role: {user.role}")
        return True
    else:
        try:
            u = User.objects.get(username=username)
            print(f"❌ FAILED: {username} exists but password mismatch. Role: {u.role}")
            print(f"   Stored Password Hash: {u.password[:20]}...")
        except User.DoesNotExist:
            print(f"❌ FAILED: {username} does not exist.")
        return False

print("--- Verifying Users ---")
users_to_test = [
    ('guest', 'guest'),
    ('inspector', 'admin'),
    ('collector1', 'admin'),
    ('officer', 'admin'),
    ('admin', 'admin')
]

for u, p in users_to_test:
    test_auth(u, p)
