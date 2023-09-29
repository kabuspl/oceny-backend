// Simple data migrator from version 0 to 2
const dataStoreName = Deno.args[0];
const dataStore = JSON.parse(await Deno.readTextFile(`datastore/${dataStoreName}.json`));

const newDataStore = {
    dataStoreManifest: {
        version: 2
    }
};

function calculateAvg(grades) {
    let avgTemp = 0;
    let count = 0;
    for(const grs in grades) {
        const gr = parseInt(grs);
        avgTemp+=(gr+1)*grades[gr];
        count+=grades[gr];
    }
    let avg = avgTemp/count;
    return Math.floor(avg*100)/100;
}

switch(dataStoreName) {
    case "dayDiff": {
        newDataStore.content = {};
        for(const day of Object.keys(dataStore)) {
            const dayContent = dataStore[day];
            newDataStore.content[day] = {
                date: dayContent.date,
                subjects: {}
            }
            for(const subject of Object.keys(dayContent.subjects)) {
                newDataStore.content[day].subjects[subject] = {
                    grades: {
                        ...dayContent.subjects[subject]
                    },
                    average: calculateAvg(dayContent.subjects[subject])
                }
            }
        }
        break;
    }
    case "diff": {
        newDataStore.content = {};
        for(const content of dataStore) {
            let temp1 = {
                date: content.date,
                subjects: {}
            }
            let temp = {};
            for(const subject of Object.keys(content.subjects)) {
                temp.subjects[subject] = {
                    grades: {
                        ...content.subjects[subject]
                    },
                    average: calculateAvg(content.subjects[subject])
                }
            }
            temp1.subjects = temp;
        }
        break;
    }
    case "history": {
        newDataStore.content = {};
        for(const day in dataStore) {
            const dayContent = dataStore[day];
            newDataStore.content[day] = {}
            for(const subject in Object.keys(dayContent)) {
                newDataStore.content[day][subject] = {
                    grades: {
                        ...dayContent[subject]
                    },
                    average: calculateAvg(dayContent[subject])
                }
            }
        }
        break;
    }
}

await Deno.writeTextFile(`datastore/${dataStoreName}.new.json`, JSON.stringify(newDataStore));
