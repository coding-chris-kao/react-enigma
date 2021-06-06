#!/usr/bin/env sh
# 當發生錯誤時終止腳本運行
set -e
# 打包
npm run build
# 移動至到打包後的 build 目錄 
cd build
#因為 build 資料夾預設是被ignore的，因此在進入 build 資料夾後初始化git
git init 
git add -A
git commit -m 'deploy'
# 部署到 https://github.com/coding-chris-kao/react-enigma.git 分支為 gh-pages
# 將 build 資料夾中的內容推送至遠端eric-project的gh-pages分支中，並強制無條件將舊有的內容取代成目前的內容（指令 git push -f)
git push -f https://github.com/coding-chris-kao/react-enigma.git master:gh-pages
cd -