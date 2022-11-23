#! /usr/bin/env bash

echo "[deploy] pushing code ..."
git push
echo "[deploy] ssh'ing ..."
ssh wwa bash << EOF
cd /var/www/auwsearch.windwardapps.com/auw-admin
echo "[deploy] pulling code ..."
git pull
echo "[deploy] installing dependencies ..."
/home/kyle/bin/yarn
echo "[deploy] compiling ..."
npx prisma generate
echo "[deploy] restarting ..."
sudo service auw-admin restart
EOF

echo "[deploy] done"
