#!/bin/bash

ssh -t bm "rm -rf ~/www/apps/boom/*"
scp -r dist/* bm:~/www/apps/boom
ssh -t bm "cd ~/www/apps/boom && chmod -R a+rwx assets/ && chmod -R a+rwx wad/"
