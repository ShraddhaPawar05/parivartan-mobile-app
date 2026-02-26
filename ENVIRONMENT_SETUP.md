# Environment Setup Guide

This guide explains how to set up environment variables for the Parivartan project.

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Cloudinary account created at [Cloudinary Console](https://cloudinary.com/console)

## Setup Steps

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Select your web app or create one
6. Copy the configuration values

### 3. Get Cloudinary Configuration

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Login to your account
3. From the Dashboard, copy your **Cloud Name**
4. Go to Settings → Upload → Upload Presets
5. Create or select an **unsigned** upload preset
6. Copy the preset name

### 4. Fill .env File

Open `.env` and fill in your values:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 5. Restart Development Server

After updating `.env`, restart your Expo development server:

```bash
npx expo start --clear
```

## Important Notes

- **NEVER commit `.env` file to Git** - it contains sensitive credentials
- The `.env.example` file is safe to commit - it only contains placeholders
- All environment variables must start with `EXPO_PUBLIC_` to be accessible in Expo
- Changes to `.env` require restarting the development server

## Troubleshooting

### Firebase not connecting
- Verify all Firebase environment variables are set correctly
- Check that your Firebase project is active
- Ensure you've enabled Authentication and Firestore in Firebase Console

### Cloudinary uploads failing
- Verify your cloud name is correct
- Ensure the upload preset exists and is set to "unsigned"
- Check that the preset name matches exactly (case-sensitive)

### Environment variables not loading
- Restart the Expo development server with `--clear` flag
- Verify variable names start with `EXPO_PUBLIC_`
- Check for typos in variable names

## Security Best Practices

1. Never share your `.env` file
2. Use different Firebase projects for development and production
3. Rotate API keys if they are accidentally exposed
4. Keep `.env` in `.gitignore` at all times
5. Use Firebase Security Rules to protect your database
6. Set up Cloudinary upload restrictions (file size, formats, etc.)

## For Team Members

When cloning this repository:

1. Copy `.env.example` to `.env`
2. Ask team lead for the actual environment values
3. Fill in your `.env` file
4. Never commit your `.env` file

## Production Deployment

For production builds, set environment variables in your CI/CD pipeline or hosting platform:

- **Expo EAS Build**: Use `eas.json` secrets
- **Vercel/Netlify**: Use environment variable settings in dashboard
- **GitHub Actions**: Use repository secrets

Refer to your deployment platform's documentation for specific instructions.
