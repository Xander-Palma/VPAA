from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField()
    time_start = models.TimeField(null=True, blank=True)
    time_end = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=32, default='upcoming')
    participants_count = models.IntegerField(default=0)
    requirements = models.JSONField(default=dict)
    qr_code = models.CharField(max_length=255, blank=True, null=True)  # QR code data for scanning
    certificate_template = models.JSONField(default=dict, blank=True)  # Template config
    speakers = models.JSONField(default=list, blank=True)  # List of speakers/trainers
    agenda = models.TextField(blank=True)  # Event agenda
    is_multi_session = models.BooleanField(default=False)  # Single or multi-session event
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.date})"

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self.qr_code = f"EVENT-{self.id}-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class EventSession(models.Model):
    """For multi-session events"""
    event = models.ForeignKey(Event, related_name='sessions', on_delete=models.CASCADE)
    session_name = models.CharField(max_length=255)
    session_date = models.DateField()
    session_start = models.TimeField()
    session_end = models.TimeField()
    location = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)  # Order of sessions

    class Meta:
        ordering = ['order', 'session_date', 'session_start']

    def __str__(self):
        return f"{self.event.title} - {self.session_name}"


class Participant(models.Model):
    event = models.ForeignKey(Event, related_name='participants', on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    status = models.CharField(max_length=32, default='registered')
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    has_evaluated = models.BooleanField(default=False)
    evaluation_data = models.JSONField(null=True, blank=True)
    quiz_passed = models.BooleanField(default=False)
    quiz_score = models.FloatField(null=True, blank=True)
    quiz_data = models.JSONField(null=True, blank=True)  # Quiz answers
    attendance_logs = models.JSONField(default=list, blank=True)  # Session-based attendance
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} <{self.email}> - {self.status}"

    def is_eligible_for_certificate(self):
        """Check if participant meets all requirements for certificate"""
        event = self.event
        req = event.requirements or {}
        
        # Must have attended
        if req.get('attendance', True):
            if self.status not in ['attended', 'completed']:
                return False
        
        # Must have evaluated if required
        if req.get('evaluation', False):
            if not self.has_evaluated:
                return False
        
        # Must have passed quiz if required
        if req.get('quiz', False):
            if not self.quiz_passed:
                return False
        
        return True


class Certificate(models.Model):
    participant = models.OneToOneField(Participant, related_name='certificate', on_delete=models.CASCADE)
    certificate_number = models.CharField(max_length=100, unique=True)
    verification_code = models.CharField(max_length=50, unique=True)  # QR code data
    pdf_file = models.FileField(upload_to='certificates/', null=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    emailed = models.BooleanField(default=False)
    emailed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Certificate {self.certificate_number} - {self.participant.name}"

    def save(self, *args, **kwargs):
        if not self.certificate_number:
            self.certificate_number = f"CERT-{uuid.uuid4().hex[:12].upper()}"
        if not self.verification_code:
            self.verification_code = f"VERIFY-{uuid.uuid4().hex[:16].upper()}"
        super().save(*args, **kwargs)


class Quiz(models.Model):
    """Quiz questions for events"""
    event = models.ForeignKey(Event, related_name='quizzes', on_delete=models.CASCADE)
    question = models.TextField()
    question_type = models.CharField(max_length=50, default='multiple_choice')  # multiple_choice, true_false, short_answer
    options = models.JSONField(default=list, blank=True)  # For multiple choice
    correct_answer = models.TextField()
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.event.title} - Q{self.order + 1}"


class EvaluationQuestion(models.Model):
    """Custom evaluation questions for events"""
    event = models.ForeignKey(Event, related_name='evaluation_questions', on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, default='rating')  # rating, text, checkbox
    required = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.event.title} - Eval Q{self.order + 1}"


class UserProfile(models.Model):
    """Extended user profile to store QR code"""
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    qr_code = models.CharField(max_length=255, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.qr_code:
            # Generate unique QR code: USER-{user_id}-{uuid}
            self.qr_code = f"USER-{self.user.id}-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create profile when user is created"""
    if created:
        UserProfile.objects.get_or_create(user=instance)
