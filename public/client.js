console.log("Hello from client.js");
const button = document.getElementById('playButton');

button.addEventListener('click', function() {
  const confirmed = confirm('Are you sure you want to create an AudioContext?');

  if (confirmed) {
    AudioFuc();
  }
});
const AudioFuc = () => {
// Fetch WebSocket URL from the server
  const audioContext = new AudioContext();
  console.log(audioContext)
  fetch("/ws-url")
  .then((response) => response.json())
  .then((data) => {
    let wsUrl = data.wsUrl; // Now you have wsUrl

    // Now the rest of your code goes here...

    let rtspUrl = window.prompt(
      "Enter the RTSP link in the format 'rtsp://server.com/path'. If your RTSP server requires a username and password, do not include it here. You will be prompted for these in the next steps."
    );
    let username = window.prompt(
      "Enter the username for the RTSP server. If no username is required, simply press 'Enter' or 'OK' to skip."
    );
    let password = window.prompt(
      "Enter the password for the RTSP server. If no password is required, simply press 'Enter' or 'OK' to skip."
    );

    // Append username and password to the rtspUrl if they exist
    if (username && password) {
      let parts = rtspUrl.split("://");
      rtspUrl = parts[0] + "://" + username + ":" + password + "@" + parts[1];
    }

    fetch("/set-rtsp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rtspUrl: rtspUrl,
      }),
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        // Start the video player
        player = new JSMpeg.Player(`wss://${location.hostname}:${wsUrl}/`, {
          canvas: document.getElementById("videoCanvas"),
          autoplay: false,
        });

        let isPlaying = false; // Initial state is playing
        const playPauseButton = document.getElementById("playPauseButton");

        playPauseButton.addEventListener("click", function () {
          if (isPlaying) {
            player.pause();
            playPauseButton.classList.remove("bx-pause");
            playPauseButton.classList.add("bx-play");
          } else {
            player.play();
            playPauseButton.classList.remove("bx-play");
            playPauseButton.classList.add("bx-pause");
          }

          isPlaying = !isPlaying;
        });

        const stopButton = document.getElementById("stopButton");
        stopButton.addEventListener("click", function () {
          player.destroy();
          // Ensure that play button is shown after stopping
          playPauseButton.classList.remove("bx-pause");
          playPauseButton.classList.add("bx-play");
          isPlaying = false;
          alert("Stream stopped. Refresh the page to start a new stream.");
        });
      })
      .catch((error) => console.error("Error:", error));
  })
  .catch((error) => console.error("Error fetching WebSocket URL:", error));


}
