/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import {
  Mail,
  ShieldCheck,
  Calendar,
  FileText,
  Award,
  MessageSquare,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "./PostCard";

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  interests: string[];
};

interface Post {
  id: string;
  user_id: string;
  title: string;
  author: string;
  context: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  upvotes: number;
  downvotes: number;
  answers_count: number;
  created_at: string;
}

export default function Profile({
  userId,
  user,
}: {
  userId: string;
  user: User;
}) {
  const supabase = createClient();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dbUsername, setDbUsername] = useState<string | null>(null); // New state for DB username
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, countRes, postsRes] = await Promise.all([
          // 1. Fetch BOTH avatar and username from profiles table
          supabase
            .from("profiles")
            .select("avatar_url, username")
            .eq("id", userId)
            .single(),
          // 2. Count posts
          supabase
            .from("posts")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
          // 3. Fetch posts
          supabase
            .from("posts")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        ]);

        if (profileRes.data) {
          setAvatarUrl(profileRes.data.avatar_url);
          setDbUsername(profileRes.data.username); // Set username from DB
        }

        setTotalPosts(countRes.count || 0);
        if (postsRes.data) setUserPosts(postsRes.data);
      } catch (err) {
        console.error("Profile Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadProfileData();
  }, [supabase, userId]);

  // Determine the display name (DB first, then Prop, then fallback)
  const displayName = dbUsername || user.username || "User";

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 lg:px-0 space-y-12">
      {/* 1. IDENTITY SECTION */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative shrink-0">
          {loading ? (
            <Skeleton className="h-32 w-32 rounded-full" />
          ) : (
            <div className="h-32 w-32 rounded-full border border-border/60 p-1.5 bg-background shadow-sm">
              <div className="relative h-full w-full rounded-full overflow-hidden bg-secondary">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`${displayName}'s profile picture`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground/50 uppercase">
                    {displayName[0]}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 pt-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {loading ? <Skeleton className="h-8 w-32" /> : displayName}
              <ShieldCheck className="h-5 w-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Badge label={user.role} icon={<ShieldCheck size={12} />} />
            <Badge label="Nepal" icon={<Calendar size={12} />} />
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="grid grid-cols-3 divide-x divide-border/60 border border-border/60 rounded-xl bg-card/30 py-6 shadow-sm">
        <StatItem
          label="Posts"
          value={totalPosts}
          icon={<FileText size={14} />}
          loading={loading}
        />
        <StatItem
          label="Answers"
          value="--"
          icon={<MessageSquare size={14} />}
          loading={loading}
        />
        <StatItem
          label="Reputation"
          value="--"
          icon={<Award size={14} />}
          loading={loading}
        />
      </section>

      {/* 3. ACTIVITY FEED */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Recent Activity
          </h2>
          <span className="text-xs text-muted-foreground">
            {userPosts.length} Publications
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : userPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-xl bg-muted/20">
            <p className="text-sm text-muted-foreground font-medium">
              No publications found under this profile.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author}
                context={post.context}
                category={post.category}
                tags={post.tags}
                upvotes={post.upvotes}
                downvotes={post.downvotes}
                answersCount={post.answers_count}
                createdAt={post.created_at}
                imageUrl={post.image_url}
                currentUserId={userId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// --- Internal Helpers ---

function StatItem({ label, value, icon, loading }: any) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {icon}
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-6 w-10 mt-1" />
      ) : (
        <div className="text-xl font-bold text-foreground">{value}</div>
      )}
    </div>
  );
}

function Badge({ label, icon }: { label: string; icon: any }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground text-xs font-medium border border-border/40 capitalize">
      {icon}
      {label}
    </span>
  );
}