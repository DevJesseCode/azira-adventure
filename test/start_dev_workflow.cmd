@echo off
title Initialising workflow
color f4

echo =========================

title Starting: Sublime Text
echo Starting Sublime Text
start sublime_text ./
echo Successfully started Sublime Text

echo =========================

title Starting: node-server
echo Starting node-server on port 5500
start cmd /C nserv ./ 5500
echo Successfully started node-server

echo =========================

title Opening browser
echo Opening the default browser to the server address
start http://127.0.0.1:5500
echo Successfully opened browser

echo =========================

title Workflow initialization complete

ping 127.0.0.1 -n 8 > nul