"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
} from "@cogniform/ui";
import { Bell, Check } from "lucide-react";

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const data = await api.get<any[]>("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 p-0 text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800 text-slate-200">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="text-xs text-slate-400 font-semibold p-0">
            Notifications ({unreadCount})
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <Check className="h-3 w-3" /> Read All
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-slate-800" />

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="p-3 cursor-pointer focus:bg-slate-800 flex flex-col items-start gap-1"
              >
                <div className="font-semibold text-xs text-white">{n.title}</div>
                <div className="text-xs text-slate-400">{n.message}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
