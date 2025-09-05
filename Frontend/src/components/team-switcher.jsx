import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import mockLogo from "@/assets/images/mockLogo.png"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    (<SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div
                className="text-primary flex aspect-square text-lg font-pextralight size-8 items-center justify-center ">
              <img src={mockLogo} alt="logo" className="w-7 h-7" />
              </div>
              <div className="grid flex-1 text-left text-lg leading-tight">
                <span className="truncate font-pextralight text-primary">Resume Shaper</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
         
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>)
  );
}
