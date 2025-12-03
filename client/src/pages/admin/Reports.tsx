import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000/api';

const COLORS = ['#0F172A', '#3B82F6', '#F59E0B', '#10B981'];

export default function AdminReports() {
  const { events, participants, token } = useStore();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const { toast } = useToast();

  const handleDownloadReport = async (type: 'attendance' | 'evaluation', format: 'csv' | 'pdf' = 'csv') => {
    if (!selectedEventId) {
      toast({ variant: "destructive", title: "Error", description: "Please select an event first." });
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const url = `${API_BASE}/reports/${type}/${selectedEventId}/?format=${format}`;
      const res = await fetch(url, { headers });
      
      if (!res.ok) throw new Error('Failed to download report');

      const blob = await res.blob();
      const url_obj = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_obj;
      a.download = `${type}_report_${selectedEventId}.${format === 'csv' ? 'csv' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_obj);
      document.body.removeChild(a);

      toast({ title: "Download Started", description: "Report download initiated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message || "Failed to download report." });
    }
  };

  // Calculate aggregate stats
  const eventStats = events.map(e => {
    const parts = participants[e.id] || [];
    return {
      name: e.title.substring(0, 15) + "...",
      registered: parts.length,
      attended: parts.filter(p => p.status === 'attended' || p.status === 'completed').length,
      completed: parts.filter(p => p.status === 'completed').length,
    };
  });

  const totalRegistered = eventStats.reduce((acc, curr) => acc + curr.registered, 0);
  const totalAttended = eventStats.reduce((acc, curr) => acc + curr.attended, 0);
  
  const pieData = [
    { name: 'Attended', value: totalAttended },
    { name: 'Absent', value: totalRegistered - totalAttended },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive data across all events.</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {events.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEventId && (
            <>
              <Button variant="outline" className="gap-2" onClick={() => handleDownloadReport('attendance', 'csv')}>
                <Download className="h-4 w-4" /> Attendance CSV
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleDownloadReport('attendance', 'pdf')}>
                <Download className="h-4 w-4" /> Attendance PDF
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleDownloadReport('evaluation', 'csv')}>
                <Download className="h-4 w-4" /> Evaluation CSV
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Participation Overview</CardTitle>
            <CardDescription>Registered vs Attended per event</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="registered" fill="#94a3b8" name="Registered" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attended" fill="#3B82F6" name="Attended" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>Overall system performance</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-12 ml-32 md:ml-0 md:mt-32">
               {/* Legend overlay or centered text could go here */}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Detailed Event Logs</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="p-4">Event Name</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Registered</th>
                            <th className="p-4">Completion %</th>
                            <th className="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(e => {
                            const parts = participants[e.id] || [];
                            const completed = parts.filter(p => p.status === 'completed').length;
                            const rate = parts.length ? Math.round((completed / parts.length) * 100) : 0;
                            
                            return (
                                <tr key={e.id} className="border-t hover:bg-muted/50 transition-colors">
                                    <td className="p-4 font-medium">{e.title}</td>
                                    <td className="p-4 text-muted-foreground">{e.date}</td>
                                    <td className="p-4">{parts.length}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{width: `${rate}%`}}></div>
                                            </div>
                                            <span>{rate}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            e.status === 'ongoing' ? 'bg-green-100 text-green-700' : 
                                            e.status === 'completed' ? 'bg-slate-100 text-slate-700' : 
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {e.status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
