# Aklatibo - Mobile Deployment Guide (Low-RAM Headless Workflow)

This project uses a customized, lightweight pipeline to compile and deploy the Next.js frontend into a native Android app via Capacitor **without opening Android Studio**, preserving laptop memory (ideal for 8GB RAM setups).

---

## Prerequisites & Environment Setup

Ensure your `~/.bashrc` file inside WSL Linux contains the correct paths to the Windows Android SDK and the local Linux Java 21 runtime:

```bash
# Link WSL to Windows Android SDK(only for wsl env development)
export ANDROID_HOME=/mnt/c/Users/lenovo/AppData/Local/Android/Sdk
export ANDROID_USER_HOME=/mnt/c/Users/lenovo/.android
export ANDROID_EMULATOR_HOME=/mnt/c/Users/lenovo/.android
# Set Java 21 Home (Linux Native)
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
# Update System Path
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$JAVA_HOME/bin
```
## Step 1
### powershell command to make connection to the phone:
```bash
& C:\Users\lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

### logcat command
```bash
cloith@DESKTOP-1TUT7LN:~/projects/Aklatibo/aklatibo/mobile/android$ /mnt/c/Users/lenovo/AppData/Local/Android/Sdk/platform-tools/adb.exe logcat *:S Capacitor:V Capacitor/Plugin:V Auth:V GoogleSignIn:V
```

## Hardware Preparation
### Connect your physical Android device to your laptop via a USB cable. 

### Ensure USB Debugging is turned on under Settings -> Developer Options on your handset.

## step 2
### run:
```bash
npm run mobile:run
```


# todo:
Move to secret management:

- PostgreSQL password
- JWT signing key
- Cloudflare tunnel token
- Google OAuth client secret (if used later)
- SMTP credentials (future)
- Bitwarden API credentials
- GitHub tokens
- AI provider API keys

Public values:
- Google OAuth Client ID
- JWT Issuer
- JWT Audience



"Textbooks provided by OpenStax. This app uses open educational resources under the Creative Commons Attribution 4.0 International (CC BY 4.0) license. Access the original material for free at openstax.org."
