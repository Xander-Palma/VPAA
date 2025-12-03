import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, QrCode, CheckCircle, XCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminAttendance() {
  const { events, participants, markAttendance, token, fetchEvents } = useStore();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventParticipants = selectedEventId ? (participants[selectedEventId] || []) : [];

  const filteredParticipants = eventParticipants.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScanQR = async (qrData: string) => {
    if (!selectedEventId || !qrData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an event and scan a valid QR code.",
      });
      return;
    }

    setIsScanning(true);
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000/api';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const res = await fetch(`${API_BASE}/scan/qr/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          qr_data: qrData,
          event_id: selectedEventId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Scan failed');
      }

      const data = await res.json();
      toast({
        title: "Scan Successful",
        description: data.message || `${data.participant?.name} marked as present.`,
      });
      
      // Refresh events to update participant list
      if (fetchEvents) {
        await fetchEvents();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: error?.message || "Invalid QR code or participant not found.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSimulateScan = async () => {
    // For testing: simulate scanning a random participant's QR
    const registered = eventParticipants.filter(p => p.status === 'registered');
    if (registered.length > 0) {
      const randomP = registered[Math.floor(Math.random() * registered.length)];
      // Generate QR code format: USER-{user_id}-{code}
      const qrData = `USER-${randomP.user || randomP.id}-TEST${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await handleScanQR(qrData);
    } else {
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "No pending participants found. Participants need to register first.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance Monitor</h2>
        <p className="text-muted-foreground">Track real-time check-ins and participant status.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Participant List</CardTitle>
            <CardDescription>Select an event to manage attendance</CardDescription>
            <div className="flex gap-4 mt-4">
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search participants..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  disabled={!selectedEventId}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedEventId ? (
              <div className="text-center py-12 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Please select an event to view participants</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No participants found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipants.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'attended' || p.status === 'completed' ? 'default' : 'secondary'} 
                            className={p.status === 'attended' ? 'bg-green-500' : ''}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.checkInTime || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status === 'registered' ? (
                            <Button size="sm" variant="outline" onClick={async () => {
                              try {
                                await markAttendance(p.id, 'attended');
                                toast({ title: "Success", description: `${p.name} marked as present.` });
                              } catch (error: any) {
                                toast({ variant: "destructive", title: "Error", description: error?.message || "Failed to mark attendance." });
                              }
                            }}>
                              Mark Present
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" disabled>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Checked In
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Camera className="h-5 w-5" /> Scanner Mode
              </CardTitle>
              <CardDescription className="text-slate-400">
                Scan participant QR codes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 min-h-[300px]">
              {selectedEventId ? (
                isScanning ? (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div className="w-full h-full relative overflow-hidden">
                       <div className="absolute inset-0 animate-pulse bg-green-500/10 z-10"></div>
                       <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                       <div className="flex flex-col items-center justify-center h-full text-white z-20">
                         <QrCode className="h-24 w-24 opacity-50 mb-4" />
                         <p>Scanning...</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-48 w-48 border-4 border-slate-700 rounded-xl flex items-center justify-center mb-6 relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
                      <QrCode className="h-20 w-20 text-slate-700" />
                    </div>
                    <Button 
                      className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold"
                      onClick={handleSimulateScan}
                    >
                      Activate Camera
                    </Button>
                    <p className="text-xs text-center mt-3 text-slate-500">
                      Requires camera permission. <br/> Use mock scan for testing.
                    </p>
                  </>
                )
              ) : (
                <div className="text-center text-slate-500">
                  <p>Select an event to enable scanner</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Registered</span>
                  <span className="font-bold">{eventParticipants.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Present</span>
                  <span className="font-bold text-green-600">
                    {eventParticipants.filter(p => p.status === 'attended' || p.status === 'completed').length}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ 
                      width: `${eventParticipants.length ? (eventParticipants.filter(p => p.status === 'attended' || p.status === 'completed').length / eventParticipants.length) * 100 : 0}%` 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
