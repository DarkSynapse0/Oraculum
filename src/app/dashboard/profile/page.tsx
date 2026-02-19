/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect} from "react";
import {
  User,
  Settings2,
  Calendar,
  Check,
  Loader2,
  Fingerprint,
  Hash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  username: string;
  role: string;
  created_at: string;
  avatar_url: string;
  interests: string[];
}

const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profiles");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setTempProfile(data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!tempProfile) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/profiles/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempProfile),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!tempProfile) return;
    const { name, value } = e.target;
    if (name === "interests") {
      setTempProfile({
        ...tempProfile,
        interests: value.split(",").map((i) => i.trim()),
      });
    } else {
      setTempProfile({ ...tempProfile, [name]: value });
    }
  };

  if (isLoading) return <LoadingState />;
  if (!profile || !tempProfile) return null;

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-background shadow-sm ring-1 ring-border">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-muted text-lg font-semibold">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Settings2 className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Public Profile
            </h1>
            <p className="text-sm text-muted-foreground leading-none">
              Manage how your account is presented to the community.
            </p>
          </div>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="h-9 px-4 font-semibold"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="h-9 px-4"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="h-9 px-4 font-semibold gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Form Section */}
      <div className="space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <FormField label="Username" icon={<User className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input
                name="username"
                value={tempProfile.username}
                onChange={handleChange}
                className="h-10 bg-background"
              />
            ) : (
              <p className="text-sm font-medium py-2.5 px-3 bg-muted/30 rounded-md border border-transparent">
                {profile.username}
              </p>
            )}
          </FormField>

          <FormField
            label="Professional Role"
            icon={<Fingerprint className="h-3.5 w-3.5" />}
          >
            {isEditing ? (
              <Input
                name="role"
                value={tempProfile.role}
                onChange={handleChange}
                className="h-10 bg-background"
              />
            ) : (
              <p className="text-sm font-medium py-2.5 px-3 bg-muted/30 rounded-md border border-transparent">
                {profile.role}
              </p>
            )}
          </FormField>

          <FormField
            label="Member Since"
            icon={<Calendar className="h-3.5 w-3.5" />}
          >
            <div className="flex items-center h-10 px-3 rounded-md bg-muted/50 border border-border/50 text-muted-foreground text-sm">
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </FormField>

          <FormField
            label="Interests & Tags"
            icon={<Hash className="h-3.5 w-3.5" />}
          >
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  name="interests"
                  value={tempProfile.interests.join(", ")}
                  onChange={handleChange}
                  className="min-h-[100px] bg-background leading-relaxed"
                  placeholder="e.g. React, Next.js, UI Design"
                />
                <p className="text-[11px] text-muted-foreground">
                  Separate interests with commas. These will be visible on your
                  public feed.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 py-1">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold border border-border/40"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </FormField>
        </section>

        <Separator className="my-10" />

        {/* Danger Zone Placeholder - Industry Standard */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <h3 className="text-sm font-bold text-destructive flex items-center gap-2 mb-2">
            Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <Button variant="destructive" size="sm" className="h-8 font-bold">
            Delete Account
          </Button>
        </section>
      </div>
    </div>
  );
};

// --- Sub-components for Clean Architecture ---

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <span className="text-muted-foreground/60">{icon}</span>
        <Label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {label}
        </Label>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="w-full max-w-2xl mx-auto py-20 flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Synchronizing profile...
      </p>
    </div>
  );
}

export default ProfileEditor;
