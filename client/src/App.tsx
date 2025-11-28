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
import ParticipantDashboard from "@/pages/participant/Dashboard";

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
            <div className="p-4">Attendance Module (Coming Soon)</div>
         </Layout>
      </Route>
      <Route path="/admin/certificates">
         <Layout>
            <div className="p-4">Certificate Module (Coming Soon)</div>
         </Layout>
      </Route>
      <Route path="/admin/reports">
         <Layout>
            <div className="p-4">Reports Module (Coming Soon)</div>
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
            <div className="p-4">My Certificates (Coming Soon)</div>
         </Layout>
      </Route>
      <Route path="/participant/scan">
         <Layout>
            <div className="p-4">QR Scanner (Coming Soon)</div>
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
