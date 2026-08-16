from datetime import date
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Entry


class JournalAPITests(APITestCase):
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username='alan',
            email='alan@example.com',
            password='password123'
        )
        self.token1, _ = Token.objects.get_or_create(user=self.user1)

        self.user2 = User.objects.create_user(
            username='maria',
            email='maria@example.com',
            password='password123'
        )
        self.token2, _ = Token.objects.get_or_create(user=self.user2)

    def test_user_registration_success(self):
        """Test registering a new user."""
        response = self.client.post('/api/register/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepassword',
            'confirm_password': 'securepassword',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')

    def test_user_registration_password_mismatch(self):
        """Test registration fails when passwords do not match."""
        response = self.client.post('/api/register/', {
            'username': 'mismatchuser',
            'password': 'passwordA',
            'confirm_password': 'passwordB',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test logging in with valid credentials."""
        response = self.client.post('/api/login/', {
            'username': 'alan',
            'password': 'password123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['token'], self.token1.key)
        self.assertEqual(response.data['user']['username'], 'alan')

    def test_user_login_invalid(self):
        """Test logging in with invalid credentials."""
        response = self.client.post('/api/login/', {
            'username': 'alan',
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_logout(self):
        """Test logging out deletes user auth token."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.post('/api/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Token should now be deleted from database
        self.assertFalse(Token.objects.filter(user=self.user1).exists())

    def test_create_journal_entry(self):
        """Test creating a valid journal entry with title."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.post('/api/entries/', {
            'title': 'Morning Sunshine',
            'date': '2026-08-14',
            'content': 'Grateful for morning sunlight and fresh coffee.',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Morning Sunshine')
        self.assertEqual(response.data['content'], 'Grateful for morning sunlight and fresh coffee.')
        self.assertEqual(response.data['date'], '2026-08-14')
        self.assertEqual(response.data['owner_username'], 'alan')


    def test_one_entry_per_day_constraint(self):
        """Test that a user cannot create two entries for the same date."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        # Create first entry
        response1 = self.client.post('/api/entries/', {
            'date': '2026-08-14',
            'content': 'First reflection of the day.',
        })
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # Attempt to create second entry for same date
        response2 = self.client.post('/api/entries/', {
            'date': '2026-08-14',
            'content': 'Second reflection of the day.',
        })
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', str(response2.data))

    def test_different_users_same_date_allowed(self):
        """Test that different users can each have an entry on the same date."""
        # User 1 creates entry on August 14
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        resp1 = self.client.post('/api/entries/', {
            'date': '2026-08-14',
            'content': 'Alan is grateful for quiet time.',
        })
        self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)

        # User 2 creates entry on August 14
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        resp2 = self.client.post('/api/entries/', {
            'date': '2026-08-14',
            'content': 'Maria is grateful for good health.',
        })
        self.assertEqual(resp2.status_code, status.HTTP_201_CREATED)

    def test_strict_user_privacy_isolation(self):
        """Test that User 2 CANNOT view, edit, or delete User 1's entries."""
        # User 1 creates an entry
        entry1 = Entry.objects.create(
            owner=self.user1,
            date=date(2026, 8, 14),
            content='Alan private thoughts.'
        )

        # User 2 lists entries -> User 1 entry must NOT appear
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        list_resp = self.client.get('/api/entries/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data), 0)

        # User 2 attempts to retrieve User 1's entry by ID -> 404 Not Found
        detail_resp = self.client.get(f'/api/entries/{entry1.id}/')
        self.assertEqual(detail_resp.status_code, status.HTTP_404_NOT_FOUND)

        # User 2 attempts to edit User 1's entry -> 404 Not Found
        edit_resp = self.client.put(f'/api/entries/{entry1.id}/', {
            'date': '2026-08-14',
            'content': 'Hacked content.',
        })
        self.assertEqual(edit_resp.status_code, status.HTTP_404_NOT_FOUND)

        # User 2 attempts to delete User 1's entry -> 404 Not Found
        del_resp = self.client.delete(f'/api/entries/{entry1.id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_404_NOT_FOUND)
        # Verify entry still exists
        self.assertTrue(Entry.objects.filter(id=entry1.id).exists())

    def test_edit_own_entry(self):
        """Test updating user's own journal entry."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        create_resp = self.client.post('/api/entries/', {
            'date': '2026-08-14',
            'content': 'Initial gratitude note.',
        })
        entry_id = create_resp.data['id']

        # Update entry content
        update_resp = self.client.put(f'/api/entries/{entry_id}/', {
            'date': '2026-08-14',
            'content': 'Updated gratitude note with deeper appreciation.',
        })
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(update_resp.data['content'], 'Updated gratitude note with deeper appreciation.')

    def test_delete_own_entry(self):
        """Test deleting user's own journal entry."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        create_resp = self.client.post('/api/entries/', {
            'date': '2026-08-14',
            'content': 'Note to delete.',
        })
        entry_id = create_resp.data['id']

        del_resp = self.client.delete(f'/api/entries/{entry_id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Entry.objects.filter(id=entry_id).exists())

    def test_empty_content_validation(self):
        """Test that empty or whitespace content is rejected."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.post('/api/entries/', {
            'date': '2026-08-14',
            'content': '   ',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_by_title(self):
        """Test searching entries by title."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        self.client.post('/api/entries/', {
            'title': 'Walk in the Pine Woods',
            'date': '2026-08-14',
            'content': 'Enjoyed the fresh scent of pines.',
        })
        response = self.client.get('/api/entries/?search=Pine')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Walk in the Pine Woods')

