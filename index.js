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
    await dataUtils.importDataStore("diffSemestral");
    await dataUtils.importDataStore("dayDiffSemestral");
    await dataUtils.importDataStore("historySemestral");
}

// Load dataStores from disks or set default values if they don't exist yet
const diffDataStore = await dataUtils.loadDataStore("diff", []);
export const diff = diffDataStore.content;
const dayDiffDataStore = await dataUtils.loadDataStore("dayDiff", {});
export const dayDiff = dayDiffDataStore.content;
const historyDataStore = await dataUtils.loadDataStore("history", {});
export const history = historyDataStore.content;

const diffSemestralDataStore = await dataUtils.loadDataStore("diffSemestral", []);
export const diffSemestral = diffSemestralDataStore.content;
const dayDiffSemestralDataStore = await dataUtils.loadDataStore("dayDiffSemestral", {});
export const dayDiffSemestral = dayDiffSemestralDataStore.content;
const historySemestralDataStore = await dataUtils.loadDataStore("historySemestral", {});
export const historySemestral = historySemestralDataStore.content;

function fixHistoryDatastore(dataStoreContent) {
    // If last key in history is not today or yesterday, we need to fix it!
    if(
        Object.keys(dataStoreContent).at(-1) != dataUtils.getDateStr() &&
        Object.keys(dataStoreContent).at(-1) != dataUtils.getDateStr(new Date(new Date().setDate(new Date().getDate()-1)))
    ) {
        log(1, "Fixing incomplete history datastore data...");
        const lastDate = Object.keys(dataStoreContent).at(-1);
        const lastEntry = dataStoreContent[Object.keys(dataStoreContent).at(-1)];
        let loopDate = new Date(lastDate);
        loopDate.setDate(loopDate.getDate()+1);
        while(loopDate<=new Date()) {
            dataStoreContent[dataUtils.getDateStr(loopDate)] = lastEntry;
            loopDate.setDate(loopDate.getDate()+1)
        }
        log(1, "Fixed incomplete history datastore data.");
    }
}

function fixDayDiffDatastore(dataStoreContent) {
    // If last key in dayDiff is not today or yesterday, we need to fix it!
    if(
        Object.keys(dataStoreContent).at(-1) != dataUtils.getDateStr() &&
        Object.keys(dataStoreContent).at(-1) != dataUtils.getDateStr(new Date(new Date().setDate(new Date().getDate()-1)))
    ) {
        log(1, "Fixing incomplete dayDiff datastore data...");
        const lastDate = Object.keys(dataStoreContent).at(-1);
        let loopDate = new Date(lastDate);
        loopDate.setDate(loopDate.getDate()+1);
        while(loopDate<=new Date()) {
            dataStoreContent[dataUtils.getDateStr(loopDate)] = {};
            loopDate.setDate(loopDate.getDate()+1)
        }
        log(1, "Fixed incomplete dayDiff datastore data.");
    }
}

// Fix data if needed
fixDayDiffDatastore(dayDiff);
fixDayDiffDatastore(dayDiffSemestral);
fixHistoryDatastore(history);
fixHistoryDatastore(historySemestral);

// Save fixed dataStores
await dataUtils.saveDataStore("dayDiff", dayDiffDataStore);
await dataUtils.saveDataStore("dayDiffSemestral", dayDiffSemestralDataStore);
await dataUtils.saveDataStore("history", historyDataStore);
await dataUtils.saveDataStore("historySemestral", historySemestralDataStore);

async function updateData() {
    log(2, "Starting data update...");

    // Get dates formatted as YYYY-MM-DD strings
    const currentDate = dataUtils.getDateStr();
    const yesterdayDate = dataUtils.getDateStr(new Date(new Date().setDate(new Date().getDate()-1)))

    // Get full grades state from yesterday from history
    const gradesYesterday = history[yesterdayDate]
    const semestralGradesYesterday = historySemestral[yesterdayDate];
    // Get full grades state before update from history
    let gradesBefore = history[currentDate];
    let semestralGradesBefore = historySemestral[currentDate];

    // If gradesBefore for today is empty, set it to gradesYesterday
    if(!gradesBefore) gradesBefore = gradesYesterday;
    if(!semestralGradesBefore) semestralGradesBefore = semestralGradesYesterday;

    // Update grades from server, if failed - stop execution
    const gradesNow = await uonetApi.getCurrentGrades();
    if(!gradesNow) return;
    const semestralGradesNow = await uonetApi.getCurrentSemestralGrades();
    if(!semestralGradesNow) return;

    // Push updated grades to history for today
    history[currentDate] = gradesNow
    historySemestral[currentDate] = semestralGradesNow

    // Generate dayDiff and diff
    const dayDiffNow = diffCalculator.generateDiff(gradesYesterday, gradesNow, true);
    const diffNow = diffCalculator.generateDiff(gradesBefore, gradesNow);
    const dayDiffSemestralNow = diffCalculator.generateDiff(semestralGradesYesterday, semestralGradesNow, true);
    const diffSemestralNow = diffCalculator.generateDiff(semestralGradesBefore, semestralGradesNow);

    // Set dayDiff for current date in global object
    dayDiff[currentDate] = dayDiffNow;
    dayDiffSemestral[currentDate] = dayDiffSemestralNow;

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
        log(2, "Grades diff is empty");
    }

    if(diffSemestralNow) {
        log(2, "Diff is not empty");
        diffSemestral.push(diffSemestralNow);
        webhookHandler.sendEmbed(
            webhookHandler.webhooks.semestral_grades,
            "Nowe oceny na semestr",
            webhookHandler.diffToFields(diffSemestralNow,semestralGradesBefore)
        )
        log(2, "Sent new semestral grades notification to webhook.");
    } else {
        log(2, "Semestral grades diff is empty");
    }

    // Save updated dataStores
    dataUtils.saveDataStore("diff", diffDataStore);
    dataUtils.saveDataStore("dayDiff", dayDiffDataStore);
    dataUtils.saveDataStore("history", historyDataStore);
    dataUtils.saveDataStore("diffSemestral", diffSemestralDataStore);
    dataUtils.saveDataStore("dayDiffSemestral", dayDiffSemestralDataStore);
    dataUtils.saveDataStore("historySemestral", historySemestralDataStore);
    log(2, "Saved dataStores.");

    log(1, "Finished data update.");
}

startHttpApi();
updateData();
setInterval(updateData, process.env.UPDATE_RATE_MS);
