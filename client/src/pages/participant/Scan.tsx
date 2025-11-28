import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ParticipantScan() {
  const { currentUser } = useStore();

  if (!currentUser) return null;

  // In a real app, this would be a unique secure token
  const qrData = JSON.stringify({
    id: currentUser.id,
    email: currentUser.email,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">My Attendance QR</CardTitle>
          <CardDescription>Show this to the event organizer to check in</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="p-4 bg-white rounded-xl shadow-inner border mb-6">
            <QRCodeSVG value={qrData} size={200} level="H" includeMargin={true} />
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{currentUser.name}</h3>
            <p className="text-sm text-slate-500">{currentUser.email}</p>
            <p className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mt-2 inline-block">
              ID: {currentUser.institutionId || currentUser.id}
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Save to Gallery
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
