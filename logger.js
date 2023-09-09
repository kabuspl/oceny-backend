import "https://deno.land/std@0.201.0/dotenv/load.ts";
import { red } from "https://deno.land/std@0.201.0/fmt/colors.ts";

export function log(level, content) {
    if(level > Deno.env.get("LOG_LEVEL")) return;
    const logLine = `[${level}] [${new Date().toISOString()}]: ${content}\n`;
    Deno.writeTextFileSync("oceny.log", logLine, {append: true});
    console.log(logLine.slice(0,-1));
}

export function error(content) {
    const logLine = `[ERROR] [${new Date().toISOString()}]: ${content}\n`;
    Deno.writeTextFileSync("oceny.log", logLine, {append: true});
    console.log(red(logLine.slice(0,-1)));
}