# LIYNMAR Admin Dashboard - Frontend

React-based admin dashboard for LIYNMAR Online Tutorial Services.

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **React Query** - Data fetching & caching
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Toastify** - Notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will run on `http://localhost:3000`

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
src/
├── components/       # Reusable components
│   └── Layout/      # Layout components (Sidebar, Header)
├── pages/           # Page components
├── services/        # API service functions
├── context/         # React context providers
├── utils/           # Utility functions
├── App.jsx          # Main app component
├── main.jsx         # App entry point
└── index.css        # Global styles
```

## Features

- **Dashboard** - Overview with stats
- **Teachers Management** - View, add, edit teachers
- **Teacher Profiles** - Detailed teacher info with student schedules
- **Subjects** - Manage course offerings
- **Bookings** - Session management
- **Salary** - Payment tracking
- **Schedule** - Calendar view
- **Analytics** - Reports and insights
- **Settings** - System configuration

## Design System

The app uses an "old money" aesthetic with:

- **Primary Color**: Warm Taupe (#8B7355)
- **Secondary Color**: Antique Gold (#C9A869)
- **Background**: Cream (#F5F3EF)
- **Fonts**: Playfair Display (headings), Lato (body)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The app connects to the backend API via Axios. All API calls are in the `services/` directory:

- `teacherService.js` - Teacher CRUD operations
- `bookingService.js` - Booking management

## Authentication

Authentication is handled via JWT tokens stored in localStorage. The `AuthContext` provides:

- `user` - Current user object
- `login()` - Login function
- `logout()` - Logout function
- `isAuthenticated` - Auth status

Protected routes will redirect to login if not authenticated.
