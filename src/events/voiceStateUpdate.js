function parseSupabaseTimestamp(ts) {
  return Date.parse(ts.endsWith("Z") ? ts : ts + "Z");
}
import { VoiceState, Client } from "discord.js";
import { supabaseAdmin } from "../lib/db.js";

export async function handleVoiceStateUpdate(client, oldState, newState) {
  const userId = newState.id;
  const username = newState.member?.user.username ?? "Unknown";
  const channelId = newState.channelId;

  if (!userId) {
    console.error("No userId, cannot track voice state.");
    return;
  }

  try {
    const { error: userError } = await supabaseAdmin.from("user").upsert({ id: userId, username }, { onConflict: ["id"] });

    if (userError) {
      console.error("Failed to upsert user:", userError);
      return;
    }

    if (channelId && newState.channel) {
      const channelName = newState.channel.name ?? "Unknown";

      const { error: channelError } = await supabaseAdmin
        .from("voicechannel")
        .upsert({ id: channelId, name: channelName }, { onConflict: ["id"] });

      if (channelError) {
        console.error("Failed to upsert voicechannel:", channelError);
        return;
      }
      console.log("Channel upserted successfully:", channelId);

      const { data: activeSessions, error: sessionError } = await supabaseAdmin
        .from("voicesession")
        .select("*")
        .eq("userId", userId)
        .is("leftAt", null)
        .order("joinedAt", { ascending: false })
        .limit(1);

      if (sessionError) {
        console.error("Error fetching active session:", sessionError);
        return;
      }

      const activeSession = activeSessions?.[0] ?? null;

      if (activeSession && activeSession.channelId !== channelId) {
        const nowUTC = new Date().toISOString();
        const joinedAtMs = parseSupabaseTimestamp(activeSession.joinedAt);
        const leftAtMs = parseSupabaseTimestamp(nowUTC);
        const durationSec = Math.max(0, Math.floor((leftAtMs - joinedAtMs) / 1000));

        const { error: endError } = await supabaseAdmin
          .from("voicesession")
          .update({ leftAt: nowUTC, durationSec })
          .eq("id", activeSession.id);

        if (endError) console.error("Error ending old session:", endError);

        const { error: createError } = await supabaseAdmin.from("voicesession").insert([{ userId, channelId, joinedAt: nowUTC }]);

        if (createError) console.error("Error creating new session:", createError);
        else console.log("User switched channel, new session created:", userId, channelId);

        return;
      }

      if (!activeSession) {
        const nowUTC = new Date().toISOString();
        const { error: createError } = await supabaseAdmin.from("voicesession").insert([{ userId, channelId, joinedAt: nowUTC }]);
        if (createError) console.error("Error creating new session:", createError);
        else console.log("New session created for user:", userId, channelId);
      }
    }

    if (!channelId) {
      const { data: activeSessions, error: sessionError } = await supabaseAdmin
        .from("voicesession")
        .select("*")
        .eq("userId", userId)
        .is("leftAt", null)
        .order("joinedAt", { ascending: false })
        .limit(1);

      if (sessionError) {
        console.error("Error fetching active session on leave:", sessionError);
        return;
      }

      const activeSession = activeSessions?.[0] ?? null;

      if (activeSession) {
        const nowUTC = new Date().toISOString();
        const joinedAtMs = parseSupabaseTimestamp(activeSession.joinedAt);
        const leftAtMs = parseSupabaseTimestamp(nowUTC);
        const durationSec = Math.max(0, Math.floor((leftAtMs - joinedAtMs) / 1000));

        const { error: endError } = await supabaseAdmin
          .from("voicesession")
          .update({ leftAt: nowUTC, durationSec })
          .eq("id", activeSession.id);

        if (endError) console.error("Error ending session on leave:", endError);
        else console.log("User left channel, session closed:", userId);
      }
    }
  } catch (err) {
    console.error("handleVoiceStateUpdate unexpected error:", err);
  }
}
