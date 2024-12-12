@echo off

REM Iterate through each folder in the current directory
for /d %%d in (*) do (
    REM Move files from the folder to the current directory
    move "%%d\*" . >nul 2>&1
)

REM Notify the user that the task is complete
echo All files have been moved to the current directory.

REM Pause to allow the user to see the output
pause
