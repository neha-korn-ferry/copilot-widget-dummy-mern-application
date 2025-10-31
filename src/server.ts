import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from 'axios'
import authRoutes from "./routes/auth.routes";
import participantRoutes from "./routes/participant.routes";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const allowOrigin = ((process.env.NODE_ENV ==='development') ? 'http://localhost:3001' :  process.env.CLIENT_ORIGIN) ;
const DIRECT_LINE_TOKEN_ENDPOINT = process.env.DIRECT_LINE_TOKEN_ENDPOINT || '';


app.use(express.json());
app.use(cors({
  origin: allowOrigin, 
  credentials: true,               
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use("/auth", authRoutes);
app.use(participantRoutes);
app.get('/api/bot-token', async (req, res) => {
  try {
    const resp = await axios.get(DIRECT_LINE_TOKEN_ENDPOINT, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const { token, conversationId, expires_in = 3600 } = resp.data;
    if (!token) throw new Error('no token');

    // OPTIONAL: add any data you want the bot to see
    const meta = {
      // appToken: 'abc123',
      // sessionId: uuidv4(),
    };

    res.json({ token, conversationId, meta });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'token fetch failed' });
  }
});

app.listen(PORT, () => {  
  console.log(`API server listening on port ${PORT}`);
});