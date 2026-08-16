from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from journal.models import Entry


class Command(BaseCommand):
    help = 'Seeds demo user and sample gratitude entries for quick evaluation.'

    def handle(self, *args, **options):
        # Create or update demo user
        user, created = User.objects.get_or_create(
            username='alan',
            defaults={
                'email': 'alan@example.com',
                'first_name': 'Alan',
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(self.style.SUCCESS("Created demo user 'alan' (password: password123)"))
        else:
            self.stdout.write(self.style.NOTICE("Demo user 'alan' already exists."))

        today = date.today()
        sample_entries = [
            (
                today - timedelta(days=2),
                "Today I am deeply grateful for the crisp morning air and having a quiet moment with a warm cup of green tea before starting the day. It gave me a peaceful mindset."
            ),
            (
                today - timedelta(days=1),
                "Grateful for a wonderful phone call with an old friend from college. Reminded me of how valuable lifelong connections and shared memories are."
            ),
        ]

        created_count = 0
        for entry_date, content in sample_entries:
            if not Entry.objects.filter(owner=user, date=entry_date).exists():
                Entry.objects.create(owner=user, date=entry_date, content=content)
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created_count} sample gratitude entries for 'alan'."))
