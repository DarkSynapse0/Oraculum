/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, Hash, Layers, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CreatePostFormProps {
  user: string;
}

export default function CreatePostForm({ user }: CreatePostFormProps) {
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    context: "",
    category: "",
    tags: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Image must be under 5MB");
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = useCallback(() => {
    setImageFile(null);
    setPreviewUrl(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) throw new Error("Unauthorized");

      let imageUrl: string | null = null;

      if (imageFile) {
        const filePath = `${userId}/${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }

      const res = await fetch("/api/posts/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          context: form.context.trim(),
          user_id: userId,
          author: user,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      alert("Post published.");
      setForm({ title: "", context: "", category: "", tags: "" });
      removeImage();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-8 pb-20"
      >
       

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main content - Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Section */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-foreground/80"
              >
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="What's on your mind?"
                required
                className="h-11 text-base md:text-sm bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>

            {/* Content Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="context"
                  className="text-sm font-semibold text-foreground/80"
                >
                  Content
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Markdown Supported
                </span>
              </div>
              <Textarea
                id="context"
                name="context"
                value={form.context}
                onChange={handleChange}
                rows={12}
                placeholder="Write your content here..."
                required
                className="resize-none text-base md:text-sm bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/50 leading-relaxed"
              />
            </div>
          </div>

          {/* Metadata Sidebar - Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Metadata Group */}
            <div className="space-y-4 p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Layers className="h-3 w-3" /> Classification
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-medium">
                    Category
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Engineering"
                    className="h-9 text-xs bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-xs font-medium">
                    Tags
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="tags"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="react, tailwind..."
                      className="h-9 text-xs pl-8 bg-background/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload Group */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="h-3 w-3" /> Featured Image
              </h3>

              {!previewUrl ? (
                <label className="group relative flex flex-col items-center justify-center w-full h-48 border border-dashed border-border/60 rounded-xl bg-muted/20 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <div className="p-3 rounded-full bg-background border border-border/40 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="mt-3 text-xs font-medium text-foreground/70">
                      Upload image
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Max 5MB • JPG, PNG
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-border shadow-sm bg-muted">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="h-8 gap-2"
                    >
                      <X className="h-3 w-3" /> Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish post"
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                By publishing, you agree to the community guidelines and content
                policies.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}