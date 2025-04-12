import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

app.post("/api/sensor-data", (req, res) => {
  const { temperature, humidity, pressure } = req.body;
  console.log("Dane z POST:", req.body);

  io.emit("sensor-data", {
    temperature,
    humidity,
    pressure,
  });

  res.status(200).json({ message: "Dane wysłane." });
});

setInterval(() => {
  const simulatedData = {
    temperature: (Math.random() * 30 + 15).toFixed(1),
    humidity: (Math.random() * 100).toFixed(1),
    pressure: (Math.random() * 50 + 1000).toFixed(1),
  };

  io.emit("sensor-data", simulatedData);
  console.log("Wysłano dane:", simulatedData);
}, 10000);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
