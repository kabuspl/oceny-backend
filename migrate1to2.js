// Simple data migrator from version 0 to 2
const dataStoreName = Deno.args[0];
const dataStore = JSON.parse(await Deno.readTextFile(`datastore/${dataStoreName}.json`));

const newDataStore = {
    dataStoreManifest: {
        version: 2
    }
};

switch(dataStoreName) {
    case "dayDiff": {
        newDataStore.content = {};
        for(const day of Object.keys(dataStore)) {
            const dayContent = dataStore[day];
            if(!dayContent.subjects) {
                newDataStore.content[day] = {};
                continue;
            }
            newDataStore.content[day] = {
                date: dayContent.date,
                subjects: {}
            }
            for(const subject of Object.keys(dayContent.subjects)) {
                newDataStore.content[day].subjects[subject] = {
                    grades: {
                        ...dayContent.subjects[subject]
                    },
                    average: 0
                }
            }
        }
        break;
    }
    case "diff": {
        newDataStore.content = [];
        for(const content of dataStore) {
            let temp1 = {
                date: content.date,
                subjects: {}
            }
            let temp = {};
            for(const subject of Object.keys(content.subjects)) {
                temp[subject] = {
                    grades: {
                        ...content.subjects[subject]
                    },
                    average: 0
                }
            }
            temp1.subjects = temp;
            newDataStore.content.push(temp1);
        }
        break;
    }
    case "history": {
        newDataStore.content = {};
        for(const day in dataStore) {
            const dayContent = dataStore[day];
            newDataStore.content[day] = {}
            for(const subject of Object.keys(dayContent)) {
                newDataStore.content[day][subject] = {
                    grades: {
                        ...dayContent[subject]
                    },
                    average: 0
                }
            }
        }
        break;
    }
}

await Deno.writeTextFile(`datastore/${dataStoreName}.new.json`, JSON.stringify(newDataStore));
