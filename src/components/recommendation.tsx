"use client";

import { useEffect, useState, useCallback } from "react";
import PostCard from "@/components/PostCard";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Flame, Inbox, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Types ---
type Post = {
  id: string;
  title: string;
  author: string;
  context: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  answers_count: number;
  created_at: string;
  image_url?: string;
};

type ApiResponse = {
  type: "interest_based" | "trending";
  posts: Post[];
};

export default function RecommendationPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchRecommendations = useCallback(async (uid: string) => {
    try {
      const res = await fetch("/api/posts/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      if (!res.ok) throw new Error("API_ERROR");
      const result: ApiResponse = await res.json();
      setData(result);
    } catch (err) {
      console.error("[Recommendation_Load_Error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      fetchRecommendations(user.id);
    };
    init();
  }, [supabase, fetchRecommendations]);

  // --- Render States ---

  if (loading) return <RecommendationSkeleton />;

  if (!data || data.posts.length === 0) {
    return <EmptyState type={data?.type || "interest_based"} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto lg:px-0 px-3 py-4 pb-24">
      {/* System Header */}
      <header className="mb-10 flex px-2 flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            System Recommended
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            {data.type === "interest_based" ? (
              <>
                <Sparkles className="h-6 w-6" />
                Picked for you
              </>
            ) : (
              <>
                <Flame className="h-6 w-6 text-orange-500" />
                Trending now
              </>
            )}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.type === "interest_based"
              ? "Content curated based on your technical interests and past interactions."
              : "High-engagement discussions happening across the Nexus network right now."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs font-medium"
          onClick={() => {
            setLoading(true);
            if (userId) fetchRecommendations(userId);
          }}
        >
          <RefreshCcw className="h-3 w-3" />
          Refresh feed
        </Button>
      </header>

      {/* Content Feed */}
      <div className="flex flex-col gap-6">
        {data.posts.map((post) => (
          <div
            key={post.id}
            className="transition-opacity duration-500 animate-in fade-in slide-in-from-bottom-2"
          >
            <PostCard
              id={post.id}
              title={post.title}
              author={post.author}
              context={post.context}
              category={post.category || undefined}
              tags={post.tags}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              answersCount={post.answers_count}
              createdAt={post.created_at}
              imageUrl={post.image_url}
              currentUserId={userId || ""}
            />
          </div>
        ))}
      </div>

      {/* Footer Meta */}
      <footer className="mt-16 text-center border-t pt-8 border-border/50">
        <p className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-widest">
          End of recommendations
        </p>
      </footer>
    </div>
  );
}

// --- Internal Architectural Components ---

function RecommendationSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="space-y-6 pt-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-5 border border-border/50 rounded-xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 border border-border/50">
        <Inbox className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h2 className="text-xl font-semibold text-foreground tracking-tight">
        No recommendations yet
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-[280px] leading-relaxed">
        {type === "interest_based"
          ? "Update your interests in settings to see personalized content here."
          : "The trending feed is taking a break. Check back in a few minutes."}
      </p>
      <Button variant="secondary" className="mt-8 h-9 text-xs" asChild>
        <a href="/dashboard">Return to main feed</a>
      </Button>
    </div>
  );
}