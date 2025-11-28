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
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <Layout>
          <AdminDashboard />
        </Layout>
      </Route>
      <Route path="/admin/events">
        <Layout>
          <AdminEvents />
        </Layout>
      </Route>
      <Route path="/admin/attendance">
         <Layout>
            <AdminAttendance />
         </Layout>
      </Route>
      <Route path="/admin/certificates">
         <Layout>
            <AdminCertificates />
         </Layout>
      </Route>
      <Route path="/admin/reports">
         <Layout>
            <AdminReports />
         </Layout>
      </Route>

      {/* Participant Routes */}
      <Route path="/participant/dashboard">
        <Layout>
          <ParticipantDashboard />
        </Layout>
      </Route>
      <Route path="/participant/my-certificates">
         <Layout>
            <ParticipantCertificates />
         </Layout>
      </Route>
      <Route path="/participant/scan">
         <Layout>
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
