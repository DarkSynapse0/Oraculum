// components/NotificationListener.tsx
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner"; // Recommended for professional toasts

export default function NotificationListener({ userId }: { userId: string }) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Show a professional toast notification
          toast(payload.new.content, {
            description: "Check your activity feed",
            action: {
              label: "View",
              onClick: () => (window.location.href = payload.new.link),
            },
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return null;
}
