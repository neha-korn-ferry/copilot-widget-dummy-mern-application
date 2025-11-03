import { Request, Response } from "express";
import axios from "axios";
import { CustomError } from "../middleware/errorHandler";
import { config } from "../config";

export const getBotToken = async (req: Request, res: Response): Promise<void> => {
  if (!config.directLineTokenEndpoint) {
    throw new CustomError("Direct Line token endpoint not configured", 500);
  }

  try {
    const resp = await axios.get(config.directLineTokenEndpoint, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000, // 10 second timeout
    });

    const { token, conversationId, expires_in = 3600 } = resp.data;
    if (!token) {
      throw new CustomError("No token received from Direct Line endpoint", 500);
    }

    // OPTIONAL: add any data you want the bot to see
    const meta = {
      // appToken: 'abc123',
      // sessionId: uuidv4(),
    };

    res.json({ token, conversationId, meta, expires_in });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new CustomError(`Failed to fetch token: ${error.message}`, 502);
    }
    throw error;
  }
};

