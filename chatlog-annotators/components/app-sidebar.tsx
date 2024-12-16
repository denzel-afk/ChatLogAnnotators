"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import CueCard from "@/components/cue-card"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
  },

  navMain: [
    { title: "Home", url: "/home", icon: SquareTerminal, isActive: true },
    { title: "Teams", url: "/teams", icon: Settings2 },
    { title: "Analytics", url: "/analytics", icon: PieChart },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const handleCueCardClick = () => {
    console.log("CueCard clicked");
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
