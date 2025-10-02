@echo off
echo 🚀 Deploying Admin Portal Next.js Application...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Build the application
echo 📦 Building application...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Deploy to Vercel
    echo 🚀 Deploying to Vercel...
    call vercel --prod
    
    if %errorlevel% equ 0 (
        echo 🎉 Deployment successful!
        echo Your application is now live on Vercel!
    ) else (
        echo ❌ Deployment failed!
        exit /b 1
    )
) else (
    echo ❌ Build failed!
    exit /b 1
)
