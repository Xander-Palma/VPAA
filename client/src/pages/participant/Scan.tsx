import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000/api';

export default function ParticipantScan() {
  const { currentUser, token } = useStore();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user QR code from backend
    if (currentUser && token) {
      fetch(`${API_BASE}/auth/me/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.user?.qr_code) {
            setQrCode(data.user.qr_code);
          } else if (currentUser.qr_code) {
            setQrCode(currentUser.qr_code);
          } else {
            // Fallback: generate QR code from user data
            setQrCode(`USER-${currentUser.id}-${currentUser.email}`);
          }
          setLoading(false);
        })
        .catch(() => {
          // Fallback if API fails
          if (currentUser.qr_code) {
            setQrCode(currentUser.qr_code);
          } else {
            setQrCode(`USER-${currentUser.id}-${currentUser.email}`);
          }
          setLoading(false);
        });
    } else if (currentUser) {
      // Use QR code from currentUser if available
      setQrCode(currentUser.qr_code || `USER-${currentUser.id}-${currentUser.email}`);
      setLoading(false);
    }
  }, [currentUser, token]);

  if (!currentUser) return null;

  const qrData = qrCode || `USER-${currentUser.id}-${currentUser.email}`;

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">My Attendance QR</CardTitle>
          <CardDescription>Show this to the event organizer to check in</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="p-4 bg-white rounded-xl shadow-inner border mb-6">
                <QRCodeSVG value={qrData} size={200} level="H" includeMargin={true} />
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {currentUser.name || currentUser.first_name || currentUser.email}
                </h3>
                <p className="text-sm text-slate-500">{currentUser.email}</p>
                <p className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mt-2 inline-block">
                  QR Code: {qrData}
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              // Copy QR code to clipboard
              navigator.clipboard.writeText(qrData);
              toast({ title: "QR Code copied to clipboard" });
            }}
          >
            <Download className="h-4 w-4" /> Copy QR Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
