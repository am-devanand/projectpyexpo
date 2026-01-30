from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')
        
        # Create Users
        users_data = [
            {'username': 'admin', 'password': 'admin', 'role': 'OFFICER', 'email': 'admin@citycare.com'},
            {'username': 'inspector', 'password': 'admin', 'role': 'INSPECTOR', 'email': 'inspector@citycare.com'},
            {'username': 'collector1', 'password': 'admin', 'role': 'COLLECTOR', 'email': 'col1@citycare.com', 'first_name': 'John Doe'},
            {'username': 'collector2', 'password': 'admin', 'role': 'COLLECTOR', 'email': 'col2@citycare.com', 'first_name': 'Jane Smith'},
            {'username': 'officer', 'password': 'admin', 'role': 'OFFICER', 'email': 'officer@citycare.com'},
        ]
        
        for u in users_data:
            user, created = User.objects.get_or_create(username=u['username'], defaults={
                'role': u['role'],
                'email': u['email'],
                'first_name': u.get('first_name', '')
            })
            if created:
                user.set_password(u['password'])
                user.save()
                self.stdout.write(f"Created user: {u['username']} ({u['role']})")
            else:
                user.set_password(u['password'])
                user.save()
                self.stdout.write(f"Updated password for existing user: {u['username']}")

        # Create Sample Complaints
        from api.models import Complaint
        
        # Clear existing
        Complaint.objects.all().delete()
        
        citizen_user = User.objects.get(username='guest') if User.objects.filter(username='guest').exists() else None
        
        if not citizen_user:
             # Create a standard citizen for seeding
             citizen_user = User.objects.create_user('citizen', 'citizen@test.com', 'password', role='CITIZEN')

        complaints_data = [
            {
                'complainant': citizen_user,
                'complainant_name': 'John Doe',
                'location_coords': '11.0168,76.9558',
                'location_address': 'Gandhipuram, Coimbatore',
                'status': 'PENDING',
                'urgency_level': 1
            },
            {
                'complainant': citizen_user,
                'complainant_name': 'Jane Doe',
                'location_coords': '11.0045,76.9616',
                'location_address': 'RS Puram, Coimbatore',
                'status': 'ASSIGNED',
                'urgency_level': 2,
                'assigned_to': User.objects.get(username='collector1')
            }
        ]
        
        for c in complaints_data:
            Complaint.objects.create(**c)
            self.stdout.write(f"Created complaint at {c['location_address']}")

        self.stdout.write(self.style.SUCCESS('Data seeding completed successfully!'))
