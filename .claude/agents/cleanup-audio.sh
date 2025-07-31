#!/bin/bash
# Cleanup script for work-completion-summary audio files
# Keeps only the most recent 5 audio files

AUDIO_DIR="/Users/henrylee/Repos/th/.claude/agents/work-recordings"

if [ -d "$AUDIO_DIR" ]; then
    # Count files
    FILE_COUNT=$(ls -1 "$AUDIO_DIR"/*.wav 2>/dev/null | wc -l)
    
    if [ "$FILE_COUNT" -gt 5 ]; then
        # Keep only the 5 most recent files
        ls -t "$AUDIO_DIR"/*.wav | tail -n +6 | xargs rm -f
        echo "Cleaned up old audio files. Kept the 5 most recent."
    else
        echo "No cleanup needed. Only $FILE_COUNT files present."
    fi
else
    echo "Audio directory not found: $AUDIO_DIR"
fi