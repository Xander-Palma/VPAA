from django.db import models
from django.contrib.auth.models import User

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

    def __str__(self):
        return f"{self.title} ({self.date})"

class Participant(models.Model):
    event = models.ForeignKey(Event, related_name='participants', on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    status = models.CharField(max_length=32, default='registered')
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    has_evaluated = models.BooleanField(default=False)
    evaluation_data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} <{self.email}> - {self.status}"
