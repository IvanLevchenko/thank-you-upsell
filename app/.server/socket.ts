import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { SyncService } from "./services/sync-service";
import { SocketEvents } from "../enums/socket-events";

const app = express();
app.use(cors({ origin: "*" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected " + socket.id);

  socket.on(SocketEvents.SYNC_PRODUCTS, (storeName: string) => {
    console.log("syncing products for " + storeName);
    SyncService.syncProducts(socket, storeName, () => {});
  });
});

server.listen(3005, () => {
  console.log("server is running on port 3005");
});
