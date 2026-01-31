    // backend/src/config/env.ts
    import dotenv from "dotenv";
    dotenv.config();

    export const env = {
      PORT: process.env.PORT || 4000,
      JWT_SECRET: process.env.JWT_SECRET!,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
      APP_URL: process.env.APP_URL || "http://localhost:3000",
    };

    // Temporarily add this for debugging
    console.log("Backend JWT_SECRET:", process.env.JWT_SECRET);