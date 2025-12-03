import { Sidebar } from "./Sidebar";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireParticipant?: boolean;
}

export function Layout({ children, requireAdmin, requireParticipant }: LayoutProps) {
  const { currentUser } = useStore();
  const [, setLocation] = useLocation();
  const isAdmin = currentUser?.role === 'admin';
  const isParticipant = currentUser?.role === 'participant' || (!isAdmin && currentUser);

  useEffect(() => {
    if (!currentUser) {
      setLocation("/");
      return;
    }

    // Check route permissions
    if (requireAdmin && !isAdmin) {
      setLocation("/participant/dashboard");
      return;
    }

    if (requireParticipant && !isParticipant) {
      setLocation("/admin/dashboard");
      return;
    }
  }, [currentUser, isAdmin, isParticipant, requireAdmin, requireParticipant, setLocation]);

  if (!currentUser) return null;

  // Redirect if wrong role
  if (requireAdmin && !isAdmin) return null;
  if (requireParticipant && !isParticipant) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl animate-in fade-in duration-500 slide-in-from-bottom-4">
          {children}
        </div>
      </main>
    </div>
  );
}
