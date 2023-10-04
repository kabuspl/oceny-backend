import fs from "fs/promises";

const SUPPORTED_DATASTORE_VERSION = 2;

/**
 * Load dataStore from hard disk or return default value if dataStore doesn't exist.
 * @param {string} name - Name of dataStore to load.
 * @param {object | object[]} defaultValue - Default value to return if dataStore doesn't exit.
 * @returns {object | object[]} dataStore object or array.
 */
export async function loadDataStore(name, defaultValue) {
    try {
        const dataStore = JSON.parse(await fs.readFile(`datastore/${name}.json`, {encoding: "utf-8"}));
        if(dataStore.dataStoreManifest.version == SUPPORTED_DATASTORE_VERSION) {
            return dataStore;
        } else {
            throw new Error(`DataStore is incompatible! Version: ${dataStore.dataStoreManifest.version}; Expected: ${SUPPORTED_DATASTORE_VERSION}`)
        }
    }catch(e) {
        return {
            dataStoreManifest: {
                version: 2
            },
            content: defaultValue
        };
    }
}

/**
 * Save dataStore to hard disk.
 * @param {string} name - Name of dataStore to save.
 * @param {object | object[]} content - Content of dataStore.
 */
export async function saveDataStore(name, content) {
    await fs.writeFile(`datastore/${name}.json`, JSON.stringify(content), {encoding: "utf-8"});
}

/**
 * Get date string formatted as YYYY-MM-DD.
 * @param {Date} [date = new Date()] - Date object, defaults to *new Date()*.
 * @returns {string} Date string formatted as YYYY-MM-DD.
 */
export function getDateStr(date = new Date()) {
    return date.toISOString().substring(0,10);
}