const fs = require("fs");
const { execSync } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const INPUT_FILE = "./transcriber/input.mp3"; // или .wav
const WAV_FILE = "./transcriber/input.wav";
const LYRICS_FILE = "./transcriber/lyrics.txt"; // Path to the lyrics file
const PYTHON_SCRIPT = "./transcriber/align_audio.py"; // Path to the Python script
const OUTPUT_JSON = "./transcriber/words.json";
const FPS = 60;
const PYTHON_CMD = process.platform === "win32" ? "python" : "python3"; // Use python3 on Unix-like, python on Windows

// Step 1: Convert to WAV if needed
function convertToWav(input, output) {
  return new Promise((resolve, reject) => {
    console.log(`Converting '${input}' to WAV format at '${output}'...`);
    ffmpeg(input)
      .toFormat("wav")
      .on("end", () => {
        console.log("Conversion finished.");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error during conversion:", err);
        reject(err);
      })
      .save(output);
  });
}

// Step 2: Run Alignment using stable-ts via Python script
function runStableTSAlignment(audioFile, lyricsFile) {
  console.log(
    `Running stable-ts alignment via Python script: ${PYTHON_SCRIPT}`
  );
  // Construct the command. Use quotes around paths for safety.
  // Added --model base, can be changed or made configurable
  const cmd = `${PYTHON_CMD} "${PYTHON_SCRIPT}" "${audioFile}" "${lyricsFile}" --model large`;
  console.log(`Executing command: ${cmd}`);

  try {
    // Execute the command and capture stdout
    const pythonOutput = execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "inherit"],
    }); // Inherit stderr

    // Parse the JSON output from Python
    const wordTimings = JSON.parse(pythonOutput);
    console.log(`Received ${wordTimings.length} words from alignment script.`);

    // Enrich with frame timings
    const enrichedWords = wordTimings.map((word) => ({
      ...word,
      frame_start: Math.floor(word.start * FPS),
      frame_end: Math.floor(word.end * FPS),
    }));

    // Save the final JSON
    fs.writeFileSync(
      OUTPUT_JSON,
      JSON.stringify(enrichedWords, null, 2),
      "utf-8"
    );
    console.log(`✅ Done! Enriched timings saved to ${OUTPUT_JSON}`);
  } catch (error) {
    console.error(
      "Error executing Python script or processing its output:",
      error
    );
    // If execSync throws, error.stdout might contain Python's stdout before error
    if (error.stdout) {
      console.error("Python stdout before error:\n", error.stdout);
    }
    process.exit(1); // Exit with error
  }
}

// Main workflow
(async () => {
  let audioFileToProcess = INPUT_FILE;
  const ext = path.extname(INPUT_FILE).toLowerCase();

  // Check if lyrics file exists
  if (!fs.existsSync(LYRICS_FILE)) {
    console.error(`Error: Lyrics file not found at ${LYRICS_FILE}`);
    process.exit(1);
  }

  // Convert MP3 to WAV if necessary, as Whisper/stable-ts often prefer WAV
  if (ext === ".mp3") {
    try {
      await convertToWav(INPUT_FILE, WAV_FILE);
      audioFileToProcess = WAV_FILE;
    } catch (error) {
      console.error("Failed to convert MP3 to WAV. Exiting.");
      process.exit(1);
    }
  } else if (ext !== ".wav") {
    console.warn(
      `Warning: Input file is not WAV (${ext}). Alignment might be less reliable. Consider converting to WAV first.`
    );
  }

  // Check if the audio file to process exists
  if (!fs.existsSync(audioFileToProcess)) {
    console.error(`Error: Audio file not found at ${audioFileToProcess}`);
    process.exit(1);
  }

  // Run the alignment
  runStableTSAlignment(audioFileToProcess, LYRICS_FILE);
})();
