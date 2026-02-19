"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Shield, Sparkles } from "lucide-react";

export default function HomeClient() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight">ORACULUM</span>

          <Link href="/login">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6">
        {/* Hero */}
        <section className="py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              A better way to ask questions and learn together.
            </h1>

            <p className="mt-4 text-base text-muted-foreground">
              Oraculum is an academic Q&A platform for schools and colleges,
              combining AI assistance with verified teacher responses to make
              learning structured, reliable, and collaborative.
            </p>

            <div className="mt-8 flex gap-3">
              <Link href="/login">
                <Button size="default">Get started</Button>
              </Link>

              <Link href="/register">
                <Button variant="outline" size="default">
                  Create account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle className="mt-2 text-base">
                  AI & Teacher Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get instant AI-generated answers or verified responses from
                  teachers depending on your learning needs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle className="mt-2 text-base">
                  Role-Based System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Designed for admins, teachers, students, and guests with clear
                  permissions and secure access.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="mt-2 text-base">
                  Structured Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organize questions by subject and category, encourage
                  discussion, and build a reusable knowledge base.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto h-14 max-w-7xl px-6 flex items-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Oraculum. Built for academic excellence.
        </div>
      </footer>
    </div>
  );
}
