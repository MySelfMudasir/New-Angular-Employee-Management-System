@echo off

:: Get the current date in the format MM/dd/yyyy
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
set "dt=%dt:~4,2%/%dt:~6,2%/%dt:~0,4%"

:: Add all changes to the Git staging area
git add .

:: Commit the changes with the current date in the commit message
git commit -m "Update (%dt%)"

:: Push the changes to GitHub
git push

echo Commit and push successful!
pause
