from django.db import models
from django.contrib.auth.models import User


class Entry(models.Model):
    """
    Daily Gratitude Journal Entry.
    Each user can write one gratitude entry per day.
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='entries',
        help_text="The user who created this journal entry."
    )
    date = models.DateField(
        help_text="The date this gratitude entry belongs to."
    )
    title = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="Title or theme of the gratitude reflection."
    )
    content = models.TextField(
        help_text="The gratitude reflection text (typically up to 1000 characters)."
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the entry was first created."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the entry was last updated."
    )

    class Meta:
        ordering = ['-date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['owner', 'date'],
                name='unique_user_daily_entry'
            )
        ]
        verbose_name = 'Journal Entry'
        verbose_name_plural = 'Journal Entries'

    def __str__(self):
        return f"{self.owner.username} - {self.date}"
