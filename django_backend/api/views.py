from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Event, Participant
from .serializers import EventSerializer, ParticipantSerializer, UserSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        event = self.get_object()
        data = request.data
        participant = Participant.objects.create(
            event=event,
            name=data.get('name', 'Anonymous'),
            email=data.get('email', ''),
            status='registered'
        )
        event.participants_count = event.participants.count()
        event.save()
        return Response(ParticipantSerializer(participant).data)


class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    if not username or not password:
        return Response({'detail': 'Missing credentials'}, status=status.HTTP_400_BAD_REQUEST)

    # Try to authenticate
    user = authenticate(request, username=username, password=password)
    if user is None:
        # Try to find by email
        try:
            u = User.objects.get(email=username)
            user = authenticate(request, username=u.username, password=password)
        except User.DoesNotExist:
            user = None

    if user is None:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data})


@api_view(['GET'])
def me(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'user': None})
    return Response({'user': UserSerializer(request.user).data})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    # create a new user (participant)
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name') or ''
    username = request.data.get('username') or (email.split('@')[0] if email else None)

    if not email or not password:
        return Response({'detail': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password, first_name=name)
    token = Token.objects.create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
