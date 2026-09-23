#!/usr/bin/env bash
# Lab PKI: root CA (5 tahun) + leaf TLS (90 hari) untuk ecommerce.local.
# Leaf boleh di-generate ulang tanpa mengganti CA (renewal).
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
CN="${CN:-ecommerce.local}"
DAYS_CA="${DAYS_CA:-1825}"
DAYS_LEAF="${DAYS_LEAF:-90}"

CA_KEY="$DIR/lab-ca.key"
CA_CRT="$DIR/lab-ca.crt"
LEAF_KEY="$DIR/$CN.key"
LEAF_CRT="$DIR/$CN.crt"
LEAF_CSR="$DIR/$CN.csr"
EXT="$DIR/$CN.ext"

umask 077

if [[ ! -f "$CA_KEY" || ! -f "$CA_CRT" ]]; then
  openssl req -x509 -newkey rsa:4096 -sha256 -days "$DAYS_CA" -nodes \
    -keyout "$CA_KEY" -out "$CA_CRT" \
    -subj "/CN=devops-homelab lab CA"
  echo "created CA: $CA_CRT"
else
  echo "reusing CA: $CA_CRT"
fi

openssl req -newkey rsa:2048 -nodes \
  -keyout "$LEAF_KEY" -out "$LEAF_CSR" \
  -subj "/CN=$CN"

cat > "$EXT" <<EOF
subjectAltName=DNS:$CN,DNS:localhost,IP:127.0.0.1
keyUsage=digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
EOF

openssl x509 -req -in "$LEAF_CSR" -CA "$CA_CRT" -CAkey "$CA_KEY" \
  -CAcreateserial -out "$LEAF_CRT" -days "$DAYS_LEAF" -sha256 -extfile "$EXT"

rm -f "$LEAF_CSR" "$EXT" "$DIR/lab-ca.srl"

echo "leaf cert: $LEAF_CRT (valid ${DAYS_LEAF}d)"
openssl x509 -in "$LEAF_CRT" -noout -subject -dates -ext subjectAltName
