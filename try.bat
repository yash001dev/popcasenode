@echo off
setlocal enabledelayedexpansion

:: Step 1: Iterate all images in the current directory
for %%f in (*.jpg *.jpeg *.png *.bmp *.gif) do (
    set "image_name=%%~nf"
    set "image_ext=%%~xf"
    set "folder_path=%CD%\!image_name!"

    if not exist "!folder_path!" (
        :: Folder with image name doesn't exist, create it
        echo Creating folder "!folder_path!"...
        mkdir "!folder_path!"
    ) else (
        echo Folder "!folder_path!" already exists.
    )

    :: Step 2: Ask for the model name
    set /p "model_name=What's your model name for image '!image_name!'? "

    set "model_folder_path=!folder_path!\!model_name!"

    if not exist "!model_folder_path!" (
        :: Create model folder inside the image folder
        echo Creating model folder "!model_folder_path!"...
        mkdir "!model_folder_path!"
        echo Moving image "%%f" to "!model_folder_path!"...
        move "%%f" "!model_folder_path!"
    ) else (
        echo Model folder "!model_folder_path!" already exists.
        
        :: Step 3: Model folder already exists, generate random name
        call :generate_random_name random_name
        set "new_image_name=!image_name!_!random_name!!image_ext!"

        :: Check if the generated file name already exists in the destination folder
        if exist "!model_folder_path!\!new_image_name!" (
            echo Error: File "!new_image_name!" already exists. Generating a new random name...
            call :generate_random_name random_name
            set "new_image_name=!image_name!_!random_name!!image_ext!"
        )

        :: Rename the image with the generated random name and move it to the existing model folder
        echo Renaming "%%f" to "!new_image_name!" and moving it to "!model_folder_path!"...
        ren "%%f" "!new_image_name!"
        move "!new_image_name!" "!model_folder_path!\"
    )
)
goto :eof

:: Function to generate an 8-character random name
:generate_random_name
setlocal enabledelayedexpansion
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
set "name="

:: Loop 8 times to build an 8-character random name
for /L %%i in (1,1,8) do (
    set /A "index=!random! %% 36"  :: Generate a random index from 0 to 35 (for 36 characters)
    set "name=!name!!chars:~!index!,1!"  :: Append the character at the random index to the name
)

endlocal & set "%1=%name%"  :: Return the generated name
goto :eof