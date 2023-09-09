import "https://deno.land/std@0.201.0/dotenv/load.ts";
import {Webhook, MessageBuilder} from "npm:discord-webhook-node";
import * as gradeNames from "./gradeNames.js";

export const webhooks = {
    normal_grades: new Webhook(Deno.env.get("DISCORD_WEBHOOK_NORMAL_GRADES")),
    semestral_grades: new Webhook(Deno.env.get("DISCORD_WEBHOOK_SEMESTRAL_GRADES")),
    errors: new Webhook(Deno.env.get("DISCORD_WEBHOOK_ERRORS")),
}

/**
 * Send embed to discord webhook.
 * @param {Webhook} webhook - Webhook object. Get it from **webhooks** const.
 * @param {string} title - Title of embed.
 * @param {{title: string, content: string}[]} fields - Fields of content.
 */
export function sendEmbed(webhook, title, fields) {
    const embed = new MessageBuilder();
    embed.setTitle(title);
    for(const field of fields) {
        embed.addField(field.title, field.content);
    }
    webhook.send(embed);
}

/**
 * Convert diff to discord embed fields
 * @param {object} diff - Diff object from **generateDiff()**
 */
export function diffToFields(diff) {
    const fields = [];
    for(const subjectName in diff.subjects) {
        const subjectData = diff.subjects[subjectName];
        let text = "";
        for(const gradeName in subjectData) {
            const gradeValue = subjectData[gradeName];
            if(gradeValue==0) continue;
            text += `${gradeValue} ${gradeNames.variant(gradeName, gradeValue)}, `
        }

        // Remove last comma and space
        text = text.slice(0, -2);

        fields.push({
            title: subjectName,
            content: text
        })
    }
    return fields;
}