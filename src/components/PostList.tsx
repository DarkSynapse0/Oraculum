/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Inbox, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: userData }, res] = await Promise.all([
        supabase.auth.getUser(),
        fetch("/api/posts"),
      ]);

      const result = await res.json();
      setUserId(userData.user?.id || "");
      setPosts(result.data || []);
    } catch (err) {
      console.error("Critical Feed Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <PostListSkeleton />;

  if (posts.length === 0) return <EmptyFeedState onRefresh={fetchData} />;

  return (
    <div className="w-full max-w-5xl justify-center mx-auto pb-20 px-4 lg:px-0">
      {/* List Header - Professional Standard */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Community Feed</h2>
          <p className="text-sm text-muted-foreground">
            Latest discussions and insights
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </header>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05, // Subtle stagger
                ease: "easeOut",
              }}
            >
              <PostCard
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
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Sub-components for Clean Architecture ---

function PostListSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-8">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="border border-border/50 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFeedState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        <Inbox className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        The feed is quiet... for now
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        Be the one to spark a conversation. Share a question or post an update
        to the community.
      </p>
      <div className="flex gap-3">
        <Button onClick={onRefresh} variant="ghost" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Check again
        </Button>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>
    </div>
  );
}