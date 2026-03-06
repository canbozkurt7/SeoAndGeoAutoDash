import nodemailer from "nodemailer";
import { createServiceSupabase } from "@/lib/supabase/server";

function buildTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function flushEmailQueue(limit = 25) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("email_queue")
    .select("id,to_address,subject,body,retries")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }
  if (!data?.length) {
    return { sent: 0, failed: 0 };
  }

  const transport = buildTransport();
  let sent = 0;
  let failed = 0;

  for (const row of data) {
    try {
      await transport.sendMail({
        from: process.env.ALERT_EMAIL_FROM,
        to: row.to_address,
        subject: row.subject,
        text: row.body
      });
      sent += 1;
      await supabase
        .from("email_queue")
        .update({ status: "sent" })
        .eq("id", row.id);
    } catch {
      failed += 1;
      const retries = (row.retries ?? 0) + 1;
      await supabase
        .from("email_queue")
        .update({
          retries,
          status: retries >= 3 ? "failed" : "queued"
        })
        .eq("id", row.id);
    }
  }

  return { sent, failed };
}
