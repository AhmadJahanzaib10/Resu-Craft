"use client"

import {
  User,
  Shield,
  CreditCard,
  LogOut,
  Sparkles,
  Bell,
  Settings2,
  ChevronDown,
  HelpCircle,
  Mail,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user, onLogout
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu className="bg-white/90 backdrop-blur-lg hover:bg-white/95 rounded-xl transition-all duration-200 shadow-sm border border-gray-100/50">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-gray-50/50 data-[state=open]:text-gray-900 hover:bg-gray-50/50 transition-colors duration-200">
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-gray-900">{user.name}</span>
                <span className="truncate text-xs text-gray-500">{user.email}</span>
              </div>
              <ChevronDown className="ml-auto size-4 text-gray-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg border border-gray-100/50 backdrop-blur-lg bg-white/95"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg ring-2 ring-primary/10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-gray-900">{user.name}</span>
                  <span className="truncate text-xs text-gray-500">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator className="bg-gray-100/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:bg-gray-50/50 cursor-pointer">
                <Sparkles className="size-4 text-primary" />
                <span>Upgrade to Pro</span>
                <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-100/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:bg-gray-50/50 cursor-pointer">
                <User className="size-4 text-primary" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:bg-gray-50/50 cursor-pointer">
                <Shield className="size-4 text-primary" />
                <span>Security</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:bg-gray-50/50 cursor-pointer">
                <CreditCard className="size-4 text-primary" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:bg-gray-50/50 cursor-pointer">
                <Mail className="size-4 text-primary" />
                <span>Messages</span>
                <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">3</span>
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator className="bg-gray-100/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:bg-gray-50/50 cursor-pointer">
                <HelpCircle className="size-4 text-primary" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:bg-gray-50/50 cursor-pointer">
                <Settings2 className="size-4 text-primary" />
                <span>Settings</span>
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-100/50" />
            <DropdownMenuItem 
              onClick={onLogout} 
              className="flex items-center gap-2 text-red-600 hover:bg-red-50/50 cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
