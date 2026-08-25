#!/usr/bin/env bash
# Deploy portfolio frontend + Ask Samir chat API to EC2.
#
# Usage:
#   ./scripts/deployPortfolio.sh
#   ./scripts/deployPortfolio.sh -f    # frontend only
#   ./scripts/deployPortfolio.sh -a    # API only
#
# EC2 key, user, and host: scripts/ssh_into_ec2.sh
#
# Before first API deploy:
#   1. Copy server/.env.example → server/.env
#   2. Paste OPENAI_API_KEY into server/.env

set -euo pipefail

cd "$(dirname "$0")/.." || exit 1
# shellcheck source=scripts/ssh_into_ec2.sh
source scripts/ssh_into_ec2.sh

deploy_frontend=true
deploy_api=true

while getopts "fa" flag; do
  case "${flag}" in
    f) deploy_api=false ;;
    a) deploy_frontend=false ;;
  esac
done

key="$EC2_KEY"
hostname="$EC2_HOST"
ssh_target="${EC2_USER}@${EC2_HOST}"

service="portfolio"
api_name="portfolio-api"
api_port=3020
remote_api_dir="services/${api_name}"
web_root="samirrodriguez.click"
nginx_conf="scripts/nginx.samirrodriguez.click.conf"

printf "\n==== Deploying %s to %s ====\n" "$service" "$hostname"

if $deploy_frontend; then
  printf "\n----> Build frontend\n"
  npm run build
  echo "{\"version\":\"$(date +"%Y%m%d.%H%M%S")\"}" > dist/version.json

  printf "\n----> Upload frontend to EC2 staging\n"
  ssh -i "$key" "$ssh_target" "rm -rf /tmp/portfolio-deploy && mkdir -p /tmp/portfolio-deploy"
  scp -r -i "$key" dist/* "${ssh_target}:/tmp/portfolio-deploy/"

  printf "\n----> Publish frontend to /var/www/${web_root}\n"
  ssh -i "$key" "$ssh_target" << ENDSSH
set -e
sudo mkdir -p /var/www/${web_root}
sudo rsync -a --delete /tmp/portfolio-deploy/ /var/www/${web_root}/
sudo chown -R nginx:nginx /var/www/${web_root}
rm -rf /tmp/portfolio-deploy
ENDSSH

  if [[ -f "$nginx_conf" ]]; then
    printf "\n----> Install nginx site config\n"
    scp -i "$key" "$nginx_conf" "${ssh_target}:/tmp/${web_root}.conf"
    ssh -i "$key" "$ssh_target" << ENDSSH
set -e
sudo cp /tmp/${web_root}.conf /etc/nginx/conf.d/${web_root}.conf
sudo nginx -t
sudo systemctl reload nginx
rm -f /tmp/${web_root}.conf
ENDSSH
  fi

  printf "\n----> Remove local dist/ (run npm run build to regenerate)\n"
  rm -rf dist
fi

if $deploy_api; then
  if [[ ! -f server/.env ]]; then
    printf "\n⚠️  server/.env not found.\n"
    printf "    Copy server/.env.example → server/.env and paste OPENAI_API_KEY before deploying the API.\n\n"
    exit 1
  fi

  if ! grep -qE '^OPENAI_API_KEY=.+' server/.env; then
    printf "\n⚠️  OPENAI_API_KEY is empty in server/.env — paste your key first.\n\n"
    exit 1
  fi

  printf "\n----> Prepare chat API directory on EC2 (%s)\n" "$remote_api_dir"
  ssh -i "$key" "$ssh_target" << ENDSSH
rm -rf ${remote_api_dir}
mkdir -p ${remote_api_dir}/resources
ENDSSH

  printf "\n----> Upload API source\n"
  scp -i "$key" \
    server/package.json \
    server/index.js \
    server/service.js \
    server/context.js \
    "${ssh_target}:${remote_api_dir}/"

  scp -i "$key" resources/*.json "${ssh_target}:${remote_api_dir}/resources/"

  printf "\n----> Upload server/.env (OPENAI_API_KEY stays on the server)\n"
  scp -i "$key" server/.env "${ssh_target}:${remote_api_dir}/.env"

  printf "\n----> Install deps and (re)start PM2 on port %s\n" "$api_port"
  ssh -i "$key" "$ssh_target" << ENDSSH
set -e
cd ~/${remote_api_dir}
npm install --omit=dev
if pm2 describe ${api_name} >/dev/null 2>&1; then
  pm2 restart ${api_name}
else
  pm2 start index.js --name ${api_name} -- ${api_port}
fi
pm2 save
ENDSSH

  printf "\n----> API health check\n"
  ssh -i "$key" "$ssh_target" "curl -s http://127.0.0.1:${api_port}/api/health || true"
  printf "\n"
fi

printf "\n==== Done ====\n"
printf "Frontend: https://samirrodriguez.click/\n"
printf "          https://portfolio.samirrodriguez.click/\n"
printf "API:      PM2 process '%s' on port %s (proxied at /api)\n" "$api_name" "$api_port"
printf "SSL:      run once if needed: sudo certbot --nginx -d samirrodriguez.click -d www.samirrodriguez.click -d portfolio.samirrodriguez.click\n\n"
