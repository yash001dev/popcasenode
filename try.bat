@echo off
setlocal enabledelayedexpansion

:: Ask for the image number only once
set /p "image_number=What's the image number? "

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

    :: Step 2: Ask for the model name (only once per image)
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
        
        :: Step 3: Model folder already exists, append the image number
        set "new_image_name=!image_name!_!image_number!!image_ext!"

        :: Check if the generated file name already exists in the destination folder
        if exist "!model_folder_path!\!new_image_name!" (
            echo Error: File "!new_image_name!" already exists. Skipping the file...
        ) else (
            :: Rename the image with the appended image number and move it to the existing model folder
            echo Renaming "%%f" to "!new_image_name!" and moving it to "!model_folder_path!"...
            ren "%%f" "!new_image_name!"
            move "!new_image_name!" "!model_folder_path!\"
        )
    )
)
goto :eof