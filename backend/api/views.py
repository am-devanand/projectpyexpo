from datetime import timedelta
# from bson.objectid import ObjectId # Removed
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import User, Complaint
from .serializers import (
    UserSerializer, UserCreateSerializer,
    ComplaintSerializer, ComplaintCreateSerializer,
    AssignComplaintSerializer, ResolveComplaintSerializer, RejectComplaintSerializer
)
from .utils import is_within_radius

# MongoDB methods removed


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User CRUD operations (SQLite)."""
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def collectors(self, request):
        collectors = User.objects.filter(role='COLLECTOR')
        serializer = UserSerializer(collectors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=401)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """Handle user login."""
    authentication_classes = []
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        role = request.data.get('role', 'CITIZEN')
        
        # Guest Login Logic
        if role == 'CITIZEN' and username == 'guest':
            guest_user, created = User.objects.get_or_create(
                username=f'guest_{int(timezone.now().timestamp())}',
                defaults={'role': 'CITIZEN'}
            )
            if created:
                guest_user.set_password('guest')
                guest_user.save()
            login(request, guest_user)
            return Response({'message': 'Guest login successful', 'user': UserSerializer(guest_user).data})
        
        user = authenticate(username=username, password=password)
        if user:
            if user.role != role:
                return Response({'error': f'User is not a {role}'}, status=403)
            login(request, user)
            return Response({'message': 'Login successful', 'user': UserSerializer(user).data})
        
        return Response({'error': 'Invalid credentials'}, status=401)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})


@method_decorator(csrf_exempt, name='dispatch')
class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Complaint operations using SQLite (Django ORM).
    """
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    
    def get_queryset(self):
        queryset = Complaint.objects.all()
        status_filter = self.request.query_params.get('status')
        assigned_to = self.request.query_params.get('assigned_to')
        
        if status_filter:
            queryset = queryset.filter(status__in=status_filter.split(','))
            
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
            
        return queryset.order_by('-urgency_level', '-created_at')
    
    def create(self, request, *args, **kwargs):
        try:
            print(f"FILES received: {request.FILES.keys()}")
            print(f"DATA received: {request.data}")
            
            serializer = ComplaintCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            location_coords = serializer.validated_data.get('location_coords', '')
            location_address = serializer.validated_data.get('location_address', '')
            complainant_name = serializer.validated_data.get('complainant_name', '')
            
            complainant = request.user if request.user.is_authenticated else None
            
            # Use Django's timezone
            now = timezone.now()
            
            # Spam Detection
            if complainant:
                one_hour_ago = now - timedelta(hours=1)
                recent_count = Complaint.objects.filter(
                    complainant=complainant,
                    created_at__gte=one_hour_ago,
                    location_coords=location_coords
                ).count()
                
                if recent_count >= 5:
                    return Response({'error': 'Spam detected'}, status=429)

            # Duplicate/Urgency Detection
            twenty_four_hours_ago = now - timedelta(hours=24)
            potential_duplicates = Complaint.objects.filter(
                status__in=['PENDING', 'ASSIGNED'],
                created_at__gte=twenty_four_hours_ago
            )
            
            for existing in potential_duplicates:
                if (is_within_radius(existing.location_coords, location_coords, 50) or
                    existing.location_address.lower() == location_address.lower()):
                    
                    # Increment Urgency
                    existing.urgency_level += 1
                    existing.save()
                    
                    return Response({
                        'message': 'Duplicate found. Urgency increased.',
                        'complaint': ComplaintSerializer(existing).data,
                        'is_duplicate': True
                    })

            # Create New Complaint
            complaint = Complaint.objects.create(
                complainant=complainant,
                complainant_name=complainant_name,
                location_coords=location_coords,
                location_address=location_address,
                image_before=request.FILES.get('image_before')
            )
            
            return Response({
                'message': 'Complaint submitted',
                'complaint': ComplaintSerializer(complaint).data,
                'is_duplicate': False
            }, status=201)
            
        except Exception as e:
            print(f"Error in create complaint: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AssignComplaintView(APIView):
    def post(self, request, complaint_id):
        try:
            # complaint_id is the string ID "CC-..."? No, ModelViewSet uses PK (id) by default in URL
            # but our frontend might be sending the _id string from Mongo times.
            # Let's support PK lookup.
            complaint = Complaint.objects.get(id=complaint_id)
        except (Complaint.DoesNotExist, ValueError):
             return Response({'error': 'Complaint not found'}, status=404)

        serializer = AssignComplaintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            collector = User.objects.get(id=serializer.validated_data['collector_id'])
        except User.DoesNotExist:
            return Response({'error': 'Collector not found'}, status=404)
        
        complaint.assigned_to = collector
        complaint.assigned_by = request.user
        complaint.status = 'ASSIGNED'
        complaint.save()
        
        return Response({'message': 'Assigned', 'complaint': ComplaintSerializer(complaint).data})


class ResolveComplaintView(APIView):
    def post(self, request, complaint_id):
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=404)
            
        image_file = request.FILES.get('image_after')
        if image_file:
            complaint.image_after = image_file
            
        complaint.status = 'RESOLVED'
        complaint.save()
        return Response({'message': 'Resolved'})


class RejectComplaintView(APIView):
    def post(self, request, complaint_id):
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=404)
            
        reason = request.data.get('reason')
        complaint.status = 'REJECTED'
        complaint.rejected_reason = reason
        complaint.save()
        return Response({'message': 'Rejected'})


class SimulateTimeoutView(APIView):
    def post(self, request):
        complaint_ids = request.data.get('complaint_ids', [])
        
        if complaint_ids:
            # Assuming IDs are PKs
            updated_count = Complaint.objects.filter(id__in=complaint_ids).update(status='ESCALATED')
        else:
            # 16h logic
            cutoff = timezone.now() - timedelta(hours=16)
            updated_count = Complaint.objects.filter(
                status__in=['PENDING', 'ASSIGNED'],
                created_at__lt=cutoff
            ).update(status='ESCALATED')

            # Force escalate logic if we had a field for it, assumed force_escalate=True also triggers
            updated_count += Complaint.objects.filter(
                 status__in=['PENDING', 'ASSIGNED'],
                 force_escalate=True
            ).update(status='ESCALATED')
            
        return Response({'message': f'{updated_count} escalated'})


@api_view(['GET'])
def dashboard_stats(request):
    total = Complaint.objects.count()
    pending = Complaint.objects.filter(status='PENDING').count()
    assigned = Complaint.objects.filter(status='ASSIGNED').count()
    resolved = Complaint.objects.filter(status='RESOLVED').count()
    rejected = Complaint.objects.filter(status='REJECTED').count()
    escalated = Complaint.objects.filter(status='ESCALATED').count()
    
    return Response({
        'total': total,
        'pending': pending,
        'assigned': assigned,
        'resolved': resolved,
        'rejected': rejected,
        'escalated': escalated,
        'active': pending + assigned + escalated
    })
