import "https://deno.land/std@0.201.0/dotenv/load.ts";
import { error } from "./logger.js";

export async function getCurrentGrades() {
    try {
        const data = await (
            await fetch(
                "http://127.0.0.1:4090/api/v1/Statystyki.mvc/GetOcenyCzastkowe",
                {
                    method:'POST',
                    headers: {'Content-Type': 'application/json'},
                    body:'{"idOkres":'+Deno.env.get("UONET_API_IDOKRES")+', "apiKey":"'+Deno.env.get("UONET_API_KEY")+'"}'
                }
            )
        ).json();
        const returnBuilder = {}
        for(const subject of data.data) {
            const classSeries = subject.ClassSeries;
            if(classSeries.IsEmpty) continue;
            returnBuilder[subject.Subject] = {
                1: classSeries.Items[5].Value,
                2: classSeries.Items[4].Value,
                3: classSeries.Items[3].Value,
                4: classSeries.Items[2].Value,
                5: classSeries.Items[1].Value,
                6: classSeries.Items[0].Value
            }
        }
        return returnBuilder;
    } catch(e) {
        error(e);
        return null;
    }
}