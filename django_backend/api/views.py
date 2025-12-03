from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.http import HttpResponse, FileResponse
from django.db.models import Q
import pandas as pd
import io
from .models import Event, Participant, Certificate, EventSession, Quiz, EvaluationQuestion, UserProfile
from .serializers import (
    EventSerializer, ParticipantSerializer, UserSerializer, 
    CertificateSerializer, EventSessionSerializer, QuizSerializer, EvaluationQuestionSerializer
)
from .utils import generate_certificate_pdf, send_certificate_email, generate_qr_code
from .permissions import IsAdminOrReadOnly, IsAdmin, IsParticipantOrAdmin, is_admin


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]  # Admins can CRUD, others read-only
    
    def get_queryset(self):
        """Participants can only see events, admins see all"""
        return Event.objects.all().order_by('-date')
    
    def get_serializer_context(self):
        """Pass request to serializer for permission checks"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Only admins can create events"""
        if not is_admin(self.request.user):
            raise permissions.PermissionDenied("Only administrators can create events.")
        serializer.save()
    
    def perform_update(self, serializer):
        """Only admins can update events"""
        if not is_admin(self.request.user):
            raise permissions.PermissionDenied("Only administrators can update events.")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Only admins can delete events"""
        if not is_admin(self.request.user):
            raise permissions.PermissionDenied("Only administrators can delete events.")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def join(self, request, pk=None):
        """Allow anyone to join an event (participants can register)"""
        event = self.get_object()
        data = request.data
        user = request.user if request.user.is_authenticated else None
        email = data.get('email', '')
        name = data.get('name', 'Anonymous')
        
        # If user is authenticated, use their email if not provided
        if user and not email:
            email = user.email
        
        # If user is authenticated, use their name if not provided
        if user and not name:
            name = user.get_full_name() or user.first_name or user.username or 'Anonymous'
        
        # Check if already registered - by user OR email
        existing = None
        if user:
            # First check by user
            existing = Participant.objects.filter(
                event=event,
                user=user
            ).first()
        
        # If not found by user, check by email
        if not existing and email:
            existing = Participant.objects.filter(
                event=event,
                email=email
            ).first()
        
        if existing:
            # Update user if it wasn't set before
            if user and not existing.user:
                existing.user = user
                existing.save()
            return Response(ParticipantSerializer(existing).data, status=status.HTTP_200_OK)
        
        # Create new participant
        try:
            participant = Participant.objects.create(
                event=event,
                user=user,
                name=name if name else 'Anonymous',
                email=email if email else '',
                status='registered'
            )
            
            # Refresh from database to ensure all fields are populated
            participant.refresh_from_db()
            
            # Update event participants count
            event.participants_count = event.participants.count()
            event.save()
            
            # Return serialized participant with all fields
            serialized = ParticipantSerializer(participant).data
            return Response(serialized, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            return Response({'error': str(e), 'traceback': traceback.format_exc()}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def conclude(self, request, pk=None):
        """Conclude event - makes it available for evaluation (Admin only)"""
        if not is_admin(request.user):
            return Response({'error': 'Only administrators can conclude events'}, 
                          status=status.HTTP_403_FORBIDDEN)
        event = self.get_object()
        event.status = 'completed'
        event.save()
        return Response({'status': 'Event concluded', 'event': EventSerializer(event).data})
    
    @action(detail=True, methods=['post'])
    def upload_participants(self, request, pk=None):
        """Upload participants from CSV/Excel file (Admin only)"""
        if not is_admin(request.user):
            return Response({'error': 'Only administrators can upload participants'}, 
                          status=status.HTTP_403_FORBIDDEN)
        event = self.get_object()
        file = request.FILES.get('file')
        
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Read file
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file)
            else:
                return Response({'error': 'Unsupported file format'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Expected columns: name, email (or Name, Email)
            name_col = 'name' if 'name' in df.columns else 'Name'
            email_col = 'email' if 'email' in df.columns else 'Email'
            
            if name_col not in df.columns or email_col not in df.columns:
                return Response({'error': 'File must contain name and email columns'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            created = 0
            for _, row in df.iterrows():
                email = str(row[email_col]).strip()
                name = str(row[name_col]).strip()
                
                if not email or '@' not in email:
                    continue
                
                # Check if exists
                if not Participant.objects.filter(event=event, email=email).exists():
                    Participant.objects.create(
                        event=event,
                        name=name,
                        email=email,
                        status='registered'
                    )
                    created += 1
            
            event.participants_count = event.participants.count()
            event.save()
            
            return Response({'message': f'{created} participants added', 'created': created})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """Get QR code image for event (Admin only)"""
        if not is_admin(request.user):
            return Response({'error': 'Only administrators can access QR codes'}, 
                          status=status.HTTP_403_FORBIDDEN)
        event = self.get_object()
        qr_img = generate_qr_code(event.qr_code or f"EVENT-{event.id}", size=300)
        return HttpResponse(qr_img.read(), content_type='image/png')


class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = [IsParticipantOrAdmin]
    
    def get_queryset(self):
        """Admins see all, participants see only their own"""
        if is_admin(self.request.user):
            return Participant.objects.all()
        # Participants can only see their own participant records
        if self.request.user and self.request.user.is_authenticated:
            return Participant.objects.filter(user=self.request.user)
        return Participant.objects.none()
    
    def get_serializer_context(self):
        """Pass request to serializer for permission checks"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Anyone can create participant record (join event)"""
        # Set user if authenticated
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        """Only admins can update participant records directly"""
        if not is_admin(self.request.user):
            raise permissions.PermissionDenied("Only administrators can update participant records.")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Only admins can delete participant records"""
        if not is_admin(self.request.user):
            raise permissions.PermissionDenied("Only administrators can delete participant records.")
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        """Mark attendance via QR scan (admin-only)"""
        if not is_admin(request.user):
            return Response({'error': 'Only administrators can mark attendance'}, 
                          status=status.HTTP_403_FORBIDDEN)
        participant = self.get_object()
        check_type = request.data.get('type', 'in')  # 'in' or 'out'
        
        if check_type == 'in':
            participant.check_in_time = timezone.now()
            participant.status = 'attended'
            # Add to attendance logs
            logs = participant.attendance_logs or []
            logs.append({
                'type': 'check_in',
                'time': timezone.now().isoformat(),
                'session': request.data.get('session', None)
            })
            participant.attendance_logs = logs
        elif check_type == 'out':
            participant.check_out_time = timezone.now()
            logs = participant.attendance_logs or []
            logs.append({
                'type': 'check_out',
                'time': timezone.now().isoformat(),
                'session': request.data.get('session', None)
            })
            participant.attendance_logs = logs
        
        participant.save()
        return Response(ParticipantSerializer(participant).data)
    
    @action(detail=True, methods=['post'])
    def submit_evaluation(self, request, pk=None):
        """Submit evaluation form (Participants can only submit their own)"""
        participant = self.get_object()
        event = participant.event
        
        # Participants can only submit their own evaluation
        if not is_admin(request.user) and participant.user != request.user:
            return Response({'error': 'You can only submit your own evaluation'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if event is concluded
        if event.status != 'completed':
            return Response({'error': 'Event must be concluded before evaluation'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already evaluated
        if participant.has_evaluated:
            return Response({'error': 'Evaluation already submitted'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        evaluation_data = request.data.get('evaluation_data', {})
        participant.evaluation_data = evaluation_data
        participant.has_evaluated = True
        participant.save()
        
        return Response(ParticipantSerializer(participant).data)
    
    @action(detail=True, methods=['post'])
    def submit_quiz(self, request, pk=None):
        """Submit quiz answers (Participants can only submit their own)"""
        participant = self.get_object()
        event = participant.event
        
        # Participants can only submit their own quiz
        if not is_admin(request.user) and participant.user != request.user:
            return Response({'error': 'You can only submit your own quiz'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        answers = request.data.get('answers', {})
        quizzes = Quiz.objects.filter(event=event).order_by('order')
        
        total_points = 0
        max_points = sum(q.points for q in quizzes)
        correct = 0
        
        quiz_results = {}
        for quiz in quizzes:
            user_answer = answers.get(str(quiz.id), '')
            is_correct = str(user_answer).strip().lower() == str(quiz.correct_answer).strip().lower()
            
            if is_correct:
                total_points += quiz.points
                correct += 1
            
            quiz_results[quiz.id] = {
                'question': quiz.question,
                'user_answer': user_answer,
                'correct_answer': quiz.correct_answer,
                'is_correct': is_correct,
                'points': quiz.points if is_correct else 0
            }
        
        score = (total_points / max_points * 100) if max_points > 0 else 0
        passed = score >= 70  # 70% passing grade
        
        participant.quiz_data = {
            'answers': answers,
            'results': quiz_results,
            'score': score,
            'total_points': total_points,
            'max_points': max_points,
            'correct': correct,
            'passed': passed
        }
        participant.quiz_score = score
        participant.quiz_passed = passed
        participant.save()
        
        return Response({
            'score': score,
            'passed': passed,
            'total_points': total_points,
            'max_points': max_points,
            'correct': correct,
            'participant': ParticipantSerializer(participant).data
        })
    
    @action(detail=True, methods=['post'])
    def issue_certificate(self, request, pk=None):
        """Issue certificate for participant (Admin only)"""
        if not is_admin(request.user):
            return Response({'error': 'Only administrators can issue certificates'}, 
                          status=status.HTTP_403_FORBIDDEN)
        participant = self.get_object()
        
        # Check eligibility
        if not participant.is_eligible_for_certificate():
            return Response({'error': 'Participant does not meet certificate requirements'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if certificate already exists
        cert, created = Certificate.objects.get_or_create(participant=participant)
        
        # Always regenerate and save PDF (in case it was deleted or needs update)
        # Generate PDF
        pdf_buffer = generate_certificate_pdf(cert)
        pdf_buffer.seek(0)
        
        # Save PDF file to Django storage
        from django.core.files.base import ContentFile
        pdf_content = pdf_buffer.read()
        pdf_buffer.seek(0)
        
        cert.pdf_file.save(
            f'certificate_{cert.certificate_number}.pdf',
            ContentFile(pdf_content),
            save=True
        )
        
        # Send email if requested and not already sent
        if created:
            send_email = request.data.get('send_email', True)
            if send_email and not cert.emailed:
                send_certificate_email(cert)
        
        # Update participant status to completed
        participant.status = 'completed'
        participant.save()
        
        return Response(CertificateSerializer(cert).data)


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

    # Ensure user profile exists (with QR code)
    UserProfile.objects.get_or_create(user=user)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data})


@api_view(['GET'])
def me(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'user': None})
    # Ensure user profile exists (with QR code)
    UserProfile.objects.get_or_create(user=request.user)
    return Response({'user': UserSerializer(request.user).data})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    # create a new user (participant) - allow any email
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name') or ''

    if not email or not password:
        return Response({'detail': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user with this email already exists
    if User.objects.filter(email=email).exists():
        return Response({'detail': 'User with this email already exists. Please login instead.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate unique username from email
    base_username = email.split('@')[0]
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    user = User.objects.create_user(username=username, email=email, password=password, first_name=name)
    # Create profile with QR code (handled by signal, but ensure it exists)
    profile, created = UserProfile.objects.get_or_create(user=user)
    token = Token.objects.create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [IsParticipantOrAdmin]
    
    def get_queryset(self):
        """Admins see all, participants see only their own certificates"""
        queryset = Certificate.objects.all()
        
        # Filter by participant if query param provided
        participant_id = self.request.query_params.get('participant', None)
        if participant_id:
            queryset = queryset.filter(participant_id=participant_id)
        
        # Permission-based filtering
        if is_admin(self.request.user):
            return queryset
        # Participants can only see their own certificates
        if self.request.user and self.request.user.is_authenticated:
            return queryset.filter(participant__user=self.request.user)
        return Certificate.objects.none()
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download certificate PDF"""
        certificate = self.get_object()
        if certificate.pdf_file and certificate.pdf_file.name:
            return FileResponse(certificate.pdf_file.open('rb'), 
                              content_type='application/pdf',
                              filename=f'certificate_{certificate.certificate_number}.pdf')
        # Generate PDF on the fly if not saved
        pdf_buffer = generate_certificate_pdf(certificate)
        response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificate_{certificate.certificate_number}.pdf"'
        return response
    
    @action(detail=True, methods=['post'])
    def resend_email(self, request, pk=None):
        """Resend certificate via email (Admin only)"""
        if not is_admin(request.user):
            return Response({'error': 'Only administrators can resend certificates'}, 
                          status=status.HTTP_403_FORBIDDEN)
        certificate = self.get_object()
        success = send_certificate_email(certificate)
        if success:
            return Response({'message': 'Email sent successfully'})
        return Response({'error': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def verify(self, request):
        """Verify certificate by verification code"""
        code = request.query_params.get('code')
        if not code:
            return Response({'error': 'Verification code required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cert = Certificate.objects.get(verification_code=code)
            return Response({
                'valid': True,
                'certificate': CertificateSerializer(cert).data,
                'participant': ParticipantSerializer(cert.participant).data,
                'event': EventSerializer(cert.participant.event).data
            })
        except Certificate.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid verification code'})


@api_view(['GET'])
@permission_classes([IsAdmin])
def reports_attendance(request, event_id):
    """Generate attendance report (Admin only)"""
    try:
        event = Event.objects.get(id=event_id)
        participants = Participant.objects.filter(event=event)
        
        data = []
        for p in participants:
            data.append({
                'Name': p.name,
                'Email': p.email,
                'Status': p.status,
                'Check In': p.check_in_time.strftime('%Y-%m-%d %H:%M:%S') if p.check_in_time else '',
                'Check Out': p.check_out_time.strftime('%Y-%m-%d %H:%M:%S') if p.check_out_time else '',
                'Has Evaluated': 'Yes' if p.has_evaluated else 'No',
                'Quiz Passed': 'Yes' if p.quiz_passed else 'No'
            })
        
        df = pd.DataFrame(data)
        
        format_type = request.query_params.get('format', 'csv')
        if format_type == 'csv':
            output = io.StringIO()
            df.to_csv(output, index=False)
            response = HttpResponse(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="attendance_report_{event_id}.csv"'
            return response
        else:
            # PDF report
            from reportlab.lib.pagesizes import letter  # type: ignore
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle  # type: ignore
            from reportlab.lib import colors  # type: ignore
            
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            
            # Title
            from reportlab.platypus import Paragraph  # type: ignore
            from reportlab.lib.styles import getSampleStyleSheet  # type: ignore
            styles = getSampleStyleSheet()
            elements.append(Paragraph(f"Attendance Report: {event.title}", styles['Title']))
            elements.append(Paragraph(f"Date: {event.date}", styles['Normal']))
            elements.append(Paragraph("", styles['Normal']))  # Spacer
            
            # Table
            table_data = [['Name', 'Email', 'Status', 'Check In', 'Check Out', 'Evaluated', 'Quiz']]
            for p in participants:
                table_data.append([
                    p.name,
                    p.email,
                    p.status,
                    p.check_in_time.strftime('%H:%M') if p.check_in_time else '-',
                    p.check_out_time.strftime('%H:%M') if p.check_out_time else '-',
                    'Yes' if p.has_evaluated else 'No',
                    'Yes' if p.quiz_passed else 'No'
                ])
            
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(table)
            
            doc.build(elements)
            buffer.seek(0)
            response = HttpResponse(buffer.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="attendance_report_{event_id}.pdf"'
            return response
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdmin])
def reports_evaluation(request, event_id):
    """Generate evaluation report (Admin only)"""
    try:
        event = Event.objects.get(id=event_id)
        participants = Participant.objects.filter(event=event, has_evaluated=True)
        
        data = []
        for p in participants:
            eval_data = p.evaluation_data or {}
            data.append({
                'Name': p.name,
                'Email': p.email,
                'Rating': eval_data.get('rating', 'N/A'),
                'Instructor Rating': eval_data.get('instructorRating', 'N/A'),
                'Comments': eval_data.get('comments', ''),
                'Submitted At': p.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        df = pd.DataFrame(data)
        output = io.StringIO()
        df.to_csv(output, index=False)
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="evaluation_report_{event_id}.csv"'
        return response
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAdmin])
def scan_qr_code(request):
    """Scan QR code for attendance (admin-only)"""
    qr_data = request.data.get('qr_data', '')
    event_id = request.data.get('event_id')
    
    if not qr_data:
        return Response({'error': 'QR code data required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not event_id:
        return Response({'error': 'Event ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Parse QR code format: USER-{user_id}-{code}
    if qr_data.startswith('USER-'):
        # User QR code - find user by QR code
        try:
            profile = UserProfile.objects.get(qr_code=qr_data)
            user = profile.user
            
            # Find or create participant for this event
            participant, created = Participant.objects.get_or_create(
                event=event,
                user=user,
                defaults={
                    'name': user.get_full_name() or user.first_name or user.username,
                    'email': user.email,
                    'status': 'registered'
                }
            )
            
            # If participant already exists, update name/email if needed
            if not created:
                if not participant.name or participant.name == 'Anonymous':
                    participant.name = user.get_full_name() or user.first_name or user.username
                if not participant.email:
                    participant.email = user.email
            
            # Mark attendance
            participant.check_in_time = timezone.now()
            participant.status = 'attended'
            logs = participant.attendance_logs or []
            logs.append({
                'type': 'check_in',
                'time': timezone.now().isoformat(),
                'scanned_by': 'admin',
                'qr_code': qr_data
            })
            participant.attendance_logs = logs
            participant.save()
            
            # Update event participants count
            event.participants_count = event.participants.count()
            event.save()
            
            return Response({
                'success': True,
                'participant': ParticipantSerializer(participant).data,
                'user': UserSerializer(user).data,
                'message': f'{participant.name} marked as present'
            })
        except UserProfile.DoesNotExist:
            return Response({'error': 'User not found for this QR code'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    # Legacy support: EVENT-{event_id}-{code} format
    elif qr_data.startswith('EVENT-'):
        # Event QR code - find participant by email or ID
        participant_email = request.data.get('participant_email')
        if participant_email:
            participant = Participant.objects.filter(
                event=event, email=participant_email
            ).first()
            
            if participant:
                participant.check_in_time = timezone.now()
                participant.status = 'attended'
                logs = participant.attendance_logs or []
                logs.append({
                    'type': 'check_in',
                    'time': timezone.now().isoformat(),
                    'scanned_by': 'admin'
                })
                participant.attendance_logs = logs
                participant.save()
                
                return Response({
                    'success': True,
                    'participant': ParticipantSerializer(participant).data,
                    'message': f'{participant.name} marked as present'
                })
    
    return Response({'error': 'Invalid QR code format or participant not found'}, 
                  status=status.HTTP_400_BAD_REQUEST)
