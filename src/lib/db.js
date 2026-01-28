import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// config({ path: new URL("../../.env", import.meta.url).pathname });
config();


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials are missing!");
if (!supabaseServiceKey) throw new Error("Supabase service role key is missing!");


export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create user if not exists
export async function createUser(userId, username) {
  const { data, error } = await supabaseAdmin.from("user").upsert({ id: userId, username }, { onConflict: ["id"] });

  if (error) console.error("createUser error:", error);
  return data;
}

// Start a new voice session
export async function createVoiceSession(userId, channelId) {
  const { data, error } = await supabaseAdmin.from("voicesession").insert([
    {
      id: uuidv4(), 
      userId,
      channelId,
      joinedAt: new Date(),
    },
  ]);

  if (error) console.error("createVoiceSession error:", error);
  return data;
}

export async function getVoiceChannels() {
  const { data, error } = await supabaseAdmin.from("voicechannel").select("*");

  if (error) {
    console.error("getVoiceChannels error:", error);
    return [];
  }
  return data;
}

export const getVoiceSessionsByUser = async (userId) => {
  const { data, error } = await supabaseAdmin.from("voicesession").select("*").eq("userId", userId).order("joinedAt", { ascending: false });

  if (error) {
    console.error("getVoiceSessionsByUser error:", error);
    return [];
  }
  return data;
};

// End the active voice session
export async function endVoiceSession(userId) {
  // find the latest session without leftAt
  const { data: sessions, error } = await supabaseAdmin
    .from("voicesession")
    .select("*")
    .eq("userId", userId)
    .is("leftAt", null)
    .order("joinedAt", { ascending: false })
    .limit(1);

  if (error) return console.error("endVoiceSession error:", error);
  if (!sessions || sessions.length === 0) return;

  const session = sessions[0];
  const durationSec = Math.floor((Date.now() - new Date(session.joinedAt).getTime()) / 1000);

  const { error: updateError } = await supabaseAdmin.from("voicesession").update({ leftAt: new Date(), durationSec }).eq("id", session.id);

  if (updateError) console.error("endVoiceSession update error:", updateError);
}

// Get leaderboard
export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabaseAdmin.from("voicesession").select("userId, durationSec").not("durationSec", "is", null);

  if (error) return [];

  // sum duration per user
  const totals = {};
  data.forEach((row) => {
    totals[row.userId] = (totals[row.userId] || 0) + row.durationSec;
  });

  // convert to array and sort descending
  const leaderboard = Object.entries(totals)
    .map(([userId, totalSec]) => ({ userId, totalSec }))
    .sort((a, b) => b.totalSec - a.totalSec)
    .slice(0, limit);

  return leaderboard;
}

export async function addWarning(userId, username, reason) {
  await createUser(userId, username);
  const { data, error } = await supabaseAdmin.from("warnings").insert([
    {
      id: uuidv4(),
      userId,
      reason,
      warnedAt: new Date(),
    },
  ]);

  if (error) console.error("addWarning error:", error);
  return data;
}

export async function getWarnings(userId) {
  const { data, error } = await supabaseAdmin.from("warnings").select("*").eq("userId", userId).order("warnedAt", { ascending: true });

  if (error) {
    console.error("getWarnings error:", error);
    return [];
  }
  return data;
}

export async function warningLeaderboard(limit = 10) {
  const { data, error } = await supabaseAdmin.from("warnings").select("userId, id");

  if (error) {
    console.error("warningLeaderboard error:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // count warnings per user
  const counts = {};
  data.forEach((row) => {
    if (row.userId) {
      counts[row.userId] = (counts[row.userId] || 0) + 1;
    }
  });

  // convert to array and sort descending and also get user names
  const leaderboard = Object.entries(counts)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  // fetch user names
  for (const entry of leaderboard) {
    const { data: userData, error: userError } = await supabaseAdmin.from("user").select("username").eq("id", entry.userId).single();
    if (userError) {
      console.error("warningLeaderboard user fetch error:", userError);
      entry.name = "Unknown User";
    } else {
      entry.name = userData?.username || "Unknown User";
    }
  }

  return leaderboard;
}
