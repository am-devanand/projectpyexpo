"""
Serializers for City Care API.
Adapted for Hybrid SQLite/MongoDB architecture.
"""

from rest_framework import serializers
from .models import User, Complaint


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (SQLite)."""
    
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'role_display', 'first_name', 'last_name', 'phone']
        read_only_fields = ['id']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users."""
    
    password = serializers.CharField(write_only=True, min_length=4)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'first_name', 'last_name', 'phone']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ComplaintSerializer(serializers.ModelSerializer):
    complainant_username = serializers.CharField(source='complainant.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'


class ComplaintCreateSerializer(serializers.ModelSerializer):
    image_before = serializers.ImageField(required=False)
    
    class Meta:
        model = Complaint
        fields = ['complainant_name', 'location_coords', 'location_address', 'image_before']


class AssignComplaintSerializer(serializers.Serializer):
    """Serializer for assigning complaints."""
    collector_id = serializers.IntegerField()


class ResolveComplaintSerializer(serializers.Serializer):
    """Serializer for resolving complaints."""
    image_after = serializers.ImageField()


class RejectComplaintSerializer(serializers.Serializer):
    """Serializer for rejecting complaints."""
    reason = serializers.CharField()
