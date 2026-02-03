# Google Authentication Setup Guide

The application requires a `client_secret.json` file to communicate with Google's OAuth servers. This file identifies your application to Google and allows users to log in.

## 1. Create a Project on Google Cloud
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown (top left) and select **New Project**.
3. Name it "Event Horizon" (or similar) and click **Create**.

## 2. Configure Consent Screen
1. In the sidebar, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (unless you have a Google Workspace organization) and click **Create**.
3. **App Information**:
   - App name: `Event Horizon`
   - User support email: Select your email.
   - Developer contact information: Enter your email.
4. Click **Save and Continue** until you finish. (You can skip Scopes and Test Users for now, or add yourself as a Test User if selecting 'External' with 'Testing' status).

## 3. Create Credentials
1. In the sidebar, go to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3. **Application type**: Select **Web application**.
4. **Name**: `Event Horizon Local`.
5. **Authorized JavaScript origins**:
   - Add: `http://localhost:5173`
6. **Authorized redirect URIs**:
   - Add: `http://localhost:8001/auth/callback`
   - *Important*: This must match exactly what is in the backend code.
7. Click **Create**.

## 4. Download and Place File
1. You will see a "OAuth client created" popup.
2. Click the **Download JSON** button (looks like a download arrow).
3. **Rename** the downloaded file to `client_secret.json`.
4. **Move** this file into your project's `backend/` folder.
   - Path: `c:\Users\nexge\Music\Projects\Event Horizon\backend\client_secret.json`

## 5. Restart Backend
1. If the backend is running, stop it (Ctrl+C).
2. Start it again: `python backend/main.py`.

## 6. Test
1. Go to the app: `http://localhost:5173`.
2. Click **Initialize Link**.
3. You should now be redirected to Google to sign in!
