import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AuthForm from "./AuthForm";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  

  if (session) redirect("/dashboard");

  return (
    <>
      <AuthForm />
    </>
  );
}
