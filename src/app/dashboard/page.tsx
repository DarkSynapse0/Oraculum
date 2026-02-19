/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Home, Search, PlusSquare, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

import Profile from "@/components/profile";
import CreatePostForm from "@/components/createPost";
import PostList from "@/components/PostList";
import SuggestedUsers from "@/components/SuggestedUsers";
import SearchPage from "@/components/search";
import RecommendationPage from "@/components/recommendation";

type Tab = "home" | "posts" | "search" | "create" | "profile";

export default function DashboardPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    load();
    const saved = localStorage.getItem("dashboardTab") as Tab;
    if (saved) setActiveTab(saved);
  }, [supabase]);

  const navItems = [
    { key: "home", icon: Home, label: "Feed" },
    { key: "posts", icon: BookOpen, label: "Explore" },
    { key: "search", icon: Search, label: "Search" },
    { key: "create", icon: PlusSquare, label: "New Post" },
    { key: "profile", icon: User, label: "My Profile" },
  ] as const;

  if (!user) return null; // Or a skeleton

  return (
    <div className="flex w-full overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-muted/10">
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                localStorage.setItem("dashboardTab", item.key);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                size={18}
                strokeWidth={activeTab === item.key ? 2.5 : 2}
              />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-50/20 dark:bg-transparent">
        <div className="w-full mx-auto p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div
              className={cn(
                "col-span-1 lg:col-span-8 space-y-6",
                (activeTab === "profile" || activeTab === "search") &&
                  "lg:col-span-12",
              )}
            >
              <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-xl font-bold tracking-tight capitalize">
                  {activeTab}
                </h1>
                <p className="text-xs text-muted-foreground border-b">
                  Nexus / Dashboard / {activeTab}
                </p>
              </div>

              {renderTab(activeTab, user)}
            </div>

            {/* PERSISTENT SIDEBAR ONLY ON FEED */}
            {activeTab === "home" && (
              <aside className="hidden lg:block lg:col-span-4 space-y-6">
                <section className="bg-card border border-border/50 rounded-xl p-5">
                  <h3 className="text-sm font-bold mb-4">Suggested Users</h3>
                  <SuggestedUsers />
                </section>
              </aside>
            )}
          </div>
        </div>
      </main>

      {/* MOBILE NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border/60 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={cn(
              "flex flex-col items-center gap-1",
              activeTab === item.key ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function renderTab(tab: Tab, user: any) {
  switch (tab) {
    case "home":
      return <RecommendationPage />;
    case "posts":
      return <PostList />;
    case "search":
      return <SearchPage user={user} />;
    case "create":
      return <CreatePostForm user={user.user_metadata?.username} />;
    case "profile":
      return <Profile userId={user.id} user={user} />;
    default:
      return <RecommendationPage />;
  }
}
