# Clubbs 📚

**Clubbs** is a comprehensive mobile application designed to revolutionize how students discover, engage with, and participate in campus organizations and events. Built for university communities, Clubbs bridges the gap between student organizations and potential members by providing an intuitive platform for club discovery, event management, and community building.

## 🎯 Purpose

Campus life is enriched by student organizations, but many students struggle to find clubs that align with their interests, and club organizers often face challenges in reaching their target audience. Clubbs solves these problems by:

- **Streamlining Discovery**: Helping students find organizations that match their interests and goals
- **Centralizing Information**: Providing a single platform for all club-related information and events
- **Enhancing Engagement**: Making it easier for students to stay connected with their chosen organizations
- **Simplifying Event Management**: Allowing seamless event signup and calendar integration

## ✨ Key Features

### For Students
- **Personalized Club Discovery**: Take a preferences quiz to get tailored club recommendations
- **Smart Filtering**: Search and filter clubs by category, interests, and tags
- **Event Management**: View upcoming events and sign up with one tap
- **Personal Calendar**: Integrated calendar showing all your signed-up events
- **Following System**: Follow clubs to stay updated on their latest activities
- **Real-time Updates**: Get notified about new events from clubs you follow

### For Club Organizers
- **Club Profiles**: Detailed club pages with descriptions, images, and tags
- **Event Publishing**: Easy event creation and management
- **Member Engagement**: Track signups and engagement metrics
- **Reach Analytics**: Understand your audience and optimize outreach

### User Experience
- **Intuitive Interface**: Clean, modern design with smooth navigation
- **Dark/Light Mode**: Adaptive theming for user preference
- **Cross-platform**: Available on both iOS and Android
- **Offline Support**: Access your calendar and club information offline

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Studio

### Installation

1. Clone the repository
```bash
git clone https://github.com/jeffstych/Clubbs.git
cd Clubs
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Add your Supabase credentials to .env
```

4. Start the development server
```bash
npx expo start
```

5. Run on your preferred platform
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device testing

## 📱 App Structure

- **Explore Tab**: Discover new clubs with personalized recommendations
- **My Clubbs Tab**: View and manage clubs you're following
- **Calendar Tab**: See all your upcoming events in one place
- **Profile Tab**: Manage your preferences and account settings
- **Club Detail Pages**: Comprehensive information about each club and their events

## 🗄️ Database Schema

The app uses Supabase with the following main tables:
- `clubs`: Organization information and metadata
- `events`: Event details and scheduling
- `profiles`: User preferences and settings
- `club_followings`: User-club relationships
- `user_events`: Event signups and attendance tracking
- `tags`: Interest categories and filtering options

## 🛠️ Tech Stack

### Frontend
- **React Native**: Cross-platform mobile development framework
- **Expo**: Development platform and toolchain for React Native
- **TypeScript**: Type-safe JavaScript for better development experience
- **Expo Router**: File-based routing system for navigation
- **React Navigation**: Advanced navigation library for complex flows

### Backend & Database
- **Supabase**: Backend-as-a-Service providing authentication and database
- **PostgreSQL**: Relational database (via Supabase)
- **Row Level Security**: Database-level security policies

### State Management & Data
- **React Context API**: Global state management for authentication and themes
- **React Hooks**: Modern state management with useState, useEffect, and custom hooks
- **Supabase Client**: Real-time database subscriptions and API calls

### UI/UX
- **React Native Paper**: UI component library
- **Expo Image**: Optimized image loading and caching
- **Custom Theming**: Light/dark mode with consistent design system
- **React Native Reanimated**: Smooth animations and interactions

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Expo Dev Tools**: Debugging and development utilities

### Authentication & Security
- **Supabase Auth**: User authentication and session management
- **JWT Tokens**: Secure authentication tokens
- **Email Verification**: Account verification system

---

Built with ❤️ for SpartaHack 11 by Team Clubbs
