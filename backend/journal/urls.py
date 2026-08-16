from django.urls import path
from .views import (
    api_root,
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    EntryListCreateView,
    EntryDetailView,
)

urlpatterns = [
    # API Directory root
    path('', api_root, name='api-root'),

    # Authentication endpoints

    path('register/', RegisterView.as_view(), name='api-register'),
    path('login/', LoginView.as_view(), name='api-login'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('me/', CurrentUserView.as_view(), name='api-me'),

    # Journal Entries endpoints
    path('entries/', EntryListCreateView.as_view(), name='entry-list-create'),
    path('entries/<int:pk>/', EntryDetailView.as_view(), name='entry-detail'),
]
