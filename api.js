import express from "express";
import { diff, dayDiff, history } from "./index.js";
import { log } from "./logger.js";

export async function startHttpApi() {
    const app = express();

    app.get("/api/v1/getDayDiff", (_req, res) => {
        const dayDiffFlat = {};
        for(const date of Object.keys(dayDiff)) {
            dayDiffFlat[date] = {
                ...dayDiff[date].subjects
            }
        }
        res.send({
            success: true,
            data: dayDiffFlat
        });
    });

    app.get("/api/v1/getDayDiffForDate/:date", (req, res) => {
        const date = req.params.date;
        if(dayDiff[date]) {
            res.send({
                success: true,
                data: dayDiff[date].subjects
            });
        }else{
		    res.send({
                success: false,
                data: {
                    error: "No data for provided date or invalid date"
                }
            });
        }
    });

    app.listen(4080, ()=>{
        log(1, "Started HTTP server on port 4080.");
    })
}