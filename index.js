import "https://deno.land/std@0.201.0/dotenv/load.ts";
import * as dataUtils from "./dataUtils.js";
import * as diffCalculator from "./diffCalculator.js";
import * as uonetApi from "./uonetApiHandler.js";
import * as webhookHandler from "./webhookHandler.js";

// Load dataStores from disks or set default values if they don't exist yet
const diff = await dataUtils.loadDataStore("diff", []);
const dayDiff = await dataUtils.loadDataStore("dayDiff", {});
const history = await dataUtils.loadDataStore("history", {});

async function updateData() {
    // Get dates formatted as YYYY-MM-DD strings
    const currentDate = dataUtils.getDateStr();
    const yesterdayDate = dataUtils.getDateStr(new Date(new Date().setDate(new Date().getDate()-1)))

    // Get full grades state from yesterday from history
    const gradesYesterday = history[yesterdayDate]
    // Get full grades state before update from history
    const gradesBefore = history[currentDate];
    // Update grades from server
    const gradesNow = await uonetApi.getCurrentGrades();

    // Push updated grades to history for today
    history[currentDate] = gradesNow

    // Generate dayDiff and diff
    const dayDiffNow = diffCalculator.generateDiff(gradesYesterday, gradesNow, true);
    const diffNow = diffCalculator.generateDiff(gradesBefore, gradesNow);

    // Set dayDiff for current date in global object
    dayDiff[currentDate] = dayDiffNow;

    // Push diff to global array if it's not empty and send Discord message
    if(diffNow) {
        diff.push(diffNow);
        webhookHandler.sendEmbed(
            webhookHandler.webhooks.normal_grades,
            "Nowe oceny",
            webhookHandler.diffToFields(diffNow)
        )
    }

    // Save updated dataStores
    dataUtils.saveDataStore("diff", diff);
    dataUtils.saveDataStore("dayDiff", dayDiff);
    dataUtils.saveDataStore("history", history);
}

updateData();
setInterval(updateData, Deno.env.get("UPDATE_RATE_MS"));