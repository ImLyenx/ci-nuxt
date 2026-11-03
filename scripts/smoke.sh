#!/usr/bin/env bash
set -uo pipefail

failed=0

check() {
  local url=$1 status=$2
  shift 2
  local body code
  body="$(mktemp)"
  code="$(curl -sSL -o "$body" -w '%{http_code}' --max-time 20 \
    --retry 3 --retry-connrefused "$url")"

  if [[ "$code" != "$status" ]]; then
    echo "FAIL $url: expected $status, got $code"
    failed=1
    return
  fi
  for text in "$@"; do
    if ! grep -qF -- "$text" "$body"; then
      echo "FAIL $url: missing $text"
      failed=1
      return
    fi
  done
  echo "ok   $url"
}

if [[ -n "${API_URL:-}" ]]; then
  check "$API_URL/health" 200 '"ok":true'
  check "$API_URL/wishlist" 200
fi

for site in ${SSR_URL:-} ${SSG_URL:-}; do
  check "$site/" 200 '<title>PokéWishlist</title>'
  check "$site/pokemon/pikachu" 200 \
    '<title>Pikachu | PokéWishlist</title>' \
    '<meta name="description"' \
    '#25 Pikachu'
  check "$site/pokemon/missingno" 404
done

exit "$failed"
