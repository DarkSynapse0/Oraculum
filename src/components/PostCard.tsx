/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Clock,
  Tag,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PostCardProps {
  id: string;
  title: string;
  author: string;
  context: string;
  category?: string;
  tags?: string[];
  upvotes: number;
  downvotes: number;
  answersCount: number;
  createdAt: string;
  imageUrl?: string;
  currentUserId: string;
}

export default function PostCard({
  id,
  title,
  author,
  context,
  category,
  tags = [],
  upvotes,
  downvotes,
  answersCount,
  createdAt,
  imageUrl,
  currentUserId,
}: PostCardProps) {
  const router = useRouter();
  const [voteState, setVoteState] = useState({
    type: null as "upvote" | "downvote" | null,
    upCount: upvotes,
    downCount: downvotes,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/posts/vote/getVote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: id, userId: currentUserId }),
        });
        const data = await res.json();
        if (res.ok && data.voteType) {
          setVoteState((prev) => ({ ...prev, type: data.voteType }));
        }
      } catch (e) {}
    };
    fetchStatus();
  }, [id, currentUserId]);

  const handleVote = async (
    e: React.MouseEvent,
    type: "upvote" | "downvote",
  ) => {
    e.stopPropagation();
    if (!currentUserId || isSyncing) return;
    setIsSyncing(true);

    // Optimistic Update
    const isTogglingOff = voteState.type === type;

    try {
      const res = await fetch("/api/posts/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: id,
          userId: currentUserId,
          condition: type,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVoteState({
          type: isTogglingOff ? null : type,
          upCount: data.upvotes,
          downCount: data.downvotes,
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <article
      onClick={() => router.push(`/dashboard/view/${id}`)}
      className={cn(
        "group relative flex flex-col w-full text-left",
        "bg-card border border-border/50 hover:border-border-strong",
        "rounded-xl transition-all duration-200 cursor-pointer overflow-hidden",
        "hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]",
      )}
    >
      <div className="flex flex-col p-5">
        {/* Top Meta Header */}
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground hover:underline underline-offset-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                {author[0].toUpperCase()}
              </div>
              <span>@{author}</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </div>
            {category && (
              <>
                <span className="text-border">•</span>
                <span className="bg-secondary/50 text-secondary-foreground px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                  {category}
                </span>
              </>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
        </header>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {context}
            </p>
          </div>

          {imageUrl && (
            <div className="relative w-full md:w-32 h-20 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 128px"
              />
            </div>
          )}
        </div>

        {/* Tags Row */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tags.slice(0, 3).map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80 hover:text-foreground transition-colors"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="opacity-40" />

      {/* Footer Actions */}
      <footer className="px-5 py-3 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-4">
          {/* Integrated Voting Pill */}
          <div className="flex items-center bg-background border border-border/60 rounded-full p-0.5 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleVote(e, "upvote")}
              disabled={isSyncing}
              className={cn(
                "h-7 px-2.5 rounded-full transition-all",
                voteState.type === "upvote"
                  ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowBigUp
                className={cn(
                  "h-4 w-4",
                  voteState.type === "upvote" && "fill-current",
                )}
              />
              <span className="text-[11px] font-bold ml-1">
                {voteState.upCount}
              </span>
            </Button>

            <div className="w-[1px] h-3 bg-border mx-0.5" />

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleVote(e, "downvote")}
              disabled={isSyncing}
              className={cn(
                "h-7 px-2.5 rounded-full transition-all",
                voteState.type === "downvote"
                  ? "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowBigDown
                className={cn(
                  "h-4 w-4",
                  voteState.type === "downvote" && "fill-current",
                )}
              />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-default">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-semibold">{answersCount}</span>
            <span className="text-[11px] hidden sm:inline">Answers</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-muted-foreground/40 tracking-tighter uppercase">
          {id.slice(0, 8)}
        </div>
      </footer>
    </article>
  );
}