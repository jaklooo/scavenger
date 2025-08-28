# 🎯 FSV UK Scavenger Hunt

Moderná mobilná aplikácia pre univerzitné scavenger hunt súťaže postavená na Next.js 14 s Firebase integráciou.

## 🚀 Rýchly Deploy na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jaklooo/scavenger)

## 🔧 Environment Variables 

Pre spustenie aplikácie je potrebné nastaviť tieto environment variables vo Vercel:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com  
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
ADMIN_EMAILS=admin1@email.com,admin2@email.com
```

## 📱 Funkcie

- 🎯 **Team Management** - Registrácia a prihlasovanie tímov
- 📸 **Media Submissions** - Upload fotiek, videí a textov  
- 🏆 **Real-time Progress** - Sledovanie postupu v reálnom čase
- 👑 **Admin Dashboard** - Správa úloh a tímov
- 📊 **Leaderboard** - Rebríček najlepších tímov
- 🔐 **Secure** - Firebase Authentication a Storage
- 📱 **Mobile-First** - Optimalizované pre mobily

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore + Storage)
- **State Management**: React Query
- **Validation**: Zod schemas
- **TypeScript**: Full type safety

## ⚡ Lokálne spustenie

```bash
# Clone repository
git clone https://github.com/jaklooo/scavenger.git
cd scavenger

# Install dependencies 
pnpm install

# Setup environment variables
cp .env.local.example .env.local
# Vyplň Firebase credentials v .env.local

# Start development server
pnpm dev
```

## 🔥 Firebase Setup

1. Vytvor nový Firebase projekt na [Firebase Console](https://console.firebase.google.com)
2. Povoľ Authentication (Email/Password + Google)
3. Vytvor Firestore database
4. Povoľ Storage
5. Skopíruj credentials do environment variables

## 📚 Dokumentácia

Kompletná dokumentácia je dostupná v [README.md](./README.md) súbore.

---

**Vytvorené pre Fakultu sociálnych vied Univerzity Komenského** 🎓
