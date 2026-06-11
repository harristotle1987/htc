# Aegis CRM

Aegis CRM is a premium, high-tech executive CRM and pipeline management tool built specifically for high-ticket sales professionals. It tracks performance, manages stakeholders, tracks influence, and synchronizes with your Google Workspace.

## Features

- **Executive Pipeline:** Visual drag-and-drop kanban board for tracking leads using `@dnd-kit`.
- **Contact Priority Filtering:** Quickly sort or isolate your stakeholders by their 'priority' status.
- **Relational Database Backend:** Built with a PostgreSQL/Neon Serverless backend and Express APIs for secure, durable data persistence.
- **Google Workspace Integration:** View recent correspondence and sync directly into your CRM.
- **Two-Factor Authentication:** High-security vault access for sensitive pipeline data.
- **Scheduling & Calendar:** Integrated scheduling tools using React-Calendly and Cal.com options.
- **Vercel Ready:** Pre-configured with `vercel.json` and a serverless API structure `/api/app.ts` for quick deployment.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` variables (see `.env.example`).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```

## Deploying to Vercel

Aegis CRM relies on an Express backend. For Vercel deployments, the `/api/app.ts` serves as the entry point for Serverless Functions.

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the root directory.
3. Ensure you provide your database environment variables (like Neon Database URLs) in your Vercel project settings.

## Fixing the "Google hasn't verified this app" Error

When you deploy your app to production (e.g., using Vercel), you might see a "Google hasn't verified this app" warning when connecting Google Workspace. This is expected because your OAuth client in Google Cloud is in the "Testing" phase, or unverified. 

To fix this permanently for production, you must submit your app for verification with Google:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select the existing Google Cloud project for your app.
3. Navigate to **APIs & Services > OAuth consent screen**.
4. Make sure you set your publishing status to **In production**.
5. Under **App domain**, you are required to provide links to your Privacy Policy and Terms of Service. Aegis CRM already includes these for you! Enter the URLs where you deployed this app:
   - **Privacy Policy URL:** `https://your-domain.com/privacy.html`
   - **Terms of Service URL:** `https://your-domain.com/terms.html`
6. Submit the app for verification. Google's Trust & Safety team will review your application (which takes about 3-5 business days). Once verified, the warning screen will be completely removed for your users.

## Tech Stack

- React 19
- Vite
- Express (Backend API)
- Neon PostgreSQL
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts

## License
MIT
