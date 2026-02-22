"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  RefreshCcw,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Standard Pro Practice: Log to an external service like Sentry or LogSnag
    console.error("[System_Fault_Trace]:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* 1. Visual Indicator (Standardized Icon Surface) */}
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 border border-destructive/20 shadow-sm">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
        </div>

        {/* 2. Typography Hierarchy */}
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred in the application layer. We&apos;ve
            been notified and are looking into it.
          </p>
        </div>

        {/* 3. Primary Actions (High-Density Buttons) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mb-8">
          <Button
            onClick={() => reset()}
            className="w-full h-10 font-semibold gap-2 transition-transform active:scale-95"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full h-10 font-semibold gap-2 border-border/60"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Return home
            </Link>
          </Button>
        </div>

        {/* 4. Technical Details (Pro Debugging Section) */}
        <Collapsible className="w-full mb-8">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-center gap-2 mx-auto text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Technical Details
              <ChevronDown className="h-3 w-3" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 text-left">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/40 font-mono text-[11px] text-muted-foreground break-all leading-normal">
              <p className="font-bold text-foreground mb-1 uppercase tracking-wider">
                Error Trace:
              </p>
              {error.message || "Unknown Application Fault"}
              {error.digest && (
                <div className="mt-2 pt-2 border-t border-border/20">
                  <span className="text-foreground font-bold uppercase">
                    Digest:
                  </span>{" "}
                  {error.digest}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* 5. Support Footer */}
        <footer className="mt-8 flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground/60 font-medium">
            Still having trouble?
          </p>
          <Link
            href="https://status.nexus.com"
            target="_blank"
            className="text-[11px] font-bold text-primary flex items-center gap-1.5 hover:underline underline-offset-4"
          >
            Check System Status
            <ExternalLink size={10} />
          </Link>
        </footer>
      </div>
    </div>
  );
}

// Internal Helper
function Separator() {
  return <div className="h-px w-24 bg-border/40" />;
}
