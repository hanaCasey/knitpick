#!/usr/bin/env bash
# deploy the built app to a hugging face static space.
#
# usage:   HF_TOKEN=hf_xxx ./scripts/deploy.sh <user>/<space>
# example: HF_TOKEN=hf_xxx ./scripts/deploy.sh hannah/knitpick
#
# needs a hugging face access token with "write" permission:
# https://huggingface.co/settings/tokens

set -euo pipefail

SPACE="${1:-${HF_SPACE:-}}"

if [[ -z "${HF_TOKEN:-}" || -z "$SPACE" ]]; then
	echo "usage: HF_TOKEN=hf_xxx ./scripts/deploy.sh <user>/<space>" >&2
	exit 1
fi

OWNER="${SPACE%%/*}"
NAME="${SPACE##*/}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "» building"
npm --prefix "$ROOT" run build

echo "» ensuring space $SPACE exists"
USERNAME=$(curl -sf -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/whoami-v2 | sed -n 's/.*"name":"\([^"]*\)".*/\1/p' | head -1)
CREATE_BODY="{\"type\":\"space\",\"name\":\"$NAME\",\"sdk\":\"static\",\"private\":false"
if [[ "$OWNER" != "$USERNAME" ]]; then
	CREATE_BODY+=",\"organization\":\"$OWNER\""
fi
CREATE_BODY+="}"
HTTP_CODE=$(curl -s -o /tmp/hf-create-resp.json -w "%{http_code}" -X POST \
	-H "Authorization: Bearer $HF_TOKEN" -H "Content-Type: application/json" \
	-d "$CREATE_BODY" https://huggingface.co/api/repos/create)
if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "409" ]]; then
	echo "space creation failed (http $HTTP_CODE):" >&2
	cat /tmp/hf-create-resp.json >&2
	exit 1
fi

STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

cp -r "$ROOT/build/." "$STAGE/"
cat > "$STAGE/README.md" <<'EOF'
---
title: knitpick
emoji: 🧶
colorFrom: red
colorTo: pink
sdk: static
pinned: false
---

personal knitting helper — patterns, row counters, progress log.
all data stays in the browser (IndexedDB); this space only serves the app.
EOF

echo "» pushing to https://huggingface.co/spaces/$SPACE"
cd "$STAGE"
git init -q -b main
git -c user.name=deploy -c user.email=deploy@local add -A
git -c user.name=deploy -c user.email=deploy@local commit -qm "deploy"
git push -q --force "https://$USERNAME:$HF_TOKEN@huggingface.co/spaces/$SPACE" main

echo "✓ live at https://${OWNER}-${NAME}.hf.space"
