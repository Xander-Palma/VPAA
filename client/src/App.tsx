import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/Login";
import { Layout } from "@/components/layout/Layout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminEvents from "@/pages/admin/Events";
import AdminAttendance from "@/pages/admin/Attendance";
import AdminCertificates from "@/pages/admin/Certificates";
import AdminReports from "@/pages/admin/Reports";

import ParticipantDashboard from "@/pages/participant/Dashboard";
import ParticipantCertificates from "@/pages/participant/Certificates";
import ParticipantScan from "@/pages/participant/Scan";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      
      {/* Admin Routes - Only accessible by admins */}
      <Route path="/admin/dashboard">
        <Layout requireAdmin={true}>
          <AdminDashboard />
        </Layout>
      </Route>
      <Route path="/admin/events">
        <Layout requireAdmin={true}>
          <AdminEvents />
        </Layout>
      </Route>
      <Route path="/admin/attendance">
         <Layout requireAdmin={true}>
            <AdminAttendance />
         </Layout>
      </Route>
      <Route path="/admin/certificates">
         <Layout requireAdmin={true}>
            <AdminCertificates />
         </Layout>
      </Route>
      <Route path="/admin/reports">
         <Layout requireAdmin={true}>
            <AdminReports />
         </Layout>
      </Route>

      {/* Participant Routes - Only accessible by participants */}
      <Route path="/participant/dashboard">
        <Layout requireParticipant={true}>
          <ParticipantDashboard />
        </Layout>
      </Route>
      <Route path="/participant/my-certificates">
         <Layout requireParticipant={true}>
            <ParticipantCertificates />
         </Layout>
      </Route>
      <Route path="/participant/scan">
         <Layout requireParticipant={true}>
            <ParticipantScan />
         </Layout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
