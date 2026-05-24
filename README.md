# Aegis Vault

Aegis Vault is a premium, high-tech executive CRM and pipeline management tool built for high-ticket sales professionals. It diagnoses issues, manages stakeholders, tracks influence, and synchronizes with your Google Workspace.

## Features

- **Executive Pipeline:** Visual drag-and-drop kanban board for tracking leads.
- **Influence Mapping:** Map out stakeholders, budget anchors, and decision-makers for complex enterprise deals.
- **Google Workspace Integration:** View recent correspondence and sync directly into your CRM.
- **Two-Factor Authentication:** High-security vault access for sensitive pipeline data.
- **Offline / Local First:** Leverages local storage for fast, responsive performance in preview.

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
3. Run the development server:
   ```bash
   npm run dev
   ```

## Fixing the "Google hasn't verified this app" Error

When you deploy your app to production (e.g., using Vercel), you might see a "Google hasn't verified this app" warning when connecting Google Workspace. This is expected because your OAuth client in Google Cloud is in the "Testing" phase, or unverified. 

To fix this permanently for production, you must submit your app for verification with Google:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select the existing Google Cloud project for your app.
3. Navigate to **APIs & Services > OAuth consent screen**.
4. Make sure you set your publishing status to **In production**.
5. Under **App domain**, you are required to provide links to your Privacy Policy and Terms of Service. Aegis Vault already includes these for you! Enter the URLs where you deployed this app:
   - **Privacy Policy URL:** `https://your-domain.com/privacy.html`
   - **Terms of Service URL:** `https://your-domain.com/terms.html`
6. Submit the app for verification. Google's Trust & Safety team will review your application (which takes about 3-5 business days). Once verified, the warning screen will be completely removed for your users.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

## License
MIT
