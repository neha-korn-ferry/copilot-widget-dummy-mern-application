import { Request, Response } from "express";
import axios from "axios";
export const connectPowerAutomate = async (req: Request, res: Response): Promise<void> => {
    try {
        const flowUrl = "https://defaulte9d2138743f14e06a253f9ed9096dc.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/23f2f633814c4bf0bd986088d964e1aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=GIHFBG_jjEaW7plMcfNYJJ3isZSq4tQCDzYAw1uxWbI";
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