import { Request, Response } from "express";
import axios from "axios";
export const connectPowerAutomate = async (req: Request, res: Response): Promise<void> => {
    try {
         const flowUrl = process.env.POWER_AUTOMATE_FLOW_URL || "https://defaulte9d2138743f14e06a253f9ed9096dc.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/a96efb0c5bfd418db345408ee5830796/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=I8hNILxhyN9K4E7F4pjOuHd6KnJ78fMlo_1o153Emp0"; 
        if (!flowUrl) {
            throw new Error("Power Automate flow URL not configured");
        }

        const payload = req.body;
        const participantSummary = {
            "level": "Beginner",
            "goal": "Weight loss"
        }

        payload.participantSummary = participantSummary;
        const response = await axios.post(flowUrl, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        res.json({ message: "Power Automate flow triggered successfully", data: response.data });
    }
    catch (error) {
        console.error("Error connecting to Power Automate:", error);
        res.status(500).json({ message: "Error connecting to Power Automate", error });
    }
}