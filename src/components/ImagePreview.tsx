"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Maximize2, Download, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  altText?: string;
  caption?: string;
  metadata?: {
    size?: string;
    dimensions?: string;
    filename?: string;
  };
}

export default function ImagePreview({
  isOpen,
  imageUrl,
  onClose,
  altText = "Image preview",
  caption,
  metadata,
}: ImagePreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle Mounting for SSR
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock Body Scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard support (Standard Pro Pattern)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!mounted || !isOpen) return null;

  // The Lightbox Shell
  const Lightbox = (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center",
        "bg-background/95 backdrop-blur-md transition-opacity duration-200",
        isLoaded ? "opacity-100" : "opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Top Bar - Functional Toolbar */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-gradient-to-b from-background/50 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="p-2 rounded-md bg-muted/50 border border-border/50 text-muted-foreground">
            <Info size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground truncate max-w-[200px] md:max-w-md">
              {metadata?.filename || altText}
            </span>
            {metadata?.dimensions && (
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                {metadata.dimensions}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation(); /* Add download logic */
            }}
            className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Download"
          >
            <Download size={20} />
          </button>
          <div className="w-[1px] h-4 bg-border/60 mx-1" />
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 lg:p-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            "relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out",
            isLoaded ? "scale-100" : "scale-95",
          )}
        >
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-contain drop-shadow-2xl select-none"
            priority
            onLoadingComplete={() => setIsLoaded(true)}
            sizes="90vw"
          />
        </div>
      </div>

      {/* Footer - Readability Focus */}
      {caption && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-background/80 border border-border/50 backdrop-blur-xl max-w-[80vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-medium text-center text-foreground leading-relaxed">
            {caption}
          </p>
        </div>
      )}

      {/* Interaction Hint */}
      <div className="absolute bottom-4 right-6 hidden md:flex items-center gap-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
        <Maximize2 size={12} />
        <span>Press ESC to dismiss</span>
      </div>
    </div>
  );

  return createPortal(Lightbox, document.body);
}