import "dotenv/config";
import { error } from "./logger.js";

export async function getCurrentGrades() {
    try {
        const data = await (
            await fetch(
                "http://127.0.0.1:4090/api/v1/Statystyki.mvc/GetOcenyCzastkowe",
                {
                    method:'POST',
                    headers: {'Content-Type': 'application/json'},
                    body:'{"idOkres":'+process.env.UONET_API_IDOKRES+', "apiKey":"'+process.env.UONET_API_KEY+'"}'
                }
            )
        ).json();
        const returnBuilder = {}
        for(const subject of data.data) {
            const classSeries = subject.ClassSeries;
            if(classSeries.IsEmpty) {
                returnBuilder[subject.Subject] = {
                    grades: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: 0,
                        6: 0
                    },
                    average: 0
                }
            } else {
                returnBuilder[subject.Subject] = {
                    grades: {
                        1: classSeries.Items[5].Value,
                        2: classSeries.Items[4].Value,
                        3: classSeries.Items[3].Value,
                        4: classSeries.Items[2].Value,
                        5: classSeries.Items[1].Value,
                        6: classSeries.Items[0].Value
                    },
                    average: parseFloat(classSeries.Average)
                }
            }
        }
        return returnBuilder;
    } catch(e) {
        error(e);
        return null;
    }
}