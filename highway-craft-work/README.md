# Highway Craft UK

An independent UK learner-driver practice academy. The project combines a React + TypeScript learning dashboard, a Three.js left-hand-traffic driving simulator, theory question practice, original 3D hazard-perception exercises, Show Me / Tell Me revision, UK test-centre mapping, and an AI learning assistant.

> Highway Craft UK is an independent learning project. It is not operated, approved, or endorsed by DVSA, DVLA, or the UK Government. The practice hazard clips are original training scenes and are not the official DVSA clips.

## Learning areas

- **Theory practice:** topic revision, timed mock tests, question flags, answer review, and progress tracking.
- **Hazard perception:** 10 original interactive 3D practice clips. Each clip is scored out of 5 (50 points across this practice set). This is not a full official test simulation: the real car test uses 14 clips, 15 developing hazards, 75 available points, and a pass mark of 44.
- **3D practical simulator:** UK left-hand traffic, vehicle controls, mock route, parallel parking, bay parking, pull-up-on-the-right, and emergency-stop practice.
- **Show Me / Tell Me:** vehicle safety questions with an interactive 3D vehicle.
- **UK maps:** test-centre and local driving-related map search (requires a Google Maps browser key).
- **AI coach:** text and live voice coaching (requires a Gemini API key).

## Run locally

**Requirements:** Node.js 20.19+ (or a compatible newer release) and npm.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` (or `.env.local`, depending on your deployment platform).
3. Add the required API keys for the features you want to use:
   - `GEMINI_API_KEY` — server-side AI chat and live voice.
   - `VITE_GOOGLE_MAPS_API_KEY` — browser-side Google Maps features.
   - Firebase settings are currently provided by `firebase-applet-config.json`; configure an appropriate Firebase project and authorised Google sign-in domains before enabling cloud progress for your own deployment.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Create a production frontend build:
   ```bash
   npm run build
   ```

The app can run its learning and simulator features without signing in. Progress is saved in the browser; Google sign-in and cloud progress depend on correctly configured Firebase and server/database credentials.

## Environment variables

See `.env.example` for the full template. Never commit real server secrets. Restrict browser API keys by HTTP referrer and enable only the Google Maps APIs the project uses.

## Official UK learning references

- [Car theory test: pass marks and results](https://www.gov.uk/theory-test/pass-mark-and-result)
- [Car theory test: multiple-choice questions](https://www.gov.uk/theory-test/multiple-choice-questions)
- [Car theory test: hazard perception](https://www.gov.uk/theory-test/hazard-perception-test)
- [Car driving test: what happens](https://www.gov.uk/driving-test/what-happens-during-test)
- [Car driving test: faults and result](https://www.gov.uk/driving-test/driving-test-faults-result)
- [Know your traffic signs](https://www.gov.uk/government/publications/know-your-traffic-signs)

Official test requirements can change. Check GOV.UK before relying on any preparation material.
