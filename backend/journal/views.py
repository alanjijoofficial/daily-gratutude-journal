from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.reverse import reverse
from rest_framework.authtoken.models import Token
from django.db.models import Q
from .models import Entry
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    EntrySerializer,
)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request, format=None):
    """
    GET /api/
    Interactive API root directory listing all endpoints.
    """
    return Response({
        "message": "🌱 Welcome to the Daily Gratitude Journal REST API",
        "endpoints": {
            "entries": reverse('entry-list-create', request=request, format=format),
            "login": reverse('api-login', request=request, format=format),
            "register": reverse('api-register', request=request, format=format),
            "logout": reverse('api-logout', request=request, format=format),
            "me": reverse('api-me', request=request, format=format),
            "admin": request.build_absolute_uri('/admin/'),
        },
        "instructions": "For protected endpoints (e.g. /api/entries/), send HTTP Header: Authorization: Token <your_token>"
    })




class RegisterView(generics.CreateAPIView):
    """
    POST /api/register/
    Registers a new user and generates an authentication token.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data,
            "message": "User registered successfully."
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/login/
    Authenticates user credentials and returns an authentication token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data,
            "message": "Login successful."
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/logout/
    Deletes the current user's authentication token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            # Delete user token so it cannot be reused
            Token.objects.filter(user=request.user).delete()
        except Exception:
            pass
        return Response({
            "message": "Successfully logged out."
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """
    GET /api/me/
    Returns profile information for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EntryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/entries/ - List entries for authenticated user
    POST /api/entries/ - Create a new gratitude entry for authenticated user
    
    Query parameters:
    - ?date=YYYY-MM-DD (Filter by exact date)
    - ?month=YYYY-MM   (Filter by month, e.g. 2026-08)
    - ?search=keyword  (Search in content)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer

    def get_queryset(self):
        user = self.request.user

        # If admin/staff, allow viewing all user entries (or filter by specific user)
        if user.is_staff or user.is_superuser:
            queryset = Entry.objects.all()
            username_param = self.request.query_params.get('user')
            if username_param:
                queryset = queryset.filter(owner__username__iexact=username_param.strip())
        else:
            # Strict privacy for standard users: only their own entries
            queryset = Entry.objects.filter(owner=user)
        
        # Optional filters
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)

        month_param = self.request.query_params.get('month')
        if month_param:
            # Expecting format 'YYYY-MM'
            try:
                year, month = month_param.split('-')
                queryset = queryset.filter(date__year=int(year), date__month=int(month))
            except (ValueError, IndexError):
                pass

        search_param = self.request.query_params.get('search')
        if search_param:
            term = search_param.strip()
            queryset = queryset.filter(Q(title__icontains=term) | Q(content__icontains=term))

        return queryset

    def perform_create(self, serializer):
        # Automatically attach the authenticated user as owner
        serializer.save(owner=self.request.user)


class EntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/entries/<id>/ - Retrieve an entry
    PUT    /api/entries/<id>/ - Update an entry completely
    PATCH  /api/entries/<id>/ - Update an entry partially
    DELETE /api/entries/<id>/ - Delete an entry
    
    Only entries owned by the authenticated user are accessible, unless admin/staff.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntrySerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Entry.objects.all()
        # Strict privacy: only entries belonging to the logged-in user
        return Entry.objects.filter(owner=user)

