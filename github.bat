@echo off

:: Add all changes
git add .

:: Commit changes with current date
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
set "dt=%dt:~0,8% %dt:~8,6%"
git commit -m "Update (%dt%)"

:: Push changes to GitHub
git push

echo Commit and push successful!
pause