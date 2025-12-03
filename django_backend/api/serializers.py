from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Event, Participant, Certificate, EventSession, Quiz, EvaluationQuestion, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['qr_code', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    qr_code = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'qr_code']
    
    def get_qr_code(self, obj):
        """Get QR code from profile"""
        try:
            return obj.profile.qr_code
        except:
            return None

class ParticipantSerializer(serializers.ModelSerializer):
    certificate = serializers.SerializerMethodField()
    is_eligible = serializers.SerializerMethodField()
    
    class Meta:
        model = Participant
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_certificate(self, obj):
        try:
            # Access certificate via OneToOne relationship
            cert = obj.certificate
            if cert:
                return {
                    'certificate_number': cert.certificate_number,
                    'verification_code': cert.verification_code,
                    'issued_at': cert.issued_at.isoformat() if cert.issued_at else None,
                    'emailed': cert.emailed
                }
        except Exception as e:
            # Certificate doesn't exist yet
            pass
        return None
    
    def get_is_eligible(self, obj):
        return obj.is_eligible_for_certificate()

class EventSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSession
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class EvaluationQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationQuestion
        fields = '__all__'

class CertificateSerializer(serializers.ModelSerializer):
    participant_name = serializers.CharField(source='participant.name', read_only=True)
    participant_email = serializers.CharField(source='participant.email', read_only=True)
    event_title = serializers.CharField(source='participant.event.title', read_only=True)
    
    class Meta:
        model = Certificate
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    sessions = EventSessionSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    evaluation_questions = EvaluationQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'time_start', 'time_end', 'location', 
                  'status', 'participants_count', 'requirements', 'participants', 'qr_code',
                  'certificate_template', 'speakers', 'agenda', 'is_multi_session', 'sessions',
                  'quizzes', 'evaluation_questions', 'created_at', 'updated_at']
    
    def get_participants(self, obj):
        """Only show all participants to admins, participants see only their own"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from .permissions import is_admin
            if is_admin(request.user):
                # Admin sees all participants
                return ParticipantSerializer(obj.participants.all(), many=True).data
            elif request.user.is_authenticated:
                # Participant sees only their own
                return ParticipantSerializer(
                    obj.participants.filter(user=request.user), 
                    many=True
                ).data
        # Default: show all (for backwards compatibility)
        return ParticipantSerializer(obj.participants.all(), many=True).data
