#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

WWWROOT="$PWD/wwwroot"
ICONS_DIR="$WWWROOT/icons"
DATA_DIR="$WWWROOT/data"
TEMP_DIR=$(mktemp -d)
STAGED_DIR="$TEMP_DIR/staged"
EXTRACTED_DIR="$TEMP_DIR/extracted"
BACKUP_DIR="$TEMP_DIR/backup"
PROVIDERS=(aws azure gcp entra fabric microsoft365 powerplatform dynamics365)
PROCESSED_PROVIDERS=()
COMMIT_STARTED=0
DATA_CHANGED=0
DATA_BACKED_UP=0
PYTHON_BIN="${PYTHON:-python3}"

mkdir -p "$STAGED_DIR" "$EXTRACTED_DIR" "$BACKUP_DIR"

if ! "$PYTHON_BIN" -c 'import sys' >/dev/null 2>&1; then
    PYTHON_BIN=python
    if ! "$PYTHON_BIN" -c 'import sys' >/dev/null 2>&1; then
        echo "Python 3 is required to generate icon metadata." >&2
        exit 1
    fi
fi

cleanup() {
    local status=$?
    trap - EXIT

    if (( status != 0 && COMMIT_STARTED )); then
        echo "Update failed; restoring the previous icon catalog." >&2
        for provider in "${PROCESSED_PROVIDERS[@]}"; do
            rm -rf "$ICONS_DIR/$provider"
            if [[ -d "$BACKUP_DIR/$provider" ]]; then
                mv "$BACKUP_DIR/$provider" "$ICONS_DIR/$provider"
            fi
        done

        if (( DATA_CHANGED )); then
            rm -rf "$DATA_DIR"
            if (( DATA_BACKED_UP )); then
                mv "$BACKUP_DIR/data" "$DATA_DIR"
            fi
        fi
    fi

    rm -rf "$TEMP_DIR"
    exit "$status"
}
trap cleanup EXIT

download_archive() {
    local name=$1
    local url=$2
    local archive="$TEMP_DIR/$name.zip"

    echo "Downloading $name icons..." >&2
    curl --fail --location --retry 3 --silent --show-error --output "$archive" "$url"
    unzip -tq "$archive" >/dev/null
    printf '%s\n' "$archive"
}

stage_archive() {
    local provider=$1
    local archive=$2
    local destination="$STAGED_DIR/$provider"

    mkdir -p "$destination" "$EXTRACTED_DIR/$provider"
    unzip -q "$archive" -d "$EXTRACTED_DIR/$provider"
}

require_svg_icons() {
    local provider=$1
    local count
    count=$(find "$STAGED_DIR/$provider" -type f -iname '*.svg' ! -path '*/.*' | wc -l | tr -d ' ')
    if (( count == 0 )); then
        echo "No SVG icons found in the staged $provider package." >&2
        return 1
    fi
    echo "Staged $count $provider SVG icons."
}

