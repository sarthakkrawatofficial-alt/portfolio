#!/bin/sh
# 5-second showreel test preview — runs on your Mac, nothing is uploaded.
# Usage:  sh test_preview.sh "/Users/you/Videos/RCB Documentary.mp4" 40
#   1st value = your clip, 2nd value = second of the clip to start from (default 0)
# Needs ffmpeg (brew install ffmpeg) and the unzipped Showreel_Graphics_Alpha folder next to this file.
CLIP="$1"; START="${2:-0}"; D="$(cd "$(dirname "$0")" && pwd)"; G="$D/Showreel_Graphics_Alpha"
ffmpeg -y -ss "$START" -t 5 -i "$CLIP" -i "$G/04_chapter_04_cinema-bars.mov" -itsoffset 1.045 -i "$G/06_letterbox_hold.mov" \
  -itsoffset 1.4 -i "$G/LT_15_RCB.mov" -ss 28 -t 5 -i "$G/09_hud.mov" \
  -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30[b];[b][1:v]overlay=eof_action=pass[v1];[v1][2:v]overlay=eof_action=pass[v2];[v2][3:v]overlay=eof_action=pass[v3];[4:v]setpts=PTS-STARTPTS[h];[v3][h]overlay=eof_action=pass,format=yuv420p[v]" \
  -map "[v]" -map "0:a?" -t 5 -c:v libx264 -crf 18 -c:a aac -movflags +faststart "$D/test_preview_5s.mp4"
echo "Done: $D/test_preview_5s.mp4"
