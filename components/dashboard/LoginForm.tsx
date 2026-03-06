"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("-");

  async function onLogin() {
    setStatus("Sending...");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/overview`
      }
    });
    setStatus(error ? `Failed: ${error.message}` : "Magic link sent");
  }

  return (
    <>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        placeholder="owner@domain.com"
        onChange={(event) => setEmail(event.target.value)}
      />
      <button type="button" style={{ marginTop: 10 }} onClick={onLogin}>
        Send Magic Link
      </button>
      <div className="muted" style={{ marginTop: 8 }}>
        {status}
      </div>
    </>
  );
}
