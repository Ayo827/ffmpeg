const express = require("express");
const app = express();
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const which = require('which');



const port = process.env.PORT || 3000; // Use the PORT environment variable if it exists

const Stream = require("node-rtsp-stream");

let stream;

// This is needed to parse the body of POST requests
app.use(express.json());

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 6789 });
const ffmpegPath = which.sync('ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// Event: Connection established
wss.on('connection', function connection(ws) {
  console.log('A new client connected');

  // Event: Message received
  ws.on('message', function incoming(message) {
    console.log('Received message:', message);
    // Handle the received message
  });

  // Event: Connection closed
  ws.on('close', function close() {
    console.log('A client disconnected');
  });
});

app.get("/ws-url", (req, res) => {
  res.send({ wsUrl: process.env.WS_URL || "6789" });
});

app.post("/set-rtsp", (req, res) => {
  try {
    const rtspUrl = req.body.rtspUrl;

    // Check if a stream is already running and stop it if it is
    if (stream) {
      stream.stop();
    }

    // Start a new stream with the new URL
    stream = new Stream({
      name: "name",
      streamUrl: rtspUrl,
      wsPort: 6789,
      ffmpegOptions: {
        "-rtsp_transport": "tcp", // Add this line
        "-rtsp_flags": "prefer_tcp", // New line
        "-f": "mpegts", // output file format.
        "-codec:v": "mpeg1video", // video codec
        "-b:v": "1000k", // video bit rate
        "-stats": "",
        "-r": 25, // frame rate
        "-s": "640x480", // video size
        "-bf": 0,
        // audio
        "-codec:a": "mp2", // audio codec
        "-ar": 44100, // sampling rate (in Hz)(in Hz)
        "-ac": 1, // number of audio channels
        "-b:a": "128k", // audio bit rate
      },
    });

    res.status(200).send("RTSP URL updated and stream started.");
  } catch (error) {
    console.log(error)
    console.error(`Error setting RTSP: ${error}`);
    res.status(500).send(`Error setting RTSP: ${error}`);
  }
});

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
