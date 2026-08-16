from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from journal.views import health_check

urlpatterns = [
    path('health/', health_check, name='root-health'),
    # Redirect root / to /api/
    path('', RedirectView.as_view(url='/api/', permanent=False), name='root-redirect'),
    path('admin/', admin.site.urls),
    path('api/', include('journal.urls')),
]

