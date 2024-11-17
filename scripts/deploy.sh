#!/bin/bash

# chmod -R a+rwx assets/
# chmod -R a+rwx game/
scp -r dist/* bm:~/www/apps/boom
