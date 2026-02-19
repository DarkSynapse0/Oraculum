import ViewClient from "./viewClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const ViewServer = async () => {
  const supabase = createClient();

  const { data, error } = await (await supabase).auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = {
    id: data.user.id,
    email: data.user.email ?? "",
    username: data.user.user_metadata?.username ?? "",
    interests: data.user.user_metadata?.interests ?? "",
    role: data.user.user_metadata?.role ?? "",
  };

  return <ViewClient user={user} />;
};

export default ViewServer;
