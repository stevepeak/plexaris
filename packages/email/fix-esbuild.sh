#!/bin/sh
# Workaround for @react-email/preview-server shipping a pre-built Next.js app
# with esbuild@0.25.10 vendored at .next/node_modules/esbuild-*. The vendored
# JS wrapper needs the matching platform binary, but Node's require.resolve
# walks up and finds a newer version from the monorepo, causing a mismatch.
#
# This script symlinks the correct @esbuild/darwin-arm64@0.25.10 binary next
# to the vendored esbuild so require.resolve finds it first.

PREVIEW_SERVER="$(dirname "$(realpath "$(pwd)/node_modules/@react-email/preview-server/package.json")")"
VENDORED_NM="$PREVIEW_SERVER/.next/node_modules"

if [ ! -d "$VENDORED_NM" ]; then
  exit 0
fi

# Find the vendored esbuild version
VENDORED_ESBUILD="$(ls -d "$VENDORED_NM"/esbuild-* 2>/dev/null | head -1)"
if [ -z "$VENDORED_ESBUILD" ]; then
  exit 0
fi

ESBUILD_VERSION="$(node -e "console.log(JSON.parse(require('fs').readFileSync('$VENDORED_ESBUILD/package.json','utf8')).version)")"

# Find the matching platform binary in the monorepo
PLATFORM_PKG="$(node -e "console.log(require.resolve('@esbuild/darwin-arm64/package.json', {paths:['$(pwd)/../../node_modules/.bun/@esbuild+darwin-arm64@${ESBUILD_VERSION}/node_modules/@esbuild/darwin-arm64']}))" 2>/dev/null)"

if [ -z "$PLATFORM_PKG" ] || [ ! -f "$PLATFORM_PKG" ]; then
  # Try finding it anywhere in .bun
  BINARY_DIR="$(ls -d "$(pwd)/../../node_modules/.bun/@esbuild+darwin-arm64@${ESBUILD_VERSION}/node_modules/@esbuild/darwin-arm64" 2>/dev/null | head -1)"
  if [ -z "$BINARY_DIR" ]; then
    echo "fix-esbuild: Could not find @esbuild/darwin-arm64@${ESBUILD_VERSION}"
    exit 0
  fi
else
  BINARY_DIR="$(dirname "$PLATFORM_PKG")"
fi

mkdir -p "$VENDORED_NM/@esbuild"
ln -sf "$BINARY_DIR" "$VENDORED_NM/@esbuild/darwin-arm64"
echo "fix-esbuild: Linked @esbuild/darwin-arm64@${ESBUILD_VERSION} for vendored esbuild"
