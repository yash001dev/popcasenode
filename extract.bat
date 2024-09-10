@echo off
setlocal

rem Supported image file extensions
set extensions=*.jpg *.jpeg *.png *.gif *.bmp

rem Save the current directory
set "currentDir=%cd%"

rem Function to iterate through directories and copy images
for /d %%D in (*) do (
    if not "%%~nxD" == "%~nx0" (
        echo Processing folder: %%D
        pushd "%%D"
        
        rem Loop through all image files in this folder
        for %%F in (%extensions%) do (
            if exist "%%F" (
                echo Copying %%F to %currentDir%
                copy "%%F" "%currentDir%"
            )
        )
        
        popd
    )
)

echo Done!
pause
