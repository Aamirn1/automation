import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Zap, LayoutDashboard, Users, CreditCard, FileVideo, CalendarClock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: FileVideo, label: "Content", path: "/admin/content" },
  { icon: CalendarClock, label: "Schedules", path: "/admin/schedules" },
];

export default function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/dashboard");
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Zap className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed top-0 left-0 h-full w-60 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col z-40">
        <div className="flex items-center gap-2 p-4 border-b border-border h-16">
          <Zap className="h-5 w-5 text-primary shrink-0" />
          <span className="text-shine text-lg font-bold font-heading truncate">Admin Panel</span>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-60">
        <header className="h-16 border-b border-border flex items-center px-6">
          <div className="text-sm text-muted-foreground">
            Admin: <span className="text-foreground font-medium">{user?.email}</span>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
