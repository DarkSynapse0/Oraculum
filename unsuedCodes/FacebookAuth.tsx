"use client";

import { createClient } from "@/utils/supabase/client";

export async function signInWithFacebook() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Facebook login error:", error.message);
  } else {
    console.log("Redirecting to Facebook login...");
  }

  {
    /* <button
        onClick={signInWithFacebook}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Continue with Facebook
      </button>

      {data.user.app_metadata.provider == "facebook" && (
        <>
          <h1>connected Accounts</h1>
          <p>Hello {data.user.user_metadata.full_name}</p>
        </>
      )} */
  }

  console.log(data)
}
