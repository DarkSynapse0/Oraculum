"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { UserPlus, MoreHorizontal, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  username: string;
  role: string;
  avatar_url?: string;
};

export default function SuggestedUsers() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("id, username, role, avatar_url")
        .limit(5); // Professional sidebars rarely show more than 5 items

      if (data) setProfiles(data);
      setLoading(false);
    }
    init();
  }, [supabase]);

  // Optimized filtering
  const suggestedItems = useMemo(
    () => profiles.filter((p) => p.id !== currentUserId),
    [profiles, currentUserId],
  );

  if (loading) return <SuggestedSkeleton />;
  if (suggestedItems.length === 0) return null;

  return (
    <section className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
          Suggested for you
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* User List */}
      <div className="space-y-1">
        {suggestedItems.map((profile) => (
          <div
            key={profile.id}
            className={cn(
              "group flex items-center justify-between p-2 rounded-lg",
              "transition-colors duration-150 hover:bg-accent/50 cursor-pointer",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-border/40 shrink-0">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={`${profile.username}'s avatar`}
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-secondary text-[10px] font-bold">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate leading-tight">
                  {profile.username}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize leading-tight">
                  {profile.role}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 text-[11px] font-bold border-border/60 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Follow
            </Button>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <Button
        variant="link"
        className="text-xs text-primary font-semibold p-1 h-auto hover:no-underline hover:text-primary/80 transition-colors"
      >
        View all suggestions
      </Button>
    </section>
  );
}

// --- Sub-components for Visual Stability ---

function SuggestedSkeleton() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-3 w-24 mb-6" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
          <Skeleton className="h-7 w-14 rounded-md" />
        </div>
      ))}
    </div>
  );
}