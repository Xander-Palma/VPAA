import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Award } from "lucide-react";

export default function ParticipantCertificates() {
  const { events, participants, currentUser } = useStore();

  // Find all events where current user has status 'completed'
  const myCertificates = events.filter(e => {
    const parts = participants[e.id] || [];
    const myRecord = parts.find(p => p.email === currentUser?.email);
    return myRecord && myRecord.status === 'completed';
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
          {myCertificates.map(event => (
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
                   </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full gap-2" variant="outline">
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
