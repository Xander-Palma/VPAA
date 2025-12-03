import { useState } from "react";
import * as React from "react";
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
import { Plus, Search, Calendar as CalendarIcon, MapPin, Clock, MoreHorizontal, Edit, Trash, Users, AlertTriangle, CheckCircle, Upload, Award, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function AdminEvents() {
  const { events, addEvent, updateEvent, deleteEvent, participants, concludeEvent, uploadParticipants } = useStore();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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
  const latestFormDataRef = React.useRef<Partial<Event>>(formData);
  
  // Keep ref in sync with formData
  React.useEffect(() => {
    latestFormDataRef.current = formData;
  }, [formData]);
  
  // Memoize the callback to prevent infinite loops
  const handleFormDataChange = React.useCallback((data: Partial<Event>) => {
    setFormData(data);
  }, []);

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
    const currentData = latestFormDataRef.current;
    if (!currentData.title || !currentData.date) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in required fields." });
      return;
    }

    addEvent({
      id: Math.random().toString(36).substr(2, 9),
      title: currentData.title!,
      description: currentData.description || "",
      date: currentData.date!,
      timeStart: currentData.timeStart || "09:00",
      timeEnd: currentData.timeEnd || "17:00",
      location: currentData.location || "TBA",
      status: 'upcoming',
      participantsCount: 0,
      requirements: currentData.requirements || { attendance: true, evaluation: true, quiz: false }
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
  
  const handleConcludeEvent = async (event: Event) => {
    try {
      await concludeEvent(event.id);
      toast({ title: "Event Concluded", description: "Event marked as completed. Evaluation forms released." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message || "Failed to conclude event." });
    }
  };

  const handleViewParticipants = (event: Event) => {
    setSelectedEvent(event);
    setIsParticipantsOpen(true);
  };

  const handleUploadClick = (event: Event) => {
    setSelectedEvent(event);
    setIsUploadOpen(true);
    setUploadFile(null);
  };

  const handleUploadParticipants = async () => {
    if (!selectedEvent || !uploadFile) {
      toast({ variant: "destructive", title: "Error", description: "Please select a file." });
      return;
    }

    try {
      await uploadParticipants(selectedEvent.id, uploadFile);
      toast({ title: "Success", description: "Participants uploaded successfully." });
      setIsUploadOpen(false);
      setUploadFile(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error?.message || "Failed to upload participants." });
    }
  };

  const EventForm = React.memo(({ isEdit = false, onDataChange, initialData, isDialogOpen }: { 
    isEdit?: boolean; 
    onDataChange?: (data: Partial<Event>) => void;
    initialData?: Partial<Event>;
    isDialogOpen?: boolean;
  }) => {
    // Use local state - initialize with empty form
    const defaultFormData = {
      title: "",
      description: "",
      date: "",
      timeStart: "",
      timeEnd: "",
      location: "",
      requirements: { attendance: true, evaluation: true, quiz: false }
    };
    
    const [localFormData, setLocalFormData] = useState<Partial<Event>>(defaultFormData);
    const updateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const onDataChangeRef = React.useRef(onDataChange);
    const prevDialogOpenRef = React.useRef(false);
    
    // Keep ref updated
    React.useEffect(() => {
      onDataChangeRef.current = onDataChange;
    }, [onDataChange]);
    
    // Reset form when dialog opens for create, or load data for edit
    React.useEffect(() => {
      if (isDialogOpen && !prevDialogOpenRef.current) {
        // Dialog just opened
        if (initialData && Object.keys(initialData).length > 0) {
          setLocalFormData(initialData);
        } else {
          setLocalFormData(defaultFormData);
        }
      }
      prevDialogOpenRef.current = isDialogOpen || false;
    }, [isDialogOpen, initialData]);
    
    // Update parent formData for preview (debounced to prevent infinite loops)
    // Only update when dialog is open and data actually changes
    React.useEffect(() => {
      if (!isDialogOpen) return; // Don't update if dialog is closed
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        if (onDataChangeRef.current) {
          onDataChangeRef.current(localFormData);
        }
      }, 500); // Increased debounce to 500ms to reduce interruptions
      
      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, [localFormData, isDialogOpen]); // Only update when dialog is open
    
    const updateField = React.useCallback((field: string, value: any) => {
      setLocalFormData(prev => {
        const updated = { ...prev, [field]: value };
        return updated;
      });
    }, []);
    
    return (
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Event Title</Label>
          <Input 
            id="title" 
            value={localFormData.title || ""} 
            onChange={e => updateField('title', e.target.value)} 
            placeholder="e.g. Annual Research Symposium" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea 
            id="desc" 
            value={localFormData.description || ""} 
            onChange={e => updateField('description', e.target.value)} 
            placeholder="Event agenda and details..." 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={localFormData.date || ""} 
              onChange={e => updateField('date', e.target.value)} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              value={localFormData.location || ""} 
              onChange={e => updateField('location', e.target.value)} 
              placeholder="Room / Venue" 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="start">Start Time</Label>
            <Input 
              id="start" 
              type="time" 
              value={localFormData.timeStart || ""} 
              onChange={e => updateField('timeStart', e.target.value)} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end">End Time</Label>
            <Input 
              id="end" 
              type="time" 
              value={localFormData.timeEnd || ""} 
              onChange={e => updateField('timeEnd', e.target.value)} 
            />
          </div>
        </div>
      
      {isEdit && (
         <div className="grid gap-2">
           <Label htmlFor="status">Event Status</Label>
           <Select 
             value={localFormData.status || "upcoming"} 
             onValueChange={(val: any) => updateField('status', val)}
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
          <Switch 
            id="req-attendance" 
            checked={localFormData.requirements?.attendance ?? true} 
            onCheckedChange={c => updateField('requirements', {...(localFormData.requirements || {}), attendance: c})} 
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="req-eval" className="flex flex-col gap-1">
            <span>Evaluation Required</span>
            <span className="font-normal text-xs text-muted-foreground">Must submit feedback form</span>
          </Label>
          <Switch 
            id="req-eval" 
            checked={localFormData.requirements?.evaluation ?? true} 
            onCheckedChange={c => updateField('requirements', {...(localFormData.requirements || {}), evaluation: c})} 
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="req-quiz" className="flex flex-col gap-1">
            <span>Quiz Required</span>
            <span className="font-normal text-xs text-muted-foreground">Must pass assessment</span>
          </Label>
          <Switch 
            id="req-quiz" 
            checked={localFormData.requirements?.quiz ?? false} 
            onCheckedChange={c => updateField('requirements', {...(localFormData.requirements || {}), quiz: c})} 
          />
        </div>
      </div>
    </div>
    );
  });

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
          <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="preview">Certificate Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <EventForm 
                  onDataChange={handleFormDataChange} 
                  initialData={formData}
                  isDialogOpen={isCreateOpen}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6 border-2 border-primary/20">
                    <div className="aspect-[1.414] bg-white dark:bg-slate-950 rounded-md shadow-xl border-4 border-primary/40 p-12 flex flex-col items-center justify-center relative overflow-hidden max-w-2xl mx-auto">
                      {/* Decorative border corners */}
                      <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-primary/50"></div>
                      <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-primary/50"></div>
                      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-primary/50"></div>
                      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-primary/50"></div>
                      
                      {/* Inner decorative border */}
                      <div className="absolute top-6 left-6 right-6 bottom-6 border-2 border-primary/20"></div>
                      
                      {/* Certificate Content */}
                      <div className="text-center space-y-6 z-10 relative">
                        <div className="space-y-3">
                          <h2 className="text-4xl font-bold text-primary tracking-wide">CERTIFICATE</h2>
                          <h3 className="text-2xl font-bold text-primary/80 tracking-wide">OF PARTICIPATION</h3>
                        </div>
                        
                        <div className="space-y-2 pt-6">
                          <p className="text-base text-slate-600 dark:text-slate-400">This is to certify that</p>
                          <div className="py-3">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white border-b-4 border-primary/40 pb-3 inline-block px-8">
                              {formData.title ? "Participant Name" : "Sample Participant"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 pt-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">has successfully completed the</p>
                          <p className="text-lg font-bold text-primary">
                            {formData.title || "Event Title"}
                          </p>
                          {formData.date && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                              held on {new Date(formData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        
                        <div className="pt-8 flex flex-col items-center gap-3">
                          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-slate-300 dark:border-slate-600">
                            <Award className="h-10 w-10 text-slate-400" />
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">Verification: VERIFY-XXXXXX</p>
                          <p className="text-[10px] text-slate-400 font-mono">Certificate No: CERT-XXXXXX</p>
                        </div>
                        
                        <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700 w-full">
                          <p className="text-sm font-semibold text-primary">VPAA Event Coordination System</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    This preview shows how certificates will appear for participants who complete this event.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
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
            <EventForm 
              isEdit={true} 
              onDataChange={handleFormDataChange}
              initialData={selectedEvent ? { ...selectedEvent } : formData}
              isDialogOpen={isEditOpen}
            />
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

        {/* Upload Participants Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Participants</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel file with columns: name, email
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Select File</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button onClick={handleUploadParticipants} disabled={!uploadFile}>
                Upload
              </Button>
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
                    <DropdownMenuItem onClick={() => handleUploadClick(event)}>
                        <Upload className="mr-2 h-4 w-4" /> Upload Participants (CSV/Excel)
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
            {event.status !== 'completed' && (
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
