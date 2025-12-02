# 🎓 LIYNMAR Online Tutorial Services

## Complete Tutorial Management System

A comprehensive web application for managing teachers, students, bookings, sessions, and revenue tracking for LIYNMAR Online Tutorial Services.

![Status](https://img.shields.io/badge/Status-Complete-success)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📚 Quick Links

- **[QUICKSTART.md](./liynmar-app/QUICKSTART.md)** - Installation & Setup Guide
- **[FEATURES.md](./liynmar-app/FEATURES.md)** - Complete Feature Documentation
- **[SESSION_STATUS_GUIDE.md](./liynmar-app/SESSION_STATUS_GUIDE.md)** - Status Code Reference
- **[IMPLEMENTATION_SUMMARY.md](./liynmar-app/IMPLEMENTATION_SUMMARY.md)** - What Was Built

---

## ✨ Features at a Glance

### 📊 Dashboard
- Comprehensive analytics with 4 interactive graphs
- Revenue tracking (Week/Month/Year)
- Session completion statistics
- Top teachers and subjects ranking
- Real-time metrics

### 👨‍🏫 Teachers Management
- Complete teacher profiles with contact info
- Weekly student schedule tracking
- Interactive session status management (C/A/P/T/S/N)
- Automatic earnings calculation with company share
- Active/Inactive status tracking

### 📅 Booking System
- Flexible booking form with real-time summary
- Different times and durations per day
- Student and parent information capture
- Weekly total calculation
- Seamless integration with teacher profiles

### 🔍 Smart Search
- Context-aware search across all pages
- Multi-field filtering
- Real-time results

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

```bash
# Navigate to client directory
cd liynmar-app/client

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **React Query** - Data fetching & caching
- **Vite** - Build tool
- **CSS3** - Styling with custom variables
- **Font Awesome** - Icons

### Backend (Ready for Implementation)
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication

---

## 📁 Project Structure

```
liynmar-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       ├── Header.jsx         # Top navigation
│   │   │       └── Sidebar.jsx        # Side navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Analytics & graphs
│   │   │   ├── Teachers.jsx           # Teacher list
│   │   │   ├── TeacherProfile.jsx     # Teacher details & sessions
│   │   │   └── Bookings.jsx           # Booking management
│   │   ├── services/
│   │   │   ├── teacherService.js      # Teacher API
│   │   │   └── bookingService.js      # Booking API
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Authentication
│   │   └── App.jsx
│   └── package.json
├── server/                             # Backend (to be implemented)
├── FEATURES.md                         # Complete documentation
├── QUICKSTART.md                       # Setup guide
├── SESSION_STATUS_GUIDE.md            # Status reference
└── README.md                           # This file
```

---

## 🎯 Key Features

### Session Status Management
Interactive status tracking with 6 codes:
- **C** - Completed & Paid ✅ (Counted)
- **A** - Advance Paid ✅ (Counted)
- **P** - Pending ❌ (Not counted)
- **T** - Teacher Absent ❌ (Not counted)
- **S** - Student Absent ❌ (Not counted)
- **N** - No Schedule ❌ (Not counted)

### Flexible Scheduling
- Different times for each day
- Variable durations (30 min - 2 hours)
- Automatic rate calculation
- Real-time booking summary

### Comprehensive Analytics
- Revenue trend graphs
- Session completion statistics
- Subject popularity tracking
- Teacher performance ranking

---

## 📖 Documentation

### For Users
1. **[QUICKSTART.md](./liynmar-app/QUICKSTART.md)** - Get started quickly
2. **[SESSION_STATUS_GUIDE.md](./liynmar-app/SESSION_STATUS_GUIDE.md)** - Understanding status codes
3. **[FEATURES.md](./liynmar-app/FEATURES.md)** - Detailed feature list

### For Developers
1. **[IMPLEMENTATION_SUMMARY.md](./liynmar-app/IMPLEMENTATION_SUMMARY.md)** - What was built
2. **[FEATURES.md](./liynmar-app/FEATURES.md)** - Technical specifications
3. **Inline Code Comments** - Component documentation

---

## 🎨 Screenshots

### Dashboard
Analytics overview with 4 interactive graphs showing revenue, sessions, subjects, and top teachers.

### Teacher Profile
Detailed profile with contact info and weekly student schedule with interactive status management.

### Booking Form
Comprehensive booking form with flexible scheduling and real-time summary.

---

## 🔧 Configuration

### Customizing Colors
Edit `client/src/index.css`:
```css
:root {
  --color-primary: #8B7355;      /* Main brand color */
  --color-secondary: #C9A869;    /* Accent color */
  /* ... more variables */
}
```

### Changing Hourly Rate
Default rate is ₱125/hour. Update in:
- `client/src/pages/Bookings.jsx` (sample data)
- Backend API when implemented

---

## 🚀 Deployment

### Frontend (Vite)
```bash
cd client
npm run build
# Deploy 'dist' folder to hosting service
```

### Backend Setup (When Ready)
Refer to [QUICKSTART.md](./liynmar-app/QUICKSTART.md) for:
- API endpoint structure
- Database schema
- Authentication setup

---

## 📊 System Requirements

### Minimum
- Node.js 14.x
- 2GB RAM
- Modern browser (Chrome, Firefox, Edge, Safari)

### Recommended
- Node.js 18.x
- 4GB RAM
- Latest browser version

---

## 🤝 Contributing

This is a private project for LIYNMAR Online Tutorial Services. For changes or improvements, contact the development team.

---

## 📄 License

Private and proprietary. All rights reserved by LIYNMAR Online Tutorial Services.

---

## 🆘 Support

### Getting Help
1. Check the documentation files
2. Review inline code comments
3. Contact the development team

### Common Issues
See [QUICKSTART.md](./liynmar-app/QUICKSTART.md) Troubleshooting section.

---

## 🎓 About LIYNMAR

LIYNMAR Online Tutorial Services provides quality online education with experienced teachers across multiple subjects. This system helps manage operations efficiently.

---

## 📞 Contact

For questions or support:
- Technical Issues: Check documentation
- Feature Requests: Contact development team
- General Inquiries: LIYNMAR administration

---

**Built with ❤️ for LIYNMAR Online Tutorial Services**

*Empowering Education Through Technology*
- ✅ Teachers management with availability tracking
- ✅ Teacher profiles with student schedules
- ✅ Payment status tracking
- ✅ Old money aesthetic design
- 🚧 Backend API (in progress)
- 🚧 Database integration (in progress)
- 🚧 Authentication (in progress)

## Design

The application features an elegant "old money" aesthetic with:
- Primary: Warm Taupe (#8B7355)
- Secondary: Antique Gold (#C9A869)
- Background: Cream (#F5F3EF)
- Fonts: Playfair Display & Lato

## License

Private - LIYNMAR Online Tutorial Services
