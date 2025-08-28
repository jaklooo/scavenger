# FSV UK Scavenger Hunt

A production-ready Next.js 14 application for team-based scavenger hunts with real-time progress tracking, media submissions, and admin moderation.

## Features

- **🎯 Team-based scavenger hunt** with task management
- **📱 Mobile-first responsive design** with bottom navigation
- **🔐 Secure authentication** with Firebase Auth (Email/Password + Google)
- **📊 Real-time progress tracking** with Firestore
- **📸 Media submissions** with Firebase Storage (images/videos)
- **👑 Admin dashboard** with team management and moderation
- **🎨 Accessible UI** with proper ARIA labels and keyboard navigation
- **⚡ Performance optimized** with React Query and modern web practices

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: React Query
- **Forms & Validation**: Zod schemas
- **UI Components**: Custom components with Radix UI patterns
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Firebase project with Auth, Firestore, and Storage enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fsv-uk-scave
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ADMIN_EMAILS=admin@fsvuk.org,admin2@fsvuk.org
   ```

### Firebase Setup

1. **Create a Firebase project** at [https://console.firebase.google.com](https://console.firebase.google.com)

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google providers

3. **Set up Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Deploy security rules:
     ```bash
     firebase deploy --only firestore:rules
     ```

4. **Set up Storage**
   - Go to Storage
   - Get started with default bucket
   - Deploy storage rules:
     ```bash
     firebase deploy --only storage
     ```

5. **Deploy Security Rules**
   
   Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
   
   Deploy rules:
   ```bash
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   
   # Deploy Storage rules  
   firebase deploy --only storage
   ```

### Seed Sample Data

Run the seed script to populate the database with sample tasks:

```bash
pnpm seed
```

This will create 8 sample scavenger hunt tasks with descriptions and point values.

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # Team dashboard page
│   ├── journey/           # Tasks and progress page
│   ├── gallery/           # Team media gallery
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── landing-page.tsx   # Landing page component
│   ├── dashboard-page.tsx # Dashboard component
│   └── ...                # Other page components
├── hooks/                 # Custom React hooks
│   ├── use-auth.tsx       # Authentication hook
│   ├── use-tasks.ts       # Tasks data hooks
│   └── use-submissions.ts # Submissions data hooks
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   └── utils.ts           # Utility functions
├── schemas/               # Zod validation schemas
│   └── index.ts           # Data type definitions
└── services/              # Firebase service functions
    ├── teams.ts           # Team operations
    ├── tasks.ts           # Task operations
    ├── progress.ts        # Progress tracking
    └── submissions.ts     # Media submissions
```

## User Roles & Permissions

### Team Users
- Register new teams or login to existing accounts
- View and complete scavenger hunt tasks
- Upload images/videos for task submissions
- Track team progress and view gallery
- Access only their team's data

### Admin Users
- Full access to admin dashboard
- View all teams and their progress
- Moderate submissions (approve/reject)
- Manage tasks and team data
- Access determined by email allowlist in `ADMIN_EMAILS`

## Security

The application implements comprehensive security through Firebase rules:

- **Authentication required** for all data access
- **Team isolation** - users can only access their team's data
- **Admin override** - admins can access all data for moderation
- **Firestore rules** prevent cross-team data access
- **Storage rules** ensure team-specific file access

## Deployment

### Netlify

1. **Build settings**:
   - Build command: `pnpm build`
   - Publish directory: `out` (if using static export) or `.next`

2. **Environment variables**: Add all Firebase config variables in Netlify dashboard

3. **Deploy**: Connect your repository and deploy

### Vercel

1. **Connect repository** to Vercel
2. **Add environment variables** in project settings
3. **Deploy**: Automatic deployment on push

## Development Guidelines

### Adding New Tasks

Tasks can be added through the admin interface or by modifying the seed script and re-running it.

### Customizing UI

The design system uses a primary color (`#BB133A`) defined in Tailwind config. Modify `tailwind.config.ts` to change the color scheme.

### Adding Features

1. Define data schemas in `src/schemas/`
2. Create service functions in `src/services/`
3. Build custom hooks in `src/hooks/`
4. Create UI components in `src/components/`

## Testing

Run type checking:
```bash
pnpm type-check
```

Run linting:
```bash
pnpm lint
```

## Performance

- **React Query** for efficient data fetching and caching
- **Image optimization** with Next.js Image component
- **Code splitting** with dynamic imports
- **Responsive images** and video handling
- **Accessibility** features built-in

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader support
- Reduced motion respect

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## License

© 2025 FSV UK. All rights reserved.

## Support

For technical support or questions about the application, please contact the development team.

---

**Built with ❤️ for FSV UK using Next.js 14, TypeScript, and Firebase**
