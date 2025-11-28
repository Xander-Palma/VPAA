import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileCheck, 
  BarChart3, 
  LogOut, 
  Settings,
  QrCode
} from "lucide-react";
import { useStore } from "@/lib/store";
import generatedImage from '@assets/generated_images/vpaa_event_system_logo.png';

export function Sidebar() {
  const [location] = useLocation();
  const { currentUser, logout } = useStore();
  const isParticipant = currentUser?.role === 'participant';

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/attendance", label: "Attendance", icon: Users },
    { href: "/admin/certificates", label: "Certificates", icon: FileCheck },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ];

  const participantLinks = [
    { href: "/participant/dashboard", label: "Events", icon: Calendar },
    { href: "/participant/my-certificates", label: "My Certificates", icon: FileCheck },
    { href: "/participant/scan", label: "Scan Attendance", icon: QrCode },
  ];

  const links = isParticipant ? participantLinks : adminLinks;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground w-64 border-r border-sidebar-border shadow-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-sidebar-primary flex items-center justify-center overflow-hidden">
           <img src={generatedImage} alt="VPAA Logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold font-heading text-lg leading-tight">VPAA System</h1>
          <p className="text-xs text-sidebar-foreground/70">Event Coordination</p>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                  : "hover:bg-sidebar-accent/10 hover:text-sidebar-accent-foreground/80"
              )}>
                <Icon className="h-4 w-4" />
                {link.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{currentUser?.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser?.email}</p>
          </div>
        </div>
        <button 
          onClick={() => logout()}
          className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
