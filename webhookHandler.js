import "dotenv/config";
import {Webhook, MessageBuilder} from "discord-webhook-node";
import * as gradeNames from "./gradeNames.js";

export const webhooks = {
    normal_grades: new Webhook(process.env.DISCORD_WEBHOOK_NORMAL_GRADES),
    semestral_grades: new Webhook(process.env.DISCORD_WEBHOOK_SEMESTRAL_GRADES),
    errors: new Webhook(process.env.DISCORD_WEBHOOK_ERRORS),
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
 * @param {object} gradesBefore - Old grades from **history**. Used to show average change.
 */
export function diffToFields(diff, gradesBefore) {
    const fields = [];
    for(const subjectName in diff.subjects) {
        const subjectData = diff.subjects[subjectName].grades;
        let text = "";
        for(const gradeName in subjectData) {
            const gradeValue = subjectData[gradeName];
            if(gradeValue==0) continue;
            text += `${gradeValue} ${gradeNames.variant(gradeName, gradeValue)}, `
        }

        // Remove last comma and space
        text = text.slice(0, -2);

        // Round current average to 2 decimals
        const averageNow = Math.floor(diff.subjects[subjectName].average*100)/100;

        // Get previous average from gradesBefore. If it doesn't exist set to 0.
        let averageBefore;
        if(!gradesBefore || !gradesBefore[subjectName]) {
            averageBefore = 0;
        } else {
            averageBefore = gradesBefore[subjectName].average;
        }

        fields.push({
            title: `${subjectName} (${averageBefore} → ${averageNow})`,
            content: text
        })
    }
    return fields;
}