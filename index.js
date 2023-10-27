import "dotenv/config";
import * as dataUtils from "./dataUtils.js";
import * as diffCalculator from "./diffCalculator.js";
import * as uonetApi from "./uonetApiHandler.js";
import * as webhookHandler from "./webhookHandler.js";
import { log } from "./logger.js";
import { startHttpApi } from "./api.js";

// Import dataStores from datastore_import to datastore dir if IMPORT_DATASTORE is "true". Used to import existing data to docker container.
if(process.env.IMPORT_DATASTORE && process.env.IMPORT_DATASTORE == "true") {
    await dataUtils.importDataStore("diff");
    await dataUtils.importDataStore("dayDiff");
    await dataUtils.importDataStore("history");
}

// Load dataStores from disks or set default values if they don't exist yet
const diffDataStore = await dataUtils.loadDataStore("diff", []);
export const diff = diffDataStore.content;
const dayDiffDataStore = await dataUtils.loadDataStore("dayDiff", {});
export const dayDiff = dayDiffDataStore.content;
const historyDataStore = await dataUtils.loadDataStore("history", {});
export const history = historyDataStore.content;

async function updateData() {
    log(2, "Starting data update...");

    // Get dates formatted as YYYY-MM-DD strings
    const currentDate = dataUtils.getDateStr();
    const yesterdayDate = dataUtils.getDateStr(new Date(new Date().setDate(new Date().getDate()-1)))

    // Get full grades state from yesterday from history
    const gradesYesterday = history[yesterdayDate]
    // Get full grades state before update from history
    let gradesBefore = history[currentDate];

    // If gradesBefore for today is empty, set it to gradesYesterday
    if(!gradesBefore) gradesBefore = gradesYesterday;

    // Update grades from server, if failed - stop execution
    const gradesNow = await uonetApi.getCurrentGrades();
    if(!gradesNow) return;

    // Push updated grades to history for today
    history[currentDate] = gradesNow

    // Generate dayDiff and diff
    const dayDiffNow = diffCalculator.generateDiff(gradesYesterday, gradesNow, true);
    const diffNow = diffCalculator.generateDiff(gradesBefore, gradesNow);

    // Set dayDiff for current date in global object
    dayDiff[currentDate] = dayDiffNow;

    // Push diff to global array if it's not empty and send Discord message
    if(diffNow) {
        log(2, "Diff is not empty");
        diff.push(diffNow);
        webhookHandler.sendEmbed(
            webhookHandler.webhooks.normal_grades,
            "Nowe oceny",
            webhookHandler.diffToFields(diffNow,gradesBefore)
        )
        log(2, "Sent new grades notification to webhook.");
    } else {
        log(2, "Diff is empty");
    }

    // Save updated dataStores
    dataUtils.saveDataStore("diff", diffDataStore);
    dataUtils.saveDataStore("dayDiff", dayDiffDataStore);
    dataUtils.saveDataStore("history", historyDataStore);
    log(2, "Saved dataStores.");

    log(1, "Finished data update.");
}

startHttpApi();
updateData();
setInterval(updateData, process.env.UPDATE_RATE_MS);