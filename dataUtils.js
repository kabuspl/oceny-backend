/**
 * Load dataStore from hard disk or return default value if dataStore doesn't exist.
 * @param {string} name - Name of dataStore to load.
 * @param {object | object[]} defaultValue - Default value to return if dataStore doesn't exit.
 * @returns {object | object[]} dataStore object or array.
 */
export async function loadDataStore(name, defaultValue) {
    try {
        return JSON.parse(await Deno.readTextFile(`datastore/${name}.json`))
    }catch(e) {
        if(e instanceof Deno.errors.NotFound) {
            return defaultValue;
        }else{
            throw e;
        }
    }
}

/**
 * Save dataStore to hard disk.
 * @param {string} name - Name of dataStore to save.
 * @param {object | object[]} content - Content of dataStore.
 */
export async function saveDataStore(name, content) {
    await Deno.writeTextFile(`datastore/${name}.json`, JSON.stringify(content));
}

/**
 * Get date string formatted as YYYY-MM-DD.
 * @param {Date} [date = new Date()] - Date object, defaults to *new Date()*.
 * @returns {string} Date string formatted as YYYY-MM-DD.
 */
export function getDateStr(date = new Date()) {
    return date.toISOString().substring(0,10);
}