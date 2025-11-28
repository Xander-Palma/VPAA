import { useState } from "react";
import { useStore, Event } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Calendar as CalendarIcon, MapPin, Clock, MoreHorizontal, Edit, Trash, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function AdminEvents() {
  const { events, addEvent } = useStore();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    location: "",
    requirements: { attendance: true, evaluation: true, quiz: false }
  });

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in required fields." });
      return;
    }

    addEvent({
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title!,
      description: newEvent.description || "",
      date: newEvent.date!,
      timeStart: newEvent.timeStart || "09:00",
      timeEnd: newEvent.timeEnd || "17:00",
      location: newEvent.location || "TBA",
      status: 'upcoming',
      participantsCount: 0,
      requirements: newEvent.requirements || { attendance: true, evaluation: true, quiz: false }
    });

    setIsCreateOpen(false);
    toast({ title: "Event Created", description: "The event has been successfully added." });
    setNewEvent({ title: "", description: "", date: "", timeStart: "", timeEnd: "", location: "", requirements: { attendance: true, evaluation: true, quiz: false } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">Manage seminars, workshops, and activities.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Annual Research Symposium" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Event agenda and details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="Room / Venue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input id="start" type="time" value={newEvent.timeStart} onChange={e => setNewEvent({...newEvent, timeStart: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input id="end" type="time" value={newEvent.timeEnd} onChange={e => setNewEvent({...newEvent, timeEnd: e.target.value})} />
                </div>
              </div>

              <div className="border rounded-md p-4 space-y-4">
                <h4 className="font-medium text-sm">Requirements</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="req-attendance" className="flex flex-col gap-1">
                    <span>Attendance Required</span>
                    <span className="font-normal text-xs text-muted-foreground">Must scan QR code to pass</span>
                  </Label>
                  <Switch id="req-attendance" checked={newEvent.requirements?.attendance} onCheckedChange={c => setNewEvent({...newEvent, requirements: {...newEvent.requirements!, attendance: c}})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="req-eval" className="flex flex-col gap-1">
                    <span>Evaluation Required</span>
                    <span className="font-normal text-xs text-muted-foreground">Must submit feedback form</span>
                  </Label>
                  <Switch id="req-eval" checked={newEvent.requirements?.evaluation} onCheckedChange={c => setNewEvent({...newEvent, requirements: {...newEvent.requirements!, evaluation: c}})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="req-quiz" className="flex flex-col gap-1">
                    <span>Quiz Required</span>
                    <span className="font-normal text-xs text-muted-foreground">Must pass assessment</span>
                  </Label>
                  <Switch id="req-quiz" checked={newEvent.requirements?.quiz} onCheckedChange={c => setNewEvent({...newEvent, requirements: {...newEvent.requirements!, quiz: c}})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent}>Save Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search events..." 
          className="pl-10 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className={
                  event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  event.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-700'
                }>
                  {event.status.toUpperCase()}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" /> View Participants
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="line-clamp-1 text-xl">{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary/70" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary/70" />
                  <span>{event.timeStart} - {event.timeEnd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/70" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-foreground">{event.participantsCount} Participants</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
