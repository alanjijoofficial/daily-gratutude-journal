from django.contrib import admin
from .models import Entry


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'date', 'short_content', 'created_at', 'updated_at')
    list_filter = ('date', 'created_at', 'owner')
    search_fields = ('title', 'content', 'owner__username', 'owner__email')

    ordering = ('-date', '-created_at')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')

    def short_content(self, obj):
        if len(obj.content) > 60:
            return obj.content[:60] + '...'
        return obj.content

    short_content.short_description = 'Gratitude Content'
