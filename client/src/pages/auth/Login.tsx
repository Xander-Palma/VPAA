import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register } = useStore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("participant");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Admin login via API (same as participant)
    if (activeTab === "admin") {
      if (email !== "adminvpaa@gmail.com") {
        setError("Please use adminvpaa@gmail.com for admin access");
        setIsLoading(false);
        return;
      }
      
      try {
        await login(email, password);
        toast({ title: "Welcome back, Admin!" });
        setLocation("/admin/dashboard");
      } catch (err: any) {
        setError(err?.message || "Invalid credentials. Make sure the admin user exists in the database.");
        setIsLoading(false);
      }
    } else {
      // Participant login - allow any email, if account doesn't exist, register then login
      if (!email || !password) {
        setError("Please enter your email and password.");
        setIsLoading(false);
        return;
      }

      try {
        await login(email, password);
        toast({ title: "Login Successful" });
        setLocation("/participant/dashboard");
      } catch (err: any) {
        // if login failed, attempt to register the participant (auto-create)
        try {
          const name = email.split("@")[0];
          await register(email, name, password);
          toast({ title: "Account created and logged in" });
          setLocation("/participant/dashboard");
        } catch (regErr: any) {
          setError(regErr?.message || 'Unable to login or create account.');
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your VPAA account</p>
        </div>

        {/* Form */}
        <Card className="p-6 border border-border bg-card">
          <Tabs defaultValue="participant" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="participant">Participant</TabsTrigger>
              <TabsTrigger value="admin">Administrator</TabsTrigger>
            </TabsList>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={activeTab === "admin" ? "adminvpaa@gmail.com" : "your@email.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Info Text */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              {activeTab === "admin" ? (
                <p>Only authorized personnel can access the admin panel.</p>
              ) : (
                <p>Use your email to login. New users will be automatically registered.</p>
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
