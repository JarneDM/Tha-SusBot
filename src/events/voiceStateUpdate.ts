import { VoiceState, Client } from "discord.js";
import prisma from "../../lib/client.ts";

export async function handleVoiceStateUpdate(client: Client, oldState: VoiceState, newState: VoiceState) {
  const userId = newState.id;
  const username = newState.member?.user.username ?? "Unknown";
  const channelId = newState.channelId;

  // 1️⃣ Upsert user
  await prisma.user.upsert({
    where: { id: userId },
    update: { username },
    create: { id: userId, username },
  });

  // if user joins or switches channel
  if (channelId && newState.channel) {
    const channelName = newState.channel.name ?? "Unknown";

    // create or update channel
    await prisma.voiceChannel.upsert({
      where: { id: channelId },
      update: { name: channelName },
      create: { id: channelId, name: channelName },
    });

    // fetch active session
    const activeSession = await prisma.voiceSession.findFirst({
      where: { userId, leftAt: null },
      orderBy: { joinedAt: "desc" },
    });

    // user switches channels
    if (activeSession && activeSession.channelId !== channelId) {
      const now = new Date();
      const durationSec = Math.floor((now.getTime() - activeSession.joinedAt.getTime()) / 1000);

      await prisma.voiceSession.update({
        where: { id: activeSession.id },
        data: { leftAt: now, durationSec },
      });

      // create new session in new channel
      await prisma.voiceSession.create({
        data: {
          userId,
          channelId,
          joinedAt: now,
        },
      });
      console.log("Creating session for user:", userId, "channel:", newState.channel?.id);

      return;
    }

    // no active session, create one
    if (!activeSession) {
      await prisma.voiceSession.create({
        data: {
          userId,
          channelId,
          joinedAt: new Date(),
        },
      });
    }
  }

  // user leaves voice channel
  if (!channelId) {
    const activeSession = await prisma.voiceSession.findFirst({
      where: { userId, leftAt: null },
      orderBy: { joinedAt: "desc" },
    });

    if (activeSession) {
      const now = new Date();
      const durationSec = Math.floor((now.getTime() - activeSession.joinedAt.getTime()) / 1000);

      await prisma.voiceSession.update({
        where: { id: activeSession.id },
        data: { leftAt: now, durationSec },
      });
    }
  }
}
