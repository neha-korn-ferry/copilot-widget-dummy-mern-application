import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import participantRoutes from "./routes/participant.routes";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const allowOrigin = ((process.env.NODE_ENV ==='development') ? 'http://localhost:3000' :  process.env.CLIENT_ORIGIN) ;

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


app.listen(PORT, () => {  
  console.log(`API server listening on port ${PORT}`);
});