echo "Finding the latest AWS architecture icon package..."
AWS_PAGE=$(curl --fail --location --silent --show-error https://aws.amazon.com/architecture/icons/)
AWS_URL=$(printf '%s' "$AWS_PAGE" | grep -oE 'https://d1\.awsstatic\.com/[^"<>[:space:]]*Icon-package_[^"<>[:space:]]*\.zip' | sed 's/&amp;/\&/g' | tail -n 1 || true)
if [[ -z "$AWS_URL" ]]; then
    echo "Could not find the current AWS icon package on the official download page." >&2
    exit 1
fi

echo "Finding the latest Azure architecture icon package..."
AZURE_PAGE=$(curl --fail --location --silent --show-error https://learn.microsoft.com/en-us/azure/architecture/icons/)
AZURE_URL=$(printf '%s' "$AZURE_PAGE" | grep -oE 'https://arch-center\.azureedge\.net/icons/Azure_Public_Service_Icons_V[0-9]+\.zip' | head -n 1 || true)
if [[ -z "$AZURE_URL" ]]; then
    echo "Could not find the current Azure icon package on the official download page." >&2
    exit 1
fi

AWS_ARCHIVE=$(download_archive aws "$AWS_URL")
AZURE_ARCHIVE=$(download_archive azure "$AZURE_URL")
GCP_CORE_ARCHIVE=$(download_archive gcp-core https://services.google.com/fh/files/misc/core-products-icons.zip)
GCP_CATEGORY_ARCHIVE=$(download_archive gcp-category https://services.google.com/fh/files/misc/category-icons.zip)
GCP_LEGACY_ARCHIVE=$(download_archive gcp-legacy https://services.google.com/fh/files/misc/google-cloud-legacy-icons.zip)
FABRIC_ARCHIVE=$(download_archive fabric https://raw.githubusercontent.com/microsoft/fabric-samples/main/docs-samples/Icons.zip)
M365_ARCHIVE=$(download_archive microsoft365 https://go.microsoft.com/fwlink/?linkid=869455)
ENTRA_ARCHIVE=$(download_archive entra "https://download.microsoft.com/download/3/1/a/31a56038-856a-4489-88e4-ee5a1c4352be/Microsoft%20Entra%20architecture%20icons%20-%20Oct%202023.zip")
POWERPLATFORM_ARCHIVE=$(download_archive powerplatform https://download.microsoft.com/download/498606aa-6d27-4f13-aa5c-1401078c153b/Power-Platform-icons-scalable.zip)
DYNAMICS365_ARCHIVE=$(download_archive dynamics365 https://download.microsoft.com/download/498606aa-6d27-4f13-aa5c-1401078c153b/Dynamics-365-icons-scalable.zip)

stage_archive aws "$AWS_ARCHIVE"
rm -rf "$EXTRACTED_DIR/aws/__MACOSX"
cp -R "$EXTRACTED_DIR/aws"/. "$STAGED_DIR/aws/"

stage_archive azure "$AZURE_ARCHIVE"
cp -R "$EXTRACTED_DIR/azure/Azure_Public_Service_Icons" "$STAGED_DIR/azure/"

stage_archive gcp "$GCP_CORE_ARCHIVE"
cp -R "$EXTRACTED_DIR/gcp"/. "$STAGED_DIR/gcp/"
stage_archive gcp "$GCP_CATEGORY_ARCHIVE"
cp -R "$EXTRACTED_DIR/gcp"/. "$STAGED_DIR/gcp/"
stage_archive gcp "$GCP_LEGACY_ARCHIVE"
cp -R "$EXTRACTED_DIR/gcp"/. "$STAGED_DIR/gcp/"

stage_archive fabric "$FABRIC_ARCHIVE"
FABRIC_SVG_DIR=$(find "$EXTRACTED_DIR/fabric" -type d -path '*/package/dist/svg' -print -quit)
if [[ -z "$FABRIC_SVG_DIR" ]]; then
    echo "Could not find the SVG icons in the official Fabric package." >&2
    exit 1
fi
mkdir -p "$STAGED_DIR/fabric/svg"
cp -R "$FABRIC_SVG_DIR"/. "$STAGED_DIR/fabric/svg/"

stage_archive microsoft365 "$M365_ARCHIVE"
cp -R "$EXTRACTED_DIR/microsoft365"/. "$STAGED_DIR/microsoft365/"

stage_archive entra "$ENTRA_ARCHIVE"
cp -R "$EXTRACTED_DIR/entra"/. "$STAGED_DIR/entra/"

stage_archive powerplatform "$POWERPLATFORM_ARCHIVE"
cp -R "$EXTRACTED_DIR/powerplatform"/. "$STAGED_DIR/powerplatform/"

stage_archive dynamics365 "$DYNAMICS365_ARCHIVE"
cp -R "$EXTRACTED_DIR/dynamics365"/. "$STAGED_DIR/dynamics365/"

for provider in "${PROVIDERS[@]}"; do
    require_svg_icons "$provider"
done

COMMIT_STARTED=1
for provider in "${PROVIDERS[@]}"; do
    if [[ -e "$ICONS_DIR/$provider" ]]; then
        mv "$ICONS_DIR/$provider" "$BACKUP_DIR/$provider"
    fi
    PROCESSED_PROVIDERS+=("$provider")
    mv "$STAGED_DIR/$provider" "$ICONS_DIR/$provider"
done

if [[ -d "$DATA_DIR" ]]; then
    mv "$DATA_DIR" "$BACKUP_DIR/data"
    DATA_BACKED_UP=1
fi
DATA_CHANGED=1
mkdir -p "$DATA_DIR"
"$PYTHON_BIN" generate-metadata.py

echo "All official icon packages were validated, installed, and indexed."
