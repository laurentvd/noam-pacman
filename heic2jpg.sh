#!/bin/bash
# Convert HEIC files to JPG using macOS sips
# Usage: ./heic2jpg.sh <input_dir> [output_dir] [quality]

set -euo pipefail

INPUT_DIR="${1:?Usage: $0 <input_dir> [output_dir] [quality]}"
OUTPUT_DIR="${2:-$INPUT_DIR}"
QUALITY="${3:-90}"

if [ ! -d "$INPUT_DIR" ]; then
  echo "Error: '$INPUT_DIR' is not a directory" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

count=0
for heic in "$INPUT_DIR"/*.HEIC "$INPUT_DIR"/*.heic; do
  [ -f "$heic" ] || continue
  basename="${heic##*/}"
  name="${basename%.*}"
  output="$OUTPUT_DIR/${name}.jpg"
  echo "Converting: $basename -> ${name}.jpg"
  sips -s format jpeg -s formatOptions "$QUALITY" "$heic" --out "$output" >/dev/null
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "No HEIC files found in '$INPUT_DIR'"
  exit 1
fi

echo "Done: $count file(s) converted to '$OUTPUT_DIR'"
