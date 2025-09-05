"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

export function NavMain({ items, onSectionChange, activeSection }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = activeSection === item.title;
          const hasActiveSubItem = item.items?.some(subItem => activeSection === subItem.title);
          const isSubItemActive = item.items?.some(subItem => activeSection === subItem.title);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || hasActiveSubItem}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`text-sm font-medium transition-all duration-200 rounded-lg px-3 py-2.5
                      ${
                        isActive || isSubItemActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                      }`}
                    onClick={() => !item.items && onSectionChange(item.title)}
                  >
                    {item.icon && (
                      <item.icon className={`size-5 ${(isActive || isSubItemActive) ? 'text-primary' : 'text-gray-500'}`} />
                    )}
                    <span className="ml-2">{item.title}</span>
                    {item.items && (
                      <ChevronDown 
                        className={`ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 ${
                          (isActive || isSubItemActive) ? 'text-primary' : 'text-gray-400'
                        }`} 
                      />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {item.items && (
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <SidebarMenuSub className="mt-1 space-y-1 pl-4">
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <button
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                ${
                                  activeSection === subItem.title
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                                }`}
                              onClick={() => onSectionChange(subItem.title)}
                            >
                              {subItem.icon && (
                                <subItem.icon className={`size-4 ${
                                  activeSection === subItem.title ? 'text-primary' : 'text-gray-500'
                                }`} />
                              )}
                              <span>{subItem.title}</span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
