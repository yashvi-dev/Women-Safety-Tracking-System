"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, History, User, Settings, LogOut, Bell, Shield } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [notifications, setNotifications] = useState(2)
  const isTrackedUser = pathname.includes("/dashboard/tracked")
  const role = isTrackedUser ? "Tracked User" : "Guardian"
  const roleIcon = isTrackedUser ? User : Shield

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: isTrackedUser ? "/dashboard/tracked" : "/dashboard/guardian",
    },
    {
      title: "Tracking History",
      icon: History,
      href: `${isTrackedUser ? "/dashboard/tracked" : "/dashboard/guardian"}/history`,
    },
    {
      title: "Profile",
      icon: User,
      href: `${isTrackedUser ? "/dashboard/tracked" : "/dashboard/guardian"}/profile`,
    },
    {
      title: "Settings",
      icon: Settings,
      href: `${isTrackedUser ? "/dashboard/tracked" : "/dashboard/guardian"}/settings`,
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">SafeTrack</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-6 mt-2">
                <roleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">{role}</span>
              </div>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">Sarah Johnson</div>
                  <div className="text-muted-foreground text-xs">sarah@example.com</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <LogOut className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <SidebarTrigger />
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <span className="font-bold text-purple-600 dark:text-purple-400">SafeTrack</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
              <ModeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

