import os
import django
from django.conf import settings
from io import BytesIO
from PIL import Image

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'citycare.settings')
django.setup()

from rest_framework import serializers

class TestImageSerializer(serializers.Serializer):
    image = serializers.ImageField()

def test_pillow():
    print("Testing Pillow import...")
    try:
        import PIL
        print(f"✅ Pillow imported successfully. Version: {PIL.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import Pillow: {e}")
        return

    print("Testing Image creation...")
    try:
        file = BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(file, 'jpeg')
        file.seek(0)
        print("✅ Image created successfully")
        
        # Test Serializer
        from django.core.files.uploadedfile import SimpleUploadedFile
        uploaded = SimpleUploadedFile("test.jpg", file.read(), content_type="image/jpeg")
        
        serializer = TestImageSerializer(data={'image': uploaded})
        if serializer.is_valid():
            print("✅ Serializer validation passed")
        else:
            print(f"❌ Serializer validation failed: {serializer.errors}")
            
    except Exception as e:
        print(f"❌ Image processing failed: {e}")

if __name__ == "__main__":
    test_pillow()
