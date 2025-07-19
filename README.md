# Now & Then

A professional countdown timer and deadline tracking application built with Next.js, designed to help users manage goals, events, and deadlines with beautiful, responsive timers.

## Features

- ⏰ **Multiple Timer Types**: Countdown and count-up timers
- 📌 **Categories**: Organize timers into Pinned, General, Personal, Custom, and Hidden categories
- 🔄 **Cross-Device Sync**: Sign in with Google to sync timers across devices
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🎨 **Modern UI**: Clean, minimal design with smooth animations
- 🔍 **Search**: Quickly find specific timers
- 👁️ **Privacy Controls**: Hide timers and manage visibility

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd NowAndThen
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables file:
```bash
touch .env.local
```

4. Add the following to `.env.local`:
```bash
# AdSense Configuration
# Set to 'true' only after Google AdSense approval
NEXT_PUBLIC_ADSENSE_APPROVED=true

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://nowandthen.app
NEXT_PUBLIC_SITE_NAME=Now & Then

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## AdSense Configuration

The application includes Google AdSense integration for monetization. Ad spaces are controlled by the `NEXT_PUBLIC_ADSENSE_APPROVED` environment variable:

- **Before AdSense Approval**: Set `NEXT_PUBLIC_ADSENSE_APPROVED=false` to hide all ad spaces
- **After AdSense Approval**: Set `NEXT_PUBLIC_ADSENSE_APPROVED=true` to display ads

This prevents empty ad spaces or errors from showing to users before your AdSense account is approved.

### Ad Placement Locations

- Main page: Below navigation links
- Timer grid: After 4+ timers are displayed

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
└── public/               # Static assets
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to [Vercel](https://vercel.com)
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Environment Variables for Production

Make sure to set these in your deployment environment:

```bash
NEXT_PUBLIC_ADSENSE_APPROVED=false  # Set to true after AdSense approval
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
