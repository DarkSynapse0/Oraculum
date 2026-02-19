"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";

const INTEREST_OPTIONS = [
  "AI & Machine Learning",
  "Web Development",
  "Data Structures & Algorithms",
  "Mobile Development",
  "Cloud Computing",
  "UI/UX Design",
  "Cybersecurity",
  "DevOps",
];

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    const payload: {
      email: string;
      password: string;
      username?: string;
      role?: string;
      interests?: string[];
    } = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (mode === "signup") {
      payload.username = formData.get("username") as string;
      payload.role = formData.get("role") as string;
      payload.interests = selectedInterests;
    }

    try {
      const res = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong.");
        return;
      }

      window.location.href = mode === "login" ? "/dashboard" : "/login";
    } catch {
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">
            {mode === "login" ? "Sign in" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Enter your credentials to continue"
              : "Fill in the details below to get started"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    required
                    placeholder="johndoe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Interests</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {INTEREST_OPTIONS.map((interest) => (
                      <label
                        key={interest}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedInterests.includes(interest)}
                          onCheckedChange={(checked) =>
                            setSelectedInterests((prev) =>
                              checked
                                ? [...prev, interest]
                                : prev.filter((i) => i !== interest),
                            )
                          }
                        />
                        {interest}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-11">
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSelectedInterests([]);
              }}
              className="font-medium text-primary hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
