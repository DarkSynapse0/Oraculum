"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  Send,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import ImagePreview from "@/components/ImagePreview"; // Ensure this uses a Portal

/* ===================== TYPES ===================== */
type User = { id: string; username: string; email: string; role: string };
type Post = {
  id: string;
  title: string;
  context: string;
  image_url?: string;
  author: string;
  created_at: string;
};
type Answer = {
  id: number;
  content: string;
  username: string;
  created_at: string;
};
type Reply = {
  id: number;
  content: string;
  username: string;
  created_at: string;
};

/* ===================== COMPONENT ===================== */

export default function ViewClient({ user }: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Content States
  const [post, setPost] = useState<Post | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [replies, setReplies] = useState<Record<number, Reply[]>>({});

  // Interaction States
  const [answerText, setAnswerText] = useState("");
  const [openReplyBox, setOpenReplyBox] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const postRes = await fetch("/api/posts/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const postJson = await postRes.json();
      setPost(postJson.data);

      const answersRes = await fetch("/api/answers/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });
      const answersJson = await answersRes.json();
      const fetchedAnswers: Answer[] = answersJson.data || [];
      setAnswers(fetchedAnswers);

      const repliesMap: Record<number, Reply[]> = {};
      await Promise.all(
        fetchedAnswers.map(async (ans) => {
          const res = await fetch("/api/answers/replies/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answerId: ans.id }),
          });
          const json = await res.json();
          repliesMap[ans.id] = json.data || [];
        })
      );
      setReplies(repliesMap);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostAnswer = async () => {
    if (!answerText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/answers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, content: answerText, userId: user.id }),
      });
      if (res.ok) {
        const json = await res.json();
        setAnswers((prev) => [json.data, ...prev]);
        setAnswerText("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (answerId: number) => {
    const text = replyText[answerId];
    if (!text?.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/answers/replies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, content: text, userId: user.id }),
      });
      if (res.ok) {
        const json = await res.json();
        setReplies((prev) => ({
          ...prev,
          [answerId]: [json.data, ...(prev[answerId] || [])],
        }));
        setReplyText((prev) => ({ ...prev, [answerId]: "" }));
        setOpenReplyBox(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <ViewSkeleton />;

  return (
    <div className="w-full overflow-y-scroll max-w-5xl mx-auto px-4 py-8 pb-32">
      {/* 1. Header Navigation */}
      <nav className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:text-foreground -ml-2 gap-2"
          >
            <ArrowLeft size={16} /> Discussions
          </Button>
          <ChevronRight size={14} className="opacity-40" />
          <span className="text-foreground truncate max-w-[200px]">Thread</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal size={14} />
        </Button>
      </nav>

      {/* 2. Main Post Content */}
      <article className="space-y-6">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {post?.author?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-sm truncate">@{post?.author}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} /> 
                {post && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {post?.title}
          </h1>
        </header>

        <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {post?.context}
        </div>

        {post?.image_url && (
          <div 
            className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 cursor-zoom-in group"
            onClick={() => {
              setPreviewImage(post.image_url!);
              setPreviewOpen(true);
            }}
          >
            <Image
              src={post.image_url}
              alt="Post visual content"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        )}
      </article>

      <Separator className="my-10 opacity-50" />

      {/* 3. Answers Section */}
      <section className="space-y-8">
        <h2 className="text-lg font-bold flex items-center gap-2">
          Discussion 
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {answers.length}
          </span>
        </h2>

        {/* Primary Answer Input */}
        <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm focus-within:border-primary/50 transition-colors">
          <Textarea
            placeholder="Share your perspective..."
            className="bg-transparent border-none shadow-none resize-none focus-visible:ring-0 min-h-[100px] text-sm p-2"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />
          <div className="flex justify-end pt-3 border-t border-border/40 mt-3">
            <Button
              size="sm"
              disabled={!answerText.trim() || isSubmitting}
              onClick={handlePostAnswer}
              className="gap-2 font-semibold"
            >
              {isSubmitting ? "Syncing..." : "Post Answer"}
              <Send size={14} />
            </Button>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-6">
          {answers.map((answer) => (
            <div key={answer.id} className="flex flex-col gap-4 p-5 rounded-xl border border-border/40 bg-card/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-foreground">@{answer.username}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-foreground/90 italic border-l-2 border-primary/10 pl-4">
                {answer.content}
              </div>

              <div className="flex items-center gap-4 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setOpenReplyBox(openReplyBox === answer.id ? null : answer.id)}
                >
                  <MessageSquare size={14} />
                  Reply {replies[answer.id]?.length > 0 && `(${replies[answer.id].length})`}
                </Button>
              </div>

              {/* Threaded Replies */}
              {replies[answer.id]?.length > 0 && (
                <div className="ml-4 pl-4 border-l border-border/60 space-y-4 pt-2">
                  {replies[answer.id].map((reply) => (
                    <div key={reply.id} className="flex flex-col gap-1 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-bold">@{reply.username}</span>
                        <span className="text-muted-foreground/60">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Nested Reply Input */}
              {openReplyBox === answer.id && (
                <div className="ml-4 pl-4 border-l border-primary/30 space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                  <Textarea
                    placeholder="Reply to this thread..."
                    className="h-20 text-xs bg-muted/40 border-none shadow-none focus-visible:ring-0"
                    value={replyText[answer.id] || ""}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [answer.id]: e.target.value }))}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs px-3" onClick={() => setOpenReplyBox(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="h-8 text-xs px-4" onClick={() => handlePostReply(answer.id)} disabled={!replyText[answer.id]?.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Global Image Preview */}
      <ImagePreview
        isOpen={previewOpen}
        imageUrl={previewImage}
        onClose={() => setPreviewOpen(false)}
        altText="Discussion attachment"
      />
    </div>
  );
}

function ViewSkeleton() {
  return (
    <div className="min-w-6xl mx-auto px-4 py-8 space-y-10">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="space-y-6 pt-10 border-t">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}