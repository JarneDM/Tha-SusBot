# Tha SusBot

A Discord bot for tracking voice channel activity and statistics among friends on a Discord server.

## Features

- **Voice Time Tracking**: Automatically tracks how long each user spends in voice channels
- **Voicetime Command**: Check your personal voice channel statistics with `/voicetime`
- **Leaderboard**: View the top voice time users with `/leaderboard`
- **Persistent Storage**: All data is stored in a PostgreSQL database via Prisma ORM

## Tech Stack

- **Runtime**: Node.js v20+
- **Language**: TypeScript
- **Discord Library**: discord.js v14
- **ORM**: Prisma v7
- **Database**: PostgreSQL
- **Build Tool**: ts-node/esm

## Project Structure

```
src/
├── index.ts              # Main bot entry point
├── register.ts           # Slash command registration
├── commands/
│   ├── voicetime.ts      # User voice time statistics command
│   ├── leaderboard.ts    # Leaderboard command
│   └── pings.ts          # Ping command
├── events/
│   └── voiceStateUpdate.ts # Voice state change event handler
lib/
├── client.ts             # Prisma database client
prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with your configuration:

   ```
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_guild_id
   DATABASE_URL=postgresql://user:password@localhost:5432/yourbotname
   ```

4. Set up the database:

   ```bash
   npx prisma migrate dev
   ```

5. Register slash commands:

   ```bash
   npm run register
   ```

6. Start the bot:
   ```bash
   npm run start
   ```

## Commands

### `/voicetime`

Shows your total voice channel time spent on the server.

**Usage**: `/voicetime`

### `/leaderboard`

Displays the top 10 users by voice channel time. Only includes users with completed voice sessions.

**Usage**: `/leaderboard`

### `/ping`

Checks if the bot is responding.

**Usage**: `/ping`

## Database Schema

- **User**: Stores Discord user information
- **VoiceChannel**: Tracks Discord voice channels
- **VoiceSession**: Records individual voice channel sessions with duration

## Development

### Running in Development Mode

```bash
npm run start
```

### Registering Commands

```bash
npm run register
```

## License

ISC
