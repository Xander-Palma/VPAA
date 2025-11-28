import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ParticipantDashboard() {
  const { events, currentUser, joinEvent, participants } = useStore();
  const { toast } = useToast();

  const handleJoin = (eventId: string) => {
    if (currentUser) {
      joinEvent(eventId, currentUser);
      toast({ title: "Success", description: "You have joined the event." });
    }
  };

  const isRegistered = (eventId: string) => {
    const eventParticipants = participants[eventId] || [];
    return eventParticipants.some(p => p.email === currentUser?.email);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome, {currentUser?.name}</h2>
        <p className="text-muted-foreground">Browse and join upcoming academic events.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const registered = isRegistered(event.id);
          
          return (
            <Card key={event.id} className="flex flex-col shadow-sm hover:shadow-md transition-all">
              <div className="h-32 bg-gradient-to-br from-primary/80 to-accent/80 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Calendar className="w-24 h-24" />
                </div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-2">
                  {event.status.toUpperCase()}
                </Badge>
                <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
              </div>
              
              <CardContent className="flex-1 pt-4 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{event.timeStart} - {event.timeEnd}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Requirements</p>
                    <div className="flex flex-wrap gap-2">
                        {event.requirements.attendance && <Badge variant="outline" className="text-xs">Attendance</Badge>}
                        {event.requirements.evaluation && <Badge variant="outline" className="text-xs">Evaluation</Badge>}
                        {event.requirements.quiz && <Badge variant="outline" className="text-xs">Quiz</Badge>}
                    </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                {registered ? (
                  <Button variant="secondary" className="w-full gap-2 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100" disabled>
                    <CheckCircle2 className="h-4 w-4" /> Registered
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleJoin(event.id)}>
                    Join Event
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
