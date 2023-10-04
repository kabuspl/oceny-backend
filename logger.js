import "dotenv/config";
import "colors";
import * as webhookHandler from "./webhookHandler.js";
import fs from "fs";

/**
 * Log text to stdin (when user configured log_level higher or equal to message's level) and file.
 * @param {number} level - Log level. Higher number is more verbose.
 * @param {string} content - Message.
 */
export function log(level, content) {
    if(level > process.env.LOG_LEVEL) return;
    const logLine = `[${level}] [${new Date().toISOString()}]: ${content}\n`;
    fs.appendFileSync("oceny.log", logLine, {encoding: "utf-8"});
    console.log(logLine.slice(0,-1));
}

/**
 * Log error to stdout, file and discord webhook.
 * @param {Error} content - Error thrown by code.
 */
export function error(content) {
    const logLine = `[ERROR] [${new Date().toISOString()}]: ${content}\n`;
    fs.appendFileSync("oceny.log", logLine, {encoding: "utf-8"});
    webhookHandler.sendEmbed(
        webhookHandler.webhooks.errors,
        "Error",
        [{
            title: content.name,
            content: content.message
        }]
    );
    console.log(logLine.slice(0,-1).red);
}