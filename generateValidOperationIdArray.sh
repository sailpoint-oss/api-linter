#!/bin/bash

# Check if arguments were provided
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 <spec_file1> <spec_file2> ..."
    exit 1
fi

# Temporary file to store operation IDs
TEMP_FILE=$(mktemp)

# Extract operation IDs from each spec file
for SPEC in "$@"; do
    if [ -f "$SPEC" ]; then
        echo "Processing $SPEC"
        # Extract operationId using yq
        yq '.paths[].[].operationId' "$SPEC" 2>/dev/null >> "$TEMP_FILE"
    else
        echo "File $SPEC not found, skipping..."
    fi
done

# Remove duplicates, sort them, and format as JSON array
UNIQUE_OPERATION_IDS=$(sort -u "$TEMP_FILE" | awk '{print "\"" $0 "\""}' ORS=',' | sed 's/,$//')

# Clean up temporary file
rm -f "$TEMP_FILE"

# Print the formatted array
echo "[$UNIQUE_OPERATION_IDS]"
