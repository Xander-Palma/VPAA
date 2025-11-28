import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Declare module for rawBody for custom parsing
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Middleware for JSON body parsing and rawBody extraction
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Middleware for URL-encoded form parsing
app.use(express.urlencoded({ extended: false }));

// Custom logging function
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Middleware for logging API request/response times and payloads
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Async function to register routes and setup static or Vite
(async () => {
  await registerRoutes(httpServer, app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err; // Rethrow for logging
  });

  // Serve static files in production only
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // Dynamically import Vite for development
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Set up the server to listen on a specified port
  const port = parseInt(process.env.PORT || "5000", 10);

  // Bind to localhost (127.0.0.1). Only enable `reusePort` on platforms
  // that support it (e.g., Linux). `reusePort` can cause ENOTSUP on
  // some environments (notably Windows), so we guard it here.
  const listenOptions: any = {
    port,
    host: "127.0.0.1",
  };

  if (process.platform === "linux") {
    listenOptions.reusePort = true;
  }

  httpServer.listen(listenOptions, () => {
    log(`Server is running on http://127.0.0.1:${port}`);
  });
})();
