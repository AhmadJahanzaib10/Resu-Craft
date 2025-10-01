import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  Settings2,
  PlusCircle,
  Sparkles,
  Briefcase,
  UserCircle,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  FolderKanban,
  FileSpreadsheet,
  FileCheck,
  FileClock,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: Briefcase,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Resume Builder",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "My Resumes",
          url: "#",
          icon: FileSpreadsheet,
        },
        {
          title: "Create New",
          url: "#",
          icon: PlusCircle,
        },
      ],
    },
    {
      title: "Cover Letters",
      url: "#",
      icon: FileEdit,
      items: [
        {
          title: "My Letters",
          url: "#",
          icon: FileCheck,
        },
        {
          title: "Create New Cover",
          url: "#",
          icon: PlusCircle,
        },
      ],
    },
    {
      title: "Profile",
      url: "#",
      icon: UserCircle,
    },
  ]
}

export function AppSidebar({ onSectionChange, ...props }) {
  return (
    <Sidebar 
      collapsible="icon" 
      className="bg-white/90 backdrop-blur-lg border-r border-gray-100/50 shadow-sm"
      {...props}
    >
      <SidebarHeader className="bg-transparent border-b border-gray-100/50">
        <div className="flex items-center justify-between px-4 py-3">
          <TeamSwitcher teams={data.teams} />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-transparent">
        <div className="space-y-1 px-2">
          <NavMain items={data.navMain} onSectionChange={onSectionChange} />
        </div>
      </SidebarContent>
      <SidebarFooter className="bg-transparent border-t border-gray-100/50">
        <div className="p-4 space-y-2">
          {/* <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
            <PlusCircle className="h-5 w-5" />
            <span className="font-medium">New Project</span>
          </button> */}
          {/* <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-lg hover:from-primary/20 hover:to-primary/10 transition-colors">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Upgrade to Pro</span>
          </button> */}
        </div>
      </SidebarFooter>
      <SidebarRail className="bg-transparent" />
    </Sidebar>
  );
}
