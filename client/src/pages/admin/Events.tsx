import { useState } from "react";
import { useStore, Event } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar as CalendarIcon, MapPin, Clock, MoreHorizontal, Edit, Trash, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function AdminEvents() {
  const { events, addEvent, updateEvent, deleteEvent, participants } = useStore();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Event>>({
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      timeStart: "",
      timeEnd: "",
      location: "",
      requirements: { attendance: true, evaluation: true, quiz: false }
    });
  };

  const handleCreateEvent = () => {
    if (!formData.title || !formData.date) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in required fields." });
      return;
    }

    addEvent({
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title!,
      description: formData.description || "",
      date: formData.date!,
      timeStart: formData.timeStart || "09:00",
      timeEnd: formData.timeEnd || "17:00",
      location: formData.location || "TBA",
      status: 'upcoming',
      participantsCount: 0,
      requirements: formData.requirements || { attendance: true, evaluation: true, quiz: false }
    });

    setIsCreateOpen(false);
    resetForm();
    toast({ title: "Event Created", description: "The event has been successfully added." });
  };

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setFormData({ ...event });
    setIsEditOpen(true);
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent || !formData.title) return;

    updateEvent(selectedEvent.id, formData);
    setIsEditOpen(false);
    toast({ title: "Event Updated", description: "Changes have been saved." });
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedEvent) return;
    deleteEvent(selectedEvent.id);
    setIsDeleteOpen(false);
    toast({ title: "Event Deleted", description: "The event has been removed." });
  };
  
  const handleConcludeEvent = (event: Event) => {
    updateEvent(event.id, { status: 'completed' });
    toast({ title: "Event Concluded", description: "Event marked as completed. Evaluation forms released." });
  };

  const handleViewParticipants = (event: Event) => {
    setSelectedEvent(event);
    setIsParticipantsOpen(true);
  };

  const EventForm = ({ isEdit = false }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Event Title</Label>
        <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Annual Research Symposium" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea id="desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Event agenda and details..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Room / Venue" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="start">Start Time</Label>
          <Input id="start" type="time" value={formData.timeStart} onChange={e => setFormData({...formData, timeStart: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end">End Time</Label>
          <Input id="end" type="time" value={formData.timeEnd} onChange={e => setFormData({...formData, timeEnd: e.target.value})} />
        </div>
      </div>
      
      {isEdit && (
         <div className="grid gap-2">
           <Label htmlFor="status">Event Status</Label>
           <Select 
             value={formData.status} 
             onValueChange={(val: any) => setFormData({...formData, status: val})}
           >
             <SelectTrigger>
               <SelectValue placeholder="Status" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="upcoming">Upcoming</SelectItem>
               <SelectItem value="ongoing">Ongoing</SelectItem>
               <SelectItem value="completed">Completed</SelectItem>
             </SelectContent>
           </Select>
         </div>
      )}

      <div className="border rounded-md p-4 space-y-4">
        <h4 className="font-medium text-sm">Requirements</h4>
        <div className="flex items-center justify-between">
          <Label htmlFor="req-attendance" className="flex flex-col gap-1">
            <span>Attendance Required</span>
            <span className="font-normal text-xs text-muted-foreground">Must scan QR code to pass</span>
          </Label>
          <Switch id="req-attendance" checked={formData.requirements?.attendance} onCheckedChange={c => setFormData({...formData, requirements: {...formData.requirements!, attendance: c}})} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="req-eval" className="flex flex-col gap-1">
            <span>Evaluation Required</span>
            <span className="font-normal text-xs text-muted-foreground">Must submit feedback form</span>
          </Label>
          <Switch id="req-eval" checked={formData.requirements?.evaluation} onCheckedChange={c => setFormData({...formData, requirements: {...formData.requirements!, evaluation: c}})} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="req-quiz" className="flex flex-col gap-1">
            <span>Quiz Required</span>
            <span className="font-normal text-xs text-muted-foreground">Must pass assessment</span>
          </Label>
          <Switch id="req-quiz" checked={formData.requirements?.quiz} onCheckedChange={c => setFormData({...formData, requirements: {...formData.requirements!, quiz: c}})} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">Manage seminars, workshops, and activities.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md" onClick={resetForm}>
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <EventForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent}>Save Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <EventForm isEdit={true} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateEvent}>Update Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedEvent?.title}</strong>? This action cannot be undone and will remove all participant records.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>Delete Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Participants Dialog */}
        <Dialog open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Participants: {selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                 Total Registered: {selectedEvent && (participants[selectedEvent.id] || []).length}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-4">
               <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Evaluation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEvent && (!participants[selectedEvent.id] || participants[selectedEvent.id].length === 0) ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                No participants registered yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        selectedEvent && participants[selectedEvent.id].map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell>{p.email}</TableCell>
                                <TableCell>
                                    <Badge variant={p.status === 'attended' || p.status === 'completed' ? 'default' : 'secondary'}>
                                        {p.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {p.hasEvaluated ? (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Submitted</Badge>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                  </TableBody>
               </Table>
            </div>
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
          <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className={`h-2 w-full ${
                event.status === 'ongoing' ? 'bg-green-500' : 
                event.status === 'completed' ? 'bg-slate-400' : 'bg-primary'
            }`} />
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
                    <DropdownMenuItem onClick={() => handleViewParticipants(event)}>
                        <Users className="mr-2 h-4 w-4" /> View Participants
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditClick(event)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(event)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="line-clamp-1 text-xl">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
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
            {event.status === 'ongoing' && (
               <div className="p-4 pt-0 mt-auto">
                  <Button 
                    className="w-full bg-slate-800 hover:bg-slate-700 gap-2" 
                    onClick={() => handleConcludeEvent(event)}
                  >
                    <CheckCircle className="h-4 w-4" /> Conclude Event
                  </Button>
               </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
