#! /usr/bin/env bash

echo "[deploy] pushing code ..."
git push
echo "[deploy] ssh'ing ..."
ssh auw1 bash << EOF
cd /var/www/searchengine-admin-backend
echo "[deploy] pulling code ..."
git pull
echo "[deploy] installing dependencies ..."
npm install --production
echo "[deploy] compiling ..."
npx prisma generate
echo "[deploy] restarting ..."
sudo ./restart.sh
EOF

echo "[deploy] done"
