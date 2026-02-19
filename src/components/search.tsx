"use client";

import React, { useState, useCallback} from "react";
import PostCard from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  SearchX,
  Command,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface Post {
  id: string;
  title: string;
  author: string;
  context: string;
  category?: string;
  tags?: string[];
  upvotes: number;
  downvotes: number;
  answers_count: number;
  created_at: string;
  image_url?: string;
}

interface User {
  id: string;
}

export default function SearchPage({ user }: { user: User }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async () => {
    const term = query.trim();
    if (!term) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch("/api/posts/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: term }),
      });

      if (!res.ok) throw new Error("SEARCH_FAILED");
      const json = await res.json();
      setResults(json.data || []);
    } catch (error) {
      console.error("[Search_Error]:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") performSearch();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-10 pb-24">
      <div className="flex flex-col gap-8">
        {/* Functional Header */}
        <header className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Search Discussions
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            Search across titles, categories, and tags. Use keywords to find
            specific community insights.
          </p>
        </header>

        {/* Search Bar - System UI Style */}
        <div className="group relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search conversations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-11 pl-10 pr-12 text-sm bg-background border-border/60",
                "focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all",
              )}
            />
            {/* Shortcut Hint - Standard Pro UX */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border bg-muted/50 text-[10px] font-medium text-muted-foreground pointer-events-none uppercase">
              <Command size={10} /> Enter
            </div>
          </div>
          <Button
            onClick={performSearch}
            disabled={loading || !query.trim()}
            className="h-11 px-6 font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        <Separator className="bg-border/50" />

        {/* Results Area */}
        <div className="min-h-[40vh]">
          {loading ? (
            <SearchLoadingState />
          ) : !hasSearched ? (
            <SearchInitialState />
          ) : results.length > 0 ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Found {results.length} matching{" "}
                  {results.length === 1 ? "result" : "results"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] gap-1.5 text-muted-foreground"
                >
                  <Filter size={12} /> Filter
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {results.map((post) => (
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
                    currentUserId={user?.id || ""}
                  />
                ))}
              </div>
            </div>
          ) : (
            <SearchEmptyState query={query} />
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Internal Architectural Components --- */

function SearchInitialState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center mb-4">
        <Command className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <h3 className="text-sm font-semibold">Ready to explore</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
        Type keywords above to find relevant topics and discussions.
      </p>
    </div>
  );
}

function SearchLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <Loader2 className="h-6 w-6 animate-spin text-primary/40 mb-3" />
      <p className="text-xs font-medium text-muted-foreground">
        Indexing community discussions...
      </p>
    </div>
  );
}

function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6 border border-dashed rounded-2xl bg-muted/10">
      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <SearchX className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        No matches found for &quot;{query}&quot;
      </h3>
      <p className="text-xs text-muted-foreground mt-2 max-w-[280px] leading-relaxed">
        We couldn&apos;t find any discussions matching those keywords. Try broadening
        your search or checking for typos.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Try searching:
        </span>
        <button className="text-[10px] font-bold text-primary hover:underline">
          Javascript
        </button>
        <button className="text-[10px] font-bold text-primary hover:underline">
          Next.js
        </button>
        <button className="text-[10px] font-bold text-primary hover:underline">
          Database
        </button>
      </div>
    </div>
  );
}