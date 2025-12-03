import qrcode
import io
from django.core.files.base import ContentFile
from django.utils import timezone
from reportlab.lib.pagesizes import letter, A4  # type: ignore
from reportlab.lib.units import inch, cm  # type: ignore
from reportlab.pdfgen import canvas  # type: ignore
from reportlab.lib import colors  # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image  # type: ignore
from reportlab.lib.enums import TA_CENTER, TA_LEFT  # type: ignore
from PIL import Image as PILImage
import os
from django.conf import settings

def generate_qr_code(data, size=200):
    """Generate QR code image from data"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to bytes
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer

def generate_certificate_pdf(certificate, template_config=None):
    """Generate beautiful PDF certificate for participant"""
    participant = certificate.participant
    event = participant.event
    
    # Create PDF in memory
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Draw decorative border
    border_width = 0.5 * cm
    c.setStrokeColor(colors.HexColor('#1e40af'))
    c.setLineWidth(border_width)
    c.rect(1*cm, 1*cm, width - 2*cm, height - 2*cm, stroke=1, fill=0)
    
    # Inner border
    c.setStrokeColor(colors.HexColor('#3b82f6'))
    c.setLineWidth(0.2 * cm)
    c.rect(1.5*cm, 1.5*cm, width - 3*cm, height - 3*cm, stroke=1, fill=0)
    
    # Decorative corners
    corner_size = 1.5 * cm
    c.setLineWidth(0.3 * cm)
    # Top-left corner
    c.line(1*cm, height - 1*cm, 1*cm + corner_size, height - 1*cm)
    c.line(1*cm, height - 1*cm, 1*cm, height - 1*cm - corner_size)
    # Top-right corner
    c.line(width - 1*cm, height - 1*cm, width - 1*cm - corner_size, height - 1*cm)
    c.line(width - 1*cm, height - 1*cm, width - 1*cm, height - 1*cm - corner_size)
    # Bottom-left corner
    c.line(1*cm, 1*cm, 1*cm + corner_size, 1*cm)
    c.line(1*cm, 1*cm, 1*cm, 1*cm + corner_size)
    # Bottom-right corner
    c.line(width - 1*cm, 1*cm, width - 1*cm - corner_size, 1*cm)
    c.line(width - 1*cm, 1*cm, width - 1*cm, 1*cm + corner_size)
    
    # Header decorative line
    c.setStrokeColor(colors.HexColor('#3b82f6'))
    c.setLineWidth(0.1 * cm)
    c.line(3*cm, height - 3*cm, width - 3*cm, height - 3*cm)
    
    # Title
    c.setFont("Helvetica-Bold", 42)
    c.setFillColor(colors.HexColor('#1e40af'))
    title_y = height - 4*cm
    c.drawCentredString(width/2, title_y, "CERTIFICATE")
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(width/2, title_y - 1.2*cm, "OF PARTICIPATION")
    
    # Subtitle
    c.setFont("Helvetica", 16)
    c.setFillColor(colors.HexColor('#64748b'))
    c.drawCentredString(width/2, title_y - 3*cm, "This is to certify that")
    
    # Participant name with underline
    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(colors.HexColor('#0f172a'))
    name_y = title_y - 4.5*cm
    name_width = c.stringWidth(participant.name, "Helvetica-Bold", 28)
    c.drawCentredString(width/2, name_y, participant.name)
    # Underline
    c.setStrokeColor(colors.HexColor('#3b82f6'))
    c.setLineWidth(0.15 * cm)
    c.line((width - name_width)/2 - 0.5*cm, name_y - 0.3*cm, 
           (width + name_width)/2 + 0.5*cm, name_y - 0.3*cm)
    
    # Event details
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.HexColor('#475569'))
    detail_y = name_y - 2*cm
    c.drawCentredString(width/2, detail_y, "has successfully completed the")
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(colors.HexColor('#1e40af'))
    c.drawCentredString(width/2, detail_y - 0.8*cm, event.title)
    
    if event.date:
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.HexColor('#64748b'))
        c.drawCentredString(width/2, detail_y - 1.8*cm, f"held on {event.date}")
    
    # QR Code for verification
    qr_data = certificate.verification_code
    qr_img_buffer = generate_qr_code(qr_data, size=120)
    qr_img_buffer.seek(0)
    # Use PIL to open and convert QR code
    qr_pil = PILImage.open(qr_img_buffer)
    # Resize QR code (2cm = ~56.7 points at 72 DPI)
    qr_size_points = 2 * cm  # reportlab uses points, 1cm = 28.35 points
    qr_pil = qr_pil.resize((int(qr_size_points), int(qr_size_points)), PILImage.Resampling.LANCZOS)
    qr_buffer = io.BytesIO()
    qr_pil.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    # Use reportlab's Image from platypus for canvas
    from reportlab.lib.utils import ImageReader  # type: ignore
    qr_image_reader = ImageReader(qr_buffer)
    qr_x = width/2 - qr_size_points/2
    qr_y = 4*cm
    c.drawImage(qr_image_reader, qr_x, qr_y, width=qr_size_points, height=qr_size_points)
    
    # Verification code
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor('#94a3b8'))
    c.drawCentredString(width/2, qr_y - 0.5*cm, f"Verification: {certificate.verification_code}")
    
    # Certificate number
    c.setFont("Helvetica", 9)
    c.drawCentredString(width/2, qr_y - 0.9*cm, f"Certificate No: {certificate.certificate_number}")
    
    # Date issued
    issued_date = certificate.issued_at.strftime("%B %d, %Y") if certificate.issued_at else timezone.now().strftime("%B %d, %Y")
    c.setFont("Helvetica", 9)
    c.drawCentredString(width/2, qr_y - 1.3*cm, f"Issued on {issued_date}")
    
    # Footer decorative line
    c.setStrokeColor(colors.HexColor('#3b82f6'))
    c.setLineWidth(0.1 * cm)
    c.line(3*cm, 2.5*cm, width - 3*cm, 2.5*cm)
    
    # Organization name
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.HexColor('#1e40af'))
    c.drawCentredString(width/2, 1.5*cm, "VPAA Event Coordination System")
    
    c.save()
    buffer.seek(0)
    return buffer

def send_certificate_email(certificate):
    """Send certificate via email"""
    try:
        from sendgrid import SendGridAPIClient  # type: ignore
        from sendgrid.helpers.mail import Mail  # type: ignore
        import os
        
        participant = certificate.participant
        event = participant.event
        
        # Generate PDF
        pdf_buffer = generate_certificate_pdf(certificate)
        pdf_buffer.seek(0)
        
        # Get SendGrid API key from environment
        sg_api_key = os.environ.get('SENDGRID_API_KEY')
        if not sg_api_key:
            # Fallback to SMTP if SendGrid not configured
            return send_certificate_email_smtp(certificate, pdf_buffer)
        
        message = Mail(
            from_email=os.environ.get('SENDGRID_FROM_EMAIL', 'noreply@vpaa.edu'),
            to_emails=participant.email,
            subject=f'Your Certificate: {event.title}',
            html_content=f'''
            <html>
            <body>
                <h2>Congratulations, {participant.name}!</h2>
                <p>You have successfully completed <strong>{event.title}</strong>.</p>
                <p>Your certificate is attached to this email.</p>
                <p>Verification Code: <strong>{certificate.verification_code}</strong></p>
                <p>You can verify your certificate using the QR code on the document.</p>
                <br>
                <p>Best regards,<br>VPAA Event Coordination System</p>
            </body>
            </html>
            '''
        )
        
        # Attach PDF
        message.attachment = pdf_buffer.read()
        message.attachment.filename = f'Certificate_{certificate.certificate_number}.pdf'
        message.attachment.type = 'application/pdf'
        
        sg = SendGridAPIClient(sg_api_key)
        response = sg.send(message)
        
        certificate.emailed = True
        certificate.emailed_at = timezone.now()
        certificate.save()
        
        return True
    except Exception as e:
        print(f"SendGrid email error: {e}")
        # Fallback to SMTP
        return send_certificate_email_smtp(certificate, pdf_buffer)

def send_certificate_email_smtp(certificate, pdf_buffer=None):
    """Fallback SMTP email sending"""
    try:
        from django.core.mail import EmailMessage
        
        if pdf_buffer is None:
            pdf_buffer = generate_certificate_pdf(certificate)
            pdf_buffer.seek(0)
        
        participant = certificate.participant
        event = participant.event
        
        pdf_content = pdf_buffer.read()
        pdf_buffer.seek(0)
        
        email = EmailMessage(
            subject=f'Your Certificate: {event.title}',
            body=f'''
            Congratulations, {participant.name}!
            
            You have successfully completed {event.title}.
            Your certificate is attached to this email.
            
            Verification Code: {certificate.verification_code}
            
            Best regards,
            VPAA Event Coordination System
            ''',
            from_email=os.environ.get('EMAIL_FROM', 'noreply@vpaa.edu'),
            to=[participant.email],
        )
        
        email.attach(f'Certificate_{certificate.certificate_number}.pdf', 
                    pdf_content, 'application/pdf')
        email.send()
        
        certificate.emailed = True
        certificate.emailed_at = timezone.now()
        certificate.save()
        
        return True
    except Exception as e:
        print(f"SMTP email error: {e}")
        return False

