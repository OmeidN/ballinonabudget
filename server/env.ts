import dotenv from "dotenv";
dotenv.config();

export const USE_MONGO = process.env.USE_MONGO || "false";
