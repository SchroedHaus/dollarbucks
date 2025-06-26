// supabase/functions/apply_scheduled_transactions/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

serve(async (req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const { data: schedules, error } = await supabase
    .from("scheduled_transactions")
    .select("*")
    .lte("start_date", today);

  if (error) {
    console.error("Fetch error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  for (const schedule of schedules) {
    const shouldRun = shouldRunToday(schedule.start_date, schedule.frequency);
    if (!shouldRun) continue;

    // 1. Create transaction
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert([{ note: schedule.note, adjustment: schedule.adjustment, profile_id: schedule.profile_id, }])
      .select()
      .single();

    if (txError) {
      console.error("Transaction insert failed:", txError);
      continue;
    }

    // 2. Update profile balance
    await supabase.rpc("adjust_profile_balance", {
      profile_id_input: schedule.profile_id,
      delta: schedule.adjustment,
    });

    // 3. Handle frequency
    if (schedule.frequency === "once") {
      await supabase
        .from("scheduled_transactions")
        .delete()
        .eq("id", schedule.id);
    } else {
      const newDate = getNextDate(schedule.start_date, schedule.frequency);
      await supabase
        .from("scheduled_transactions")
        .update({ start_date: newDate })
        .eq("id", schedule.id);
    }
  }

  return new Response(JSON.stringify({ message: "Done" }), { status: 200 });
});

function shouldRunToday(startDate: string, frequency: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return startDate <= today;
}

function getNextDate(dateStr: string, freq: string): string {
  const date = new Date(dateStr);
  switch (freq) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date.toISOString().split("T")[0];
}
