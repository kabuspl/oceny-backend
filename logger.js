import "https://deno.land/std@0.201.0/dotenv/load.ts";
import { red } from "https://deno.land/std@0.201.0/fmt/colors.ts";
import * as webhookHandler from "./webhookHandler.js";

/**
 * Log text to stdin (when user configured log_level higher or equal to message's level) and file.
 * @param {number} level - Log level. Higher number is more verbose.
 * @param {string} content - Message.
 */
export function log(level, content) {
    if(level > Deno.env.get("LOG_LEVEL")) return;
    const logLine = `[${level}] [${new Date().toISOString()}]: ${content}\n`;
    Deno.writeTextFileSync("oceny.log", logLine, {append: true});
    console.log(logLine.slice(0,-1));
}

/**
 * Log error to stdout, file and discord webhook.
 * @param {Error} content - Error thrown by code.
 */
export function error(content) {
    const logLine = `[ERROR] [${new Date().toISOString()}]: ${content}\n`;
    Deno.writeTextFileSync("oceny.log", logLine, {append: true});
    webhookHandler.sendEmbed(
        webhookHandler.webhooks.errors,
        "Error",
        [{
            title: content.name,
            content: content.message
        }]
    );
    console.log(red(logLine.slice(0,-1)));
}