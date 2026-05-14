import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "./ui/sidebar";
import {
  BarChart3,
  Users,
  ClipboardList,
  TrendingUp,
  Settings,
  Check,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAppContext } from "@/context/context";
import { logout } from "@/methods/logout";

export function DashboardSidebar() {
  const { user, setUser, setIsAuthenticated } = useAppContext();
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "U";
  const fullName = user?.name || "Unknown User";

  const handleLogout = () => {
    logout({ setUser, setIsAuthenticated });
  };

  const navigation = [
    {
      title: "Dashboard",
      icon: TrendingUp,
      href: "/dashboard",
    },
    {
      title: "Projects",
      icon: Users,
      href: "/projects",
    },
    {
      title: "Tasks",
      icon: ClipboardList,
      href: "/tasks",
    },
    ...(user?.role === 'ADMIN' || user?.isProjectAdmin ? [{
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    }] : []),
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
    {
      title: "Logout",
      icon: LogOut,
      action: handleLogout,
    },
  ];


  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="p-6 border-b border-slate-200">
        <div id="logo" className="sm:w-52 w-44">
          <img src="/logo.png" alt="Logo" className="w-full h-auto object-contain" />
        </div>

      </SidebarHeader>

      <SidebarContent className="p-4 overflow-y-auto">
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!item.action}
                onClick={item.action || undefined}
                className="w-full justify-start"
              >
                {item.action ? (
                  <div className="flex items-center space-x-3 px-3 py-2 cursor-pointer">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                ) : (
                  <a href={item.href} className="flex items-center space-x-3 px-3 py-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm">
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">{fullName}</p>
            <p className="text-xs text-slate-500">Frontend Developer</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
