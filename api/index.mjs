if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
const { app } = await import("../server/index.mjs");
export default app;
