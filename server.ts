import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { checkChatRateLimit } from "./src/lib/chatRateLimiter";
import { saveChatMessage } from "./src/lib/chat";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal error");
    }
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  // Expose io on globalThis so API routes can broadcast (e.g. announcements)
  (globalThis as any).io = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("chat:send", async (data: {
      userId: string;
      username: string;
      message: string;
      isVerified: boolean;
    }) => {
      // Server-side rate limit: 1 message / 2s per user
      const rateLimitResult = checkChatRateLimit(data.userId, 1, 2000);

      if (!rateLimitResult) {
        socket.emit("chat:error", {
          error: "Too many messages. Slow down (1 message / 2s).",
        });
        return;
      }

      // Save to DB via lib/chat
      const result = await saveChatMessage(
        data.userId,
        data.username,
        data.message,
        "global",
        undefined,
        undefined,
        data.isVerified
      );

      if (result.success && result.message) {
        // Broadcast to all connected clients
        io.emit("chat:message", {
          _id: result.message._id,
          userId: result.message.userId,
          username: result.message.username,
          avatarUrl: result.message.avatarUrl,
          level: result.message.level,
          isVerified: result.message.isVerified,
          message: result.message.message,
          createdAt: result.message.createdAt,
          roomId: "global",
          isDeleted: false,
          replyTo: null,
          isPinned: false,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  server.listen(port, () => {
    console.log("> Ready on http://localhost:" + port);
  });
}).catch((ex) => {
  console.error("Error preparing Next.js app:", ex);
  process.exit(1);
});