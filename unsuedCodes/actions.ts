"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const username = formData.get("username") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        role,
      },
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signOut() {
  const supabase = await createClient();
  // defaults to the global scope
  await supabase.auth.signOut();
  await supabase.auth.signOut({ scope: "local" });
}
