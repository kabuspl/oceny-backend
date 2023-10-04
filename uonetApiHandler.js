import "dotenv/config";
import { error } from "./logger.js";
import { VulcanHandler } from "vulcan-scraper";

const vulcanHandler = new VulcanHandler(process.env.UONET_USERNAME, process.env.UONET_PASSWORD, process.env.UONET_SYMBOL);

await vulcanHandler.login();

export async function getCurrentGrades() {
    return await vulcanHandler.getClassGrades();
}