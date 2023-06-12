const express = require("express");
const app = express();
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const which = require('which');
const Stream = require("node-rtsp-stream");

const port = process.env.PORT || 3000;

let stream;

// This is needed to parse the body of POST requests
app.use(express.json());

const server = app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

const ffmpegPath = which.sync('ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// Event: Connection established
wss.on('connection', function connection(ws) {
  console.log('A new client connected');

  ws.on('message', function incoming(message) {
    console.log('Received message:', message);
    // Handle the received message
  });
});

app.get("/ws-url", (req, res) => {
  res.send({ wsUrl: process.env.WS_URL || port });
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
      wsPort: server,
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

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

wss.on('listening', () => {
  console.log('WebSocket server started and listening on port 3000.');
});
