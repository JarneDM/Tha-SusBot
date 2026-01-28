# Tha SusBot

A Discord bot for tracking voice channel activity and statistics among friends on a Discord server.

## Features

- **Voice Time Tracking**: Automatically tracks how long each user spends in voice channels
- **Voicetime Command**: Check your personal voice channel statistics with `/voicetime`
- **Leaderboard**: View the top voice time users with `/leaderboard`
- **Warn**: Warn another user with `/warn` (everyone can warn eachother since its just me and my friends in this server)
- **Warn leaderboard**: See how much warnings each user has with `/warningleaderboard`
- **Get Warning**: See the amount of warnings of one user with `/getwarnings`
- **Persistent Storage**: All data is stored in a PostgreSQL database in supabase

## Tech Stack

- **Runtime**: Node.js v20+
- **Language**: JavaScript
- **Discord Library**: discord.js v14
- **Database**: PostgreSQL

## Project Structure

```
src/
├── index.js              # Main bot entry point
├── register.js           # Slash command registration
├── commands/
│   ├── voicetime.js      # User voice time statistics command
│   ├── leaderboard.js    # Leaderboard command
│   └── warn.js           # All the warning commands
├── events/
│   └── voiceStateUpdate.js # Voice state change event handler
lib/
├── client.js             # Prisma database client
└── db.js                 # All the logic that has to do with the db
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
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
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

### `/warn`

Warn another player with or without reason.

**Usage**: `/warn`

### `/getwarning`

Get the warnings of one player.

**Usage**: `/getwarning`

### `/warningleaderboard`

Get the top 10 users with the highest warning.

**Usage**: `/warningleaderboard`

## Database Schema

- **user**: Stores Discord user information
- **voicechannel**: Tracks Discord voice channels
- **voicesession**: Records individual voice channel sessions with duration
- **warnings**: Stores the warnings with the user id and the reason (if reason was given)

## Development

### Running in Development Mode

```bash
npm run start
```
Runs register.js first to register the commands and then the index.js file to run the bot.

## License

ISC
