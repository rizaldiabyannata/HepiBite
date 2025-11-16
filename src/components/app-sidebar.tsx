"use client";

import * as React from "react";
import { BookOpen, Frame, Settings2, Hamburger, Users } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  teams: [
    {
      name: "HepiBite",
      logo: Frame,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Frame,
    },
    {
      title: "Products",
      url: "#",
      icon: Hamburger,
      isActive: true,
      items: [
        {
          title: "All Products",
          url: "/admin/products",
        },
        {
          title: "Categories",
          url: "/admin/categories",
        },
        {
          title: "Vouchers",
          url: "/admin/vouchers",
        },
        {
          title: "Archived",
          url: "/admin/products/archived",
        },
        {
          title: "Store",
          url: "/admin/products/store",
        },
        {
          title: "Partners",
          url: "/admin/partners",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/admin/users",
        },
      ],
    },
    {
      title: "Orders",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Orders Overview",
          url: "/admin/orders",
        },
        {
          title: "Deliveries",
          url: "/admin/deliveries",
        },
        {
          title: "Orders History",
          url: "/admin/orders/history",
        },
        {
          title: "Order Analytics",
          url: "/admin/orders/analytics",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const defaultUser = {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || defaultUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
