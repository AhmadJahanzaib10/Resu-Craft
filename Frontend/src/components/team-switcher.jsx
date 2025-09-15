import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import Logo from "@/assets/images/logo.png"

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
                className="text-primary w-100 flex aspect-square text-lg font-pextralight size-8 items-center justify-center ">
              <img src={Logo} alt="logo" className="w-100" />
              </div>
              {/* <div className="grid flex-1 text-left text-lg leading-tight">
                <span className="truncate font-pextralight text-primary">Resume Shaper</span>
              </div> */}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
         
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>)
  );
}
