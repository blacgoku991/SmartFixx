#!/usr/bin/env bash
# Assemble des aperçus en planche : outils/planche.sh sortie.jpg colonnes img1 img2 …
set -euo pipefail
OUT=$1; COLS=$2; shift 2
FF=$(dirname "$0")/../node_modules/ffmpeg-static/ffmpeg
n=$#; ins=(); for f in "$@"; do ins+=(-i "$f"); done
rows=$(( (n + COLS - 1) / COLS )); layout=""
for ((k=0;k<n;k++)); do c=$((k % COLS)); r=$((k / COLS)); x="0"; y="0"
  for ((j=0;j<c;j++)); do x="${x}+w0"; done; for ((j=0;j<r;j++)); do y="${y}+h0"; done
  layout="${layout}${layout:+|}${x}_${y}"; done
"$FF" -hide_banner -loglevel error -y "${ins[@]}" -filter_complex "xstack=inputs=$n:layout=$layout:fill=black" "$OUT"
