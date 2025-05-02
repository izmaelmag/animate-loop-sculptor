import stable_whisper
import json
import argparse
import sys

def align_audio(audio_path, lyrics_path, model_name='base'):
    """Aligns audio with text using stable-ts and returns word timings."""
    try:
        # Load the Whisper model via stable-ts
        # Use 'base' for faster processing, consider 'small' or 'medium' for better accuracy if needed.
        # 'large' is also an option but significantly slower.
        print(f"Loading stable-ts model: {model_name}...", file=sys.stderr)
        model = stable_whisper.load_model(model_name)
        print("Model loaded.", file=sys.stderr)

        # Read the lyrics text
        with open(lyrics_path, 'r', encoding='utf-8') as f:
            lyrics = f.read()

        # Perform alignment
        print(f"Aligning audio '{audio_path}' with lyrics from '{lyrics_path}'...", file=sys.stderr)
        result = model.align(audio_path, lyrics, language='en')
        print("Alignment complete.", file=sys.stderr)

        # Extract word timings
        word_timings = []
        for segment in result.segments:
            for word in segment.words:
                # stable-ts word object structure seems to be like:
                # {'word': ' word', 'start': 1.7, 'end': 2.74, 'probability': 0.8}
                # We just need word, start, end
                word_timings.append({
                    "word": word.word, # Keep the original word format (might have leading spaces)
                    "start": word.start,
                    "end": word.end
                })

        return word_timings

    except Exception as e:
        print(f"Error during alignment: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Align audio and text using stable-ts.")
    parser.add_argument("audio_path", help="Path to the audio file (WAV recommended).")
    parser.add_argument("lyrics_path", help="Path to the text file containing lyrics.")
    parser.add_argument("--model", default="base", help="Whisper model name (e.g., base, small, medium, large).")

    args = parser.parse_args()

    timings = align_audio(args.audio_path, args.lyrics_path, args.model)

    # Output the JSON result ONLY to stdout
    json.dump(timings, sys.stdout, indent=2)
    
    # Optional: print completion message to stderr so it doesn't interfere with stdout
    # print("\nJSON output generated.", file=sys.stderr) 