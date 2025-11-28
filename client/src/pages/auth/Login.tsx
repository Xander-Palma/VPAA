import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import generatedImage from '@assets/generated_images/vpaa_event_system_logo.png';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useStore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("participant");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded credentials check as per request
    if (activeTab === "admin") {
      if (email === "adminvpaa@gmail.com" && password === "admin123") {
        login({
          id: "admin1",
          email: "adminvpaa@gmail.com",
          name: "VPAA Admin",
          role: "admin"
        });
        toast({ title: "Welcome back, Admin!" });
        setLocation("/admin/dashboard");
      } else {
        toast({ variant: "destructive", title: "Invalid credentials", description: "Please check your email and password." });
      }
    } else {
      // User login logic
      if (email.endsWith("@hcdc.edu.ph") && password) {
        login({
          id: "user-" + Math.random().toString(36).substr(2, 9),
          email: email,
          name: email.split("@")[0], // Mock name from email
          role: "participant",
          institutionId: "ID-" + Math.random().toString().substr(2, 6)
        });
        toast({ title: "Login Successful" });
        setLocation("/participant/dashboard");
      } else {
        toast({ variant: "destructive", title: "Login Failed", description: "Please use a valid @hcdc.edu.ph email." });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="h-20 w-20 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/20">
            <img src={generatedImage} alt="Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">VPAA Event System</h1>
          <p className="text-slate-500 dark:text-slate-400">Academic Event Coordination & Certificates</p>
        </div>

        <Card className="border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="participant" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="participant">Participant</TabsTrigger>
                <TabsTrigger value="admin">Administrator</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      placeholder={activeTab === "admin" ? "adminvpaa@gmail.com" : "name@hcdc.edu.ph"} 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11">
                  Sign In as {activeTab === "admin" ? "Admin" : "Participant"}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-400">
                {activeTab === "admin" ? (
                  <p>Only authorized personnel can access the admin panel.</p>
                ) : (
                  <p>Use your institutional email to login.</p>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
