"""
Models for City Care waste management system.
User model is stored in SQLite (Django Auth).
Complaint structure is defined here but stored in MongoDB.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Extended User model with role-based access control (Stored in SQLite)."""
    
    ROLE_CHOICES = [
        ('CITIZEN', 'Citizen'),
        ('INSPECTOR', 'Sanitary Inspector'),
        ('COLLECTOR', 'Garbage Collector'),
        ('OFFICER', 'Municipal Officer'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CITIZEN')
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Complaint(models.Model):
    """Complaint model stored in SQLite."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('RESOLVED', 'Resolved'),
        ('REJECTED', 'Rejected'),
        ('ESCALATED', 'Escalated'),
    ]
    
    complaint_id = models.CharField(max_length=20, unique=True, blank=True)
    complainant = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='complaints')
    complainant_name = models.CharField(max_length=100, blank=True)
    
    image_before = models.ImageField(upload_to='complaints/before/', blank=True, null=True)
    image_after = models.ImageField(upload_to='complaints/after/', blank=True, null=True)
    
    location_coords = models.CharField(max_length=50) # "lat,lng"
    location_address = models.CharField(max_length=255)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    urgency_level = models.IntegerField(default=1)
    
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='dispatcher_complaints')
    
    rejected_reason = models.TextField(blank=True, null=True)
    force_escalate = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'complaints'
        ordering = ['-urgency_level', '-created_at']
        
    def __str__(self):
        return f"{self.complaint_id} - {self.status}"
        
    def save(self, *args, **kwargs):
        if not self.complaint_id:
            # Generate ID only on creation
            # We need to save first to get PK for a truly unique sequential ID, 
            # or rely on UUID/Timestamp. Let's stick to the CC-YYYYMMDD-XXXX format
            # For simplicity in SQLite, we might use a random suffix or count
            today = timezone.now().strftime('%Y%m%d')
            import uuid
            suffix = str(uuid.uuid4().int)[:4]
            self.complaint_id = f"CC-{today}-{suffix}"
        super().save(*args, **kwargs)


# Complaint Model is now managed via PyMongo directly in views
# But we keep this class for reference or if we wanted to use it for validation
class ComplaintStructure:
    """
    Reference structure for Complaint in MongoDB.
    Not a Django Model.
    
    Fields:
    - _id: ObjectId
    - complaint_id: str
    - complainant_id: int (User.id)
    - complainant_name: str
    - image_before: str (path)
    - image_after: str (path)
    - location_coords: str
    - location_address: str
    - status: str (PENDING, ASSIGNED, RESOLVED, REJECTED, ESCALATED)
    - urgency_level: int
    - assigned_to_id: int (User.id)
    - assigned_by_id: int (User.id)
    - rejected_reason: str
    - created_at: datetime
    - updated_at: datetime
    """
    pass
