const timer = document.getElementById("stopwatch");
const lapList = document.getElementById("lapList");
const bibEntryInput = document.getElementById("bibEntry");
const startRecordingButton = document.getElementById("startRecordingButton");
const stopRecordingButton = document.getElementById("stopRecordingButton");
const startScreenRecordingButton = document.getElementById("startScreenRecordingButton");
const stopScreenRecordingButton = document.getElementById("stopScreenRecordingButton");

let hr = 0;
let min = 0;
let sec = 0;
let tenths = 0;
let hundredths = 0;
let stoptime = true;
let lapCounter = 1;
let bibEntries = [];
let currentLapTime = "";

let webcamMediaRecorder; // For webcam video recording
let recordedWebcamChunks = [];
let screenMediaRecorder; // For screen recording
let recordedScreenChunks = [];
let screenMediaStream;

function openDirections() {
    window.open("instructions.html", "_blank");
}

function startTimer() {
    if (stoptime == true) {
        stoptime = false;
        timerCycle();
    }
}

function stopTimer() {
    if (stoptime == false) {
        stoptime = true;
    }
}

function timerCycle() {
    if (stoptime == false) {
        hundredths++;

        if (hundredths == 10) {
            tenths++;
            hundredths = 0;
        }

        if (tenths == 10) {
            sec++;
            tenths = 0;
        }

        if (sec == 60) {
            min++;
            sec = 0;
        }

        if (min == 60) {
            hr++;
            min = 0;
        }

        const formattedHr = hr.toString().padStart(2, '0');
        const formattedMin = min.toString().padStart(2, '0');
        const formattedSec = sec.toString().padStart(2, '0');
        const formattedTenths = tenths.toString();
        const formattedHundredths = hundredths.toString();

        timer.innerHTML = `${formattedHr}:${formattedMin}:${formattedSec}.${formattedTenths}${formattedHundredths}`;

        currentLapTime = `${formattedHr}:${formattedMin}:${formattedSec}.${formattedTenths}${formattedHundredths}`;

        setTimeout(timerCycle, 10); // Update every 10 milliseconds for hundredths accuracy
    }
}

function resetTimer() {
    timer.innerHTML = "00:00:00.00";
    stoptime = true;
    hr = 0;
    sec = 0;
    min = 0;
    tenths = 0;
    hundredths = 0;
    lapCounter = 1;
    lapList.innerHTML = "";
    bibEntries = [];
    currentLapTime = "";
}

function recordLap() {
    if (!stoptime) {
        const bibEntry = bibEntryInput.value || "No Bib"; // Use "No Bib" if no bib entry is provided
        const lapItem = document.createElement("li");
        lapItem.textContent = `${lapCounter} | ${currentLapTime} | ${bibEntry}`;
        lapList.appendChild(lapItem);
        lapCounter++;
        bibEntryInput.value = ""; // Clear the input field
        bibEntries.push({ bib: bibEntry, time: currentLapTime });
    }
}

function exportLaps() {
    const lapItems = lapList.querySelectorAll("li");
    const lapTimes = Array.from(lapItems).map((lap) => lap.textContent);
    const lapText = lapTimes.join("\n");

    let fileName = prompt("Enter a file name for exporting laps:", "lap_times.txt");

    if (!fileName.endsWith(".txt")) {
        fileName += ".txt";
    }

    if (fileName) {
        const blob = new Blob([lapText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
    }
}

startRecordingButton.addEventListener("click", startWebcamRecording);
stopRecordingButton.addEventListener("click", stopWebcamRecording);
startScreenRecordingButton.addEventListener("click", startScreenRecording);
stopScreenRecordingButton.addEventListener("click", stopScreenRecording);

function startWebcamRecording() {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
            recordedWebcamChunks = [];
            const webcamElement = document.getElementById("webcam");
            webcamElement.srcObject = stream;

            webcamMediaRecorder = new MediaRecorder(stream);
            webcamMediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedWebcamChunks.push(event.data);
                }
            };

            webcamMediaRecorder.onstop = () => {
                const blob = new Blob(recordedWebcamChunks, { type: "video/webm" });

                const videoURL = URL.createObjectURL(blob);

                const fileName = prompt("Enter a name for the webcam recording:", "webcam_recording.webm");
                if (fileName) {
                    const a = document.createElement("a");
                    a.href = videoURL;
                    a.download = fileName;
                    a.click();
                }
            };

            webcamMediaRecorder.start();
            startRecordingButton.disabled = true;
            stopRecordingButton.disabled = false;
        })
        .catch((error) => {
            console.error("Error accessing webcam:", error);
        });
}

function stopWebcamRecording() {
    if (webcamMediaRecorder) {
        webcamMediaRecorder.stop();
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;
    }
}

function startScreenRecording() {
    navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
            recordedScreenChunks = [];
            screenMediaStream = stream;

            screenMediaRecorder = new MediaRecorder(stream);
            screenMediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedScreenChunks.push(event.data);
                }
            };

            screenMediaRecorder.onstop = () => {
                const blob = new Blob(recordedScreenChunks, { type: "video/webm" });

                const videoURL = URL.createObjectURL(blob);

                const fileName = prompt("Enter a name for the screen recording:", "screen_recording.webm");
                if (fileName) {
                    const a = document.createElement("a");
                    a.href = videoURL;
                    a.download = fileName;
                    a.click();
                }
            };

            screenMediaRecorder.start();
            startScreenRecordingButton.disabled = true;
            stopScreenRecordingButton.disabled = false;
        })
        .catch((error) => {
            console.error("Error accessing screen recording:", error);
        });
}

function stopScreenRecording() {
    if (screenMediaRecorder) {
        screenMediaRecorder.stop();
        screenMediaStream.getTracks().forEach((track) => track.stop());
        startScreenRecordingButton.disabled = false;
        stopScreenRecordingButton.disabled = true;
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key === " " || event.key === "Spacebar") {
        if (!stoptime) {
            recordLap();
        }
    }
});
