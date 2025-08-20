@echo off
chcp 65001 > nul

REM Set the conda environment name
set ENV_NAME=sc_al

REM Check if the environment exists
conda info --envs | findstr /i "%ENV_NAME%" > nul
if errorlevel 1 (
    echo Environment %ENV_NAME% not found. Creating from sc_al_env.yml...
    conda env create -f environment.yml
)

REM Activate the environment and run Uvicorn server in the background
call conda activate %ENV_NAME%
start "" cmd /c "python -m uvicorn app.main:app --reload"
