require("dotenv").config();

const { Client, Collection } = require("discord.js");

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────

const token = process.env.TOKEN?.trim().replace(/^Bot\s+/i, "");

if (!token) {
    console.error(
        "Missing TOKEN in .env.\n" +
        "Add it like this:\n" +
        "TOKEN=your_bot_token"
    );

    process.exit(1);
}

// ─────────────────────────────────────────────
// Client Setup
// ─────────────────────────────────────────────

const client = new Client({
    // Replace this with specific intents if possible.
    // 32767 enables every intent and may require privileged intents.
    intents: 32767,
});

client.commands = new Collection();
client.slashCommands = new Collection();

// Export the client so other files can require("./index")
module.exports = client;

// ─────────────────────────────────────────────
// Handler Setup
// ─────────────────────────────────────────────

function loadHandler() {
    try {
        const handler = require("./handler");

        if (typeof handler === "function") {
            handler(client);
            return;
        }

        if (handler && typeof handler.init === "function") {
            handler.init(client);
            return;
        }

        throw new Error(
            "The handler must export a function or an init(client) method."
        );
    } catch (error) {
        console.error("Failed to load handler:");
        console.error(error);

        process.exit(1);
    }
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

async function startBot() {
    try {
        loadHandler();

        console.log(`Token loaded successfully.`);
        console.log(`Token length: ${token.length} characters`);

        await client.login(token);

        console.log("Login successful.");
    } catch (error) {
        console.error("Login failed:");
        console.error(error);

        if (/TokenInvalid/i.test(String(error))) {
            console.error(
                "Your token is invalid. Reset it in the Discord Developer Portal " +
                "and update TOKEN in your .env file."
            );
        }

        process.exitCode = 1;
    }
}

// ─────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────

process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:");
    console.error(error);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:");
    console.error(error);
});

// Start the bot
startBot();
