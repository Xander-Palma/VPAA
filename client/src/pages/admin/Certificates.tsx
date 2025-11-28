import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCheck, Download, Mail, RefreshCcw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCertificates() {
  const { events, participants, issueCertificate } = useStore();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const { toast } = useToast();

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventParticipants = selectedEventId ? (participants[selectedEventId] || []) : [];
  
  // Logic for eligibility: Must have attended. 
  // If evaluation is required, must have evaluated.
  const isEligible = (p: any) => {
    if (!selectedEvent) return false;
    const attended = p.status === 'attended' || p.status === 'completed';
    const evalReq = selectedEvent.requirements.evaluation;
    const hasEval = p.hasEvaluated;
    
    if (!attended) return false;
    if (evalReq && !hasEval) return false;
    
    return p.status !== 'completed'; // Already issued
  };

  const eligibleParticipants = eventParticipants.filter(isEligible);
  const completedParticipants = eventParticipants.filter(p => p.status === 'completed');

  const handleIssueCertificate = (participantId: string) => {
    issueCertificate(selectedEventId, participantId);
    toast({
      title: "Certificate Issued",
      description: "The certificate has been generated and sent.",
    });
  };

  const handleBulkIssue = () => {
    eligibleParticipants.forEach(p => issueCertificate(selectedEventId, p.id));
    toast({
      title: "Bulk Action Complete",
      description: `Issued certificates to ${eligibleParticipants.length} participants.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
        <p className="text-muted-foreground">Manage and issue certificates for completed events.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Certificate Management</CardTitle>
              <CardDescription>Issue certificates to eligible participants</CardDescription>
            </div>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select Event to Manage" />
              </SelectTrigger>
              <SelectContent>
                {events.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedEventId ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Please select an event to view certificate status</p>
            </div>
          ) : (
            <Tabs defaultValue="eligible">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="eligible">Eligible ({eligibleParticipants.length})</TabsTrigger>
                  <TabsTrigger value="issued">Issued ({completedParticipants.length})</TabsTrigger>
                </TabsList>
                {eligibleParticipants.length > 0 && (
                  <Button onClick={handleBulkIssue} className="gap-2">
                    <RefreshCcw className="h-4 w-4" /> Issue All Pending
                  </Button>
                )}
              </div>

              <TabsContent value="eligible">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Requirements</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligibleParticipants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No pending eligible participants.
                        </TableCell>
                      </TableRow>
                    ) : (
                      eligibleParticipants.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Attended
                                </Badge>
                                {p.hasEvaluated && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Evaluated
                                    </Badge>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => handleIssueCertificate(p.id)}>
                              Issue Certificate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="issued">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Date Issued</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedParticipants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No certificates issued yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedParticipants.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{new Date().toLocaleDateString()}</TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            <Button size="icon" variant="outline" title="Download PDF">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" title="Resend Email">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
