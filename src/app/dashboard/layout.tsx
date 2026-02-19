"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Edit2, User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "@/components/notificationBell";

// 1. Import the new components
import NotificationListener from "@/components/notificationListener";
import { Toaster } from "@/components/ui/sonner";

type User = {
  id: string;
  username: string;
  role: string;
  email: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) return;

      // Ensure we use authUser.id which is the source of truth
      setUser({
        id: authUser.id,
        username: authUser.user_metadata?.username || "User",
        role: authUser.user_metadata?.role || "student",
        email: authUser.email || "",
      });

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", authUser.id)
        .single();
      if (data) setAvatarUrl(data.avatar_url);
    }
    getProfile();
  }, [supabase]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file || !user) return;
      const path = `${user.id}/${Date.now()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("avatars").upload(path, file);
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      setAvatarUrl(publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {user?.id && <NotificationListener userId={user.id} />}
      <Toaster position="bottom-right" expand={false} richColors />

      {/* GLOBAL TOP HEADER */}
      <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="h-full px-4 lg:px-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            ORACULUM
          </Link>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* The Bell handles the dropdown list of notifications */}
            <NotificationBell />

            <ThemeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <button className="h-8 w-8 rounded-full border border-border/60 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={avatarUrl || ""} />
                    <AvatarFallback>
                      <User size={14} />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent className="w-[320px] p-0 flex flex-col">
                <VisuallyHidden>
                  <SheetTitle>Profile Settings</SheetTitle>
                </VisuallyHidden>

                <div className="p-6 border-b border-border/40">
                  <h2 className="font-semibold text-lg">Account</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your credentials and look
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-border/50 shadow-md">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="text-2xl font-bold bg-muted">
                        {user?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-2 bg-foreground text-background rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                      <Edit2 size={14} />
                      <input
                        type="file"
                        hidden
                        onChange={handleUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="font-bold text-foreground">
                      @{user?.username || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>

                  <nav className="w-full mt-8 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-10"
                      asChild
                    >
                      <Link href="/dashboard/profile">
                        <Settings size={16} className="text-muted-foreground" />{" "}
                        Profile Settings
                      </Link>
                    </Button>
                  </nav>
                </div>

                <div className="p-4 border-t border-border/40 bg-muted/20">
                  <Button
                    variant="destructive"
                    className="w-full gap-2 h-10 font-semibold"
                    onClick={() => supabase.auth.signOut()}
                  >
                    <LogOut size={16} /> Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* PAGE WRAPPER */}
      <div className="flex flex-1 pt-14 overflow-hidden">{children}</div>
    </div>
  );
}