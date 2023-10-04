import { isEqual } from "lodash-es";

/**
 * Create diff of two grade objects.
 * @param {object | null} before - Data before update.
 * @param {object} now - Current, updated data.
 * @param {boolean} [returnEmpty=false] - Whether it should return empty object instead of undefined when there are no changes
 * @returns {object} Changes in grades compared to **before**.
 */
export function generateDiff(before, now, returnEmpty = false) {
    // Skip whole diff if data is the same as before
    if(isEqual(before, now)) {
        if(returnEmpty) {
            return {};
        }else{
            return;
        }
    }

    // If before is empty return current data
    if(!before) {
        return {
            date: new Date().toISOString(),
            subjects: now
        };
    }

    const diffBuilder = {};

    for(const subjectName in now) {
        const subjectNow = now[subjectName];
        const subjectBefore = before[subjectName];

        // Skip if subject data is the same as before
        if(isEqual(subjectBefore, subjectNow)) continue;

        // If subject hasn't existed before, just push current data to diff
        if(!subjectBefore && subjectNow) {
            diffBuilder[subjectName] = subjectNow;
        } else { // If subject existed before, calculate changes and push to diff
            const subjectDiffBuilder = {grades: {}, average: subjectNow.average};

            // Iterate over every name of grade. If current data exists it always contains all grade names so we can use subjectNow
            for(const gradeName in subjectNow.grades) {
                const gradeNow = subjectNow.grades[gradeName];
                const gradeBefore = subjectBefore.grades[gradeName];

                // If current grade count is different than before, calculate difference and push to diff
                if(gradeNow != gradeBefore) {
                    subjectDiffBuilder.grades[gradeName] = gradeNow - gradeBefore;
                }
            }
            diffBuilder[subjectName] = subjectDiffBuilder;
        }
    }

    return {
        date: new Date().toISOString(),
        subjects: diffBuilder
    }
}