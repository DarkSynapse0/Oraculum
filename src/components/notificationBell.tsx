/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Circle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    if (json.data) {
      setNotifications(json.data);
      setUnreadCount(json.data.filter((n: any) => !n.is_read).length);
    }
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      body: JSON.stringify({ all: true }),
    });
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    // In a real app, you'd also listen to Supabase Realtime here
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 overflow-hidden shadow-2xl border-border/50"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Notifications
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-7 px-2 text-[10px] font-bold text-primary gap-1.5 hover:bg-primary/10"
          >
            <CheckCheck size={12} /> Mark all read
          </Button>
        </div>

        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((n: any) => (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 px-4 py-4 border-b border-border/30 transition-colors cursor-pointer hover:bg-muted/30",
                  !n.is_read && "bg-primary/5 hover:bg-primary/10",
                )}
                onClick={() => (window.location.href = n.link)}
              >
                {!n.is_read && (
                  <Circle className="h-2 w-2 mt-1.5 fill-primary text-primary shrink-0" />
                )}
                <div className="space-y-1 min-w-0">
                  <p className="text-sm leading-snug text-foreground">
                    <span className="font-bold">@{n.actor?.username}</span>{" "}
                    {n.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
