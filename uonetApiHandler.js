export async function getCurrentGrades() {
    const data = await (
        await fetch(
            "http://127.0.0.1:4090/api/v1/Statystyki.mvc/GetOcenyCzastkowe",
            {
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body:'{"idOkres":28654, "apiKey":"f77c9cf0-14a4-4afb-b56e-c37502b12084"}'
            }
        )
    ).json();
    const returnBuilder = {}
    for(const subject of data.data) {
        const classSeries = subject.ClassSeries;
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
}