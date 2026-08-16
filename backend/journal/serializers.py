from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Entry


class UserSerializer(serializers.ModelSerializer):
    """Serializer for returning user profile data."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password confirmation."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=6
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=6
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password']
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login and credential verification."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError("Must include both username and password.")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError({"error": "Invalid username or password."})

        if not user.is_active:
            raise serializers.ValidationError({"error": "User account is disabled."})

        attrs['user'] = user
        return attrs


class EntrySerializer(serializers.ModelSerializer):
    """
    Serializer for Daily Gratitude Entries.
    Enforces user ownership, content length, and one-entry-per-day rule.
    """
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Entry
        fields = ['id', 'title', 'date', 'content', 'owner_username', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner_username', 'created_at', 'updated_at']

    def validate_title(self, value):
        return value.strip() if value else ''

    def validate_content(self, value):

        cleaned_content = value.strip() if value else ''
        if not cleaned_content:
            raise serializers.ValidationError("Journal content cannot be empty.")
        if len(cleaned_content) > 1000:
            raise serializers.ValidationError("Journal entry cannot exceed 1000 characters.")
        return cleaned_content

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user:
            return attrs

        date = attrs.get('date')
        if date and not self.instance:
            # Check if this user already has an entry for this date (create case)
            if Entry.objects.filter(owner=request.user, date=date).exists():
                raise serializers.ValidationError({
                    "error": "You already have an entry for this date."
                })
        elif date and self.instance:
            # Check if updating to a date that conflicts with another entry
            if Entry.objects.filter(owner=request.user, date=date).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError({
                    "error": "You already have an entry for this date."
                })

        return attrs
