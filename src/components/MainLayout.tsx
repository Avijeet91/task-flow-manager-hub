
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  LogOut, 
  User, 
  Settings 
} from "lucide-react";

const MainLayout: React.FC = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
      admin: false,
    },
    {
      title: "My Tasks",
      icon: <CheckSquare className="h-5 w-5" />,
      path: "/tasks",
      admin: false,
    },
    {
      title: "Employees",
      icon: <Users className="h-5 w-5" />,
      path: "/employees",
      admin: true,
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      path: "/profile",
      admin: false,
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
      admin: false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
          {!collapsed && (
            <h2 className="font-bold text-xl">Task Manager</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map(
              (item) =>
                (!item.admin || isAdmin) && (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
                      collapsed ? "px-3" : "px-4"
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    {!collapsed && <span className="ml-4">{item.title}</span>}
                  </Button>
                )
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-4">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome, {profile?.first_name || user.email}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? "Administrator" : `Employee ID: ${profile?.employee_id}`}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
