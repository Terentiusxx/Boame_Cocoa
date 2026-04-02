"use client";

import { useState } from "react";
import Link from "next/link";
import DiseaseCard from "@/components/DiseaseCard";
import CheckCocoaCard from "@/components/CheckCocoaCard";
import BottomNavigation from "@/components/layout/navbar";
import IconComponent from "@/components/IconComponent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DiseaseData } from "@/lib/types"

type NotificationItem = {
  id: string
  title: string
  message: string
  createdAt?: string
  isRead?: boolean
}

function mapNotifications(payload: unknown): NotificationItem[] {
  const raw = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: unknown }).data
      : []

  if (!Array.isArray(raw)) return []

  return raw.map((item, index) => {
    const i = (item ?? {}) as Record<string, unknown>

    return {
      id: String(i.notification_id ?? i.id ?? index + 1),
      title: String(i.title ?? "Notification"),
      message: String(i.message ?? i.content ?? "No details available."),
      createdAt: typeof i.created_at === "string" ? i.created_at : undefined,
      isRead: Boolean(i.is_read),
    }
  })
}

export default function Home({
  recentScans,
  firstName,
}: {
  recentScans: DiseaseData[]
  firstName?: string | null
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true)
    setNotificationsError(null)

    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Unable to fetch notifications")
      }

      const payload = await response.json()
      setNotifications(mapNotifications(payload))
    } catch {
      setNotificationsError("Failed to load notifications. Please try again.")
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 pb-24 pt-8">
        {/* Greeting */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-brand-text-titles">
            Hey{firstName ? ` ${firstName}` : ''},
          </h1>

          <div className="flex items-center gap-2">
            <Link
              href="/messages"
              aria-label="Open messages"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-green-dark shadow-sm transition hover:bg-brand-green-light/20"
            >
              <IconComponent icon="messages" size={20} />
            </Link>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (open) {
                  void fetchNotifications()
                }
              }}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Open notifications"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-green-dark shadow-sm transition hover:bg-brand-green-light/20"
                >
                  <IconComponent icon="bell" size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader className="flex-row items-center justify-between space-y-0">
                  <DialogTitle>Notifications</DialogTitle>
                  <DialogClose
                    aria-label="Close notifications"
                    className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <IconComponent icon="x" size={20} />
                  </DialogClose>
                </DialogHeader>

                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  {isLoadingNotifications && (
                    <p className="text-sm text-gray-500">Loading notifications...</p>
                  )}

                  {!isLoadingNotifications && notificationsError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{notificationsError}</p>
                  )}

                  {!isLoadingNotifications && !notificationsError && notifications.length === 0 && (
                    <p className="text-sm text-gray-500">No notifications yet.</p>
                  )}

                  {!isLoadingNotifications && !notificationsError && notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-brand-text-titles">{notification.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      {notification.createdAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Check Your Cocoa Card */}
        <CheckCocoaCard />
        
        {/* Previous Scans Section */}
        <div className="mt-8">
          <h2 className="text-base font-bold text-brand-text-titles mb-4">
            Previous Scans
          </h2>
          
          {recentScans.map((disease, index) => (
            <DiseaseCard 
              key={index} 
              id={disease.id}
              name={disease.name}
              urgency={disease.urgency}
              image={disease.image}
              urgencyClass={disease.urgencyClass}
            />
          ))}
          
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}