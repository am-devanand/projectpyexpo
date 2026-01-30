from django.contrib import admin
from .models import User

# Only User is managed by Django ORM now
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'role', 'email', 'date_joined']
    list_filter = ['role']
    search_fields = ['username', 'email']
