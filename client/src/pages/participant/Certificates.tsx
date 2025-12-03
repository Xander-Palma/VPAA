import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000/api';

export default function ParticipantCertificates() {
  const { events, participants, currentUser, token, fetchEvents } = useStore();
  const { toast } = useToast();
  
  // Refresh events to get latest certificate data when component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDownloadCertificate = async (participant: any) => {
    if (!participant.certificate) {
      toast({ variant: "destructive", title: "Error", description: "Certificate not yet issued." });
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      // Try to find certificate by participant ID first
      let certId = null;
      
      // If participant has certificate data, use it directly
      if (participant.certificate && participant.certificate.certificate_number) {
        // Try to find certificate by participant
        const certRes = await fetch(`${API_BASE}/certificates/?participant=${participant.id}`, { headers });
        if (certRes.ok) {
          const certs = await certRes.json();
          const cert = certs.results?.[0] || certs[0] || certs;
          if (cert && cert.id) {
            certId = cert.id;
          }
        }
      }
      
      // If we have a certificate ID, download it
      if (!certId) {
        // Try alternative: get all certificates and find by participant
        const certRes = await fetch(`${API_BASE}/certificates/`, { headers });
        if (certRes.ok) {
          const certs = await certRes.json();
          const allCerts = certs.results || certs;
          const cert = allCerts.find((c: any) => 
            c.participant === participant.id || 
            String(c.participant) === String(participant.id)
          );
          if (cert && cert.id) {
            certId = cert.id;
          }
        }
      }
      
      if (!certId) {
        throw new Error('Certificate not found. Please ensure the certificate has been issued.');
      }
      
      const res = await fetch(`${API_BASE}/certificates/${certId}/download/`, { headers });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to download certificate' }));
        throw new Error(error.error || 'Failed to download certificate');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const certNumber = participant.certificate?.certificate_number || certId || 'certificate';
      a.download = `certificate_${certNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Download Started", description: "Certificate download initiated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message || "Failed to download certificate." });
    }
  };

  // Find all events where current user has a certificate
  // Participants can only see their own certificates
  // Certificate can exist if status is 'attended' or 'completed'
  const myCertificates = events.filter(e => {
    const parts = participants[e.id] || [];
    const myRecord = parts.find((p: any) => {
      if (!currentUser) return false;
      if (p.email && p.email === currentUser.email) return true;
      if (p.user && currentUser.id) {
        const pUserId = typeof p.user === 'object' ? p.user.id : p.user;
        return String(pUserId) === String(currentUser.id);
      }
      return false;
    });
    // Show certificate if it exists, regardless of status (certificate issuance means they completed requirements)
    return myRecord && myRecord.certificate;
  }).map(e => {
    const parts = participants[e.id] || [];
    const myRecord = parts.find((p: any) => {
      if (!currentUser) return false;
      if (p.email && p.email === currentUser.email) return true;
      if (p.user && currentUser.id) {
        const pUserId = typeof p.user === 'object' ? p.user.id : p.user;
        return String(pUserId) === String(currentUser.id);
      }
      return false;
    });
    return { event: e, participant: myRecord };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Certificates</h2>
        <p className="text-muted-foreground">View and download your earned certificates.</p>
      </div>

      {myCertificates.length === 0 ? (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Award className="h-16 w-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Certificates Yet</h3>
                <p className="text-slate-500 max-w-sm mt-2">
                    Complete events and ensure your attendance is marked to earn certificates.
                </p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCertificates.map(({ event, participant }) => (
            <Card key={event.id} className="bg-white dark:bg-slate-950 border-2 border-primary/10 overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="h-3 bg-primary w-full" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-start gap-2">
                    <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {event.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> {event.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="aspect-[1.414] bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center border relative overflow-hidden group-hover:shadow-lg transition-all">
                   <div className="text-center p-4 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500">
                      <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-2">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Certificate of Completion</p>
                      <p className="font-serif text-xs mt-1">Presented to</p>
                      <p className="font-bold text-sm text-primary">{currentUser?.name}</p>
                      {participant?.certificate && (
                        <p className="text-[8px] text-slate-400 mt-2">Code: {participant.certificate.verification_code}</p>
                      )}
                   </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2" 
                  variant="outline"
                  onClick={() => participant && handleDownloadCertificate(participant)}
                >
                    <Download className="h-4 w-4" /> Download PDF
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
