const POMODORO_DURATION = 25 * 60;

const timerElement = document.getElementById("timer");
const statusElement = document.getElementById("status");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");

let remainingSeconds = POMODORO_DURATION;
let intervalId = null;
let audioContext = null;
let isAlarmPlaying = false;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerElement.textContent = formatTime(remainingSeconds);
}

function setStatus(message) {
  statusElement.textContent = message;
}

function stopAlarm() {
  isAlarmPlaying = false;
}

function playAlarm() {
  if (isAlarmPlaying) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  audioContext ??= new AudioContextClass();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  isAlarmPlaying = true;
  const startAt = audioContext.currentTime;

  // A few short ringing pulses gives a clock-like alarm without any audio file.
  for (let i = 0; i < 6; i += 1) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const pulseStart = startAt + i * 0.38;
    const pulseEnd = pulseStart + 0.22;

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(i % 2 === 0 ? 880 : 740, pulseStart);

    gainNode.gain.setValueAtTime(0.0001, pulseStart);
    gainNode.gain.exponentialRampToValueAtTime(0.18, pulseStart + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, pulseEnd);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(pulseStart);
    oscillator.stop(pulseEnd);
  }

  window.setTimeout(() => {
    stopAlarm();
  }, 2500);
}

function finishTimer() {
  window.clearInterval(intervalId);
  intervalId = null;
  remainingSeconds = 0;
  updateTimerDisplay();
  setStatus("Time is up. Nice work.");
  startButton.disabled = false;
  playAlarm();
}

function tick() {
  remainingSeconds -= 1;

  if (remainingSeconds <= 0) {
    finishTimer();
    return;
  }

  updateTimerDisplay();
}

function startTimer() {
  if (intervalId !== null) {
    return;
  }

  if (remainingSeconds <= 0) {
    remainingSeconds = POMODORO_DURATION;
    updateTimerDisplay();
  }

  setStatus("Focus mode is on");
  startButton.disabled = true;

  intervalId = window.setInterval(tick, 1000);
}

function resetTimer() {
  window.clearInterval(intervalId);
  intervalId = null;
  stopAlarm();
  remainingSeconds = POMODORO_DURATION;
  updateTimerDisplay();
  setStatus("Ready to focus");
  startButton.disabled = false;
}

startButton.addEventListener("click", startTimer);
resetButton.addEventListener("click", resetTimer);

updateTimerDisplay();
