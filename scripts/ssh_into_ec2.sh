#!/usr/bin/env bash
# EC2 connection defaults — sourced by deployPortfolio.sh

EC2_KEY="../keys/prometheus_key.pem"
EC2_USER="ec2-user"
EC2_HOST="ec2-100-55-4-105.compute-1.amazonaws.com"

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  cd "$(dirname "$0")/.." || exit 1
  exec ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}"
fi
