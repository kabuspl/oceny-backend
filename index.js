import { generateDiff } from "./diffCalculator.js";
import { getCurrentGrades } from "./uonetApiHandler.js";

async function test() {
    let gra = await getCurrentGrades();
    console.log(gra)
    await new Promise(r => setTimeout(r, 10000));
    let newd = await getCurrentGrades();
    console.log(newd);
    console.log(generateDiff(gra,newd));
}

// test();

const diff = [];
const dayDiff = {};
const history = {};

function getDateStr(date = new Date()) {
    return date.toISOString().substring(0,10);
}

async function updateData() {
    const currentDate = getDateStr();
    const yesterdayDate = getDateStr(new Date().setDate(new Date().getDate() - 1))

    // Get full grades state from yesterday from history
    const gradesYesterday = history[yesterdayDate]
    // Get full grades state before update from history
    const gradesBefore = history[currentDate];
    // Update grades from server
    const gradesNow = await getCurrentGrades();

    // Push updated grades to history for today
    history[currentDate] = gradesNow

    // Generate dayDiff and diff
    const dayDiffNow = generateDiff(gradesYesterday, gradesNow, true);
    const diffNow = generateDiff(gradesBefore, gradesNow);

    // Set dayDiff for current date in global object
    dayDiff[currentDate] = dayDiffNow;

    // Push diff to global array if it's not empty
    if(diffNow) diff.push(diffNow);
}

updateData();
setInterval(updateData,10000);