# LiynMar Tutorial Services - Quick Start Guide

## Running the Application

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Navigate to the client directory:**
```powershell
cd "c:\Users\Kayeen Campana\LiynMar Online Tutorial Services\liynmar-app\client"
```

2. **Install dependencies:**
```powershell
npm install
```

3. **Start the development server:**
```powershell
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173` (or the port shown in terminal)

---

## Application Structure

```
liynmar-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       ├── Header.jsx        # Top navigation with search
│   │   │       ├── Sidebar.jsx       # Side navigation menu
│   │   │       └── *.css
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Main dashboard with graphs
│   │   │   ├── Teachers.jsx          # Teachers list table
│   │   │   ├── TeacherProfile.jsx    # Individual teacher profile
│   │   │   ├── Bookings.jsx          # Booking management
│   │   │   └── *.css
│   │   ├── services/
│   │   │   ├── teacherService.js     # Teacher API calls
│   │   │   └── bookingService.js     # Booking API calls
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # Entry point
│   └── package.json
└── server/                            # Backend (to be implemented)
```

---

## Key Features Implemented

### ✅ 1. Dashboard
- **Location**: `/dashboard`
- **Features**:
  - Metric cards with Week/Month/Year filters
  - Revenue trend graph
  - Session status donut chart
  - Most booked subjects bar chart
  - Top 10 teachers ranked list

### ✅ 2. Teachers Management
- **Location**: `/teachers`
- **Features**:
  - Complete teacher list
  - Search functionality
  - Active/Inactive status
  - Click to view detailed profile

### ✅ 3. Teacher Profile
- **Location**: `/teachers/:id`
- **Features**:
  - Contact information display
  - Professional information
  - Weekly student bookings table
  - **Interactive session status management**:
    - Click any day cell to change status
    - Status options: C, A, P, T, S, N
    - Automatic earnings calculation
  - Company share calculation (25%)
  - Week navigation

### ✅ 4. Booking System
- **Location**: `/bookings`
- **Features**:
  - Available teachers list
  - Comprehensive booking form with:
    - Student information
    - Parent/Guardian information
    - Session details
    - **Flexible weekly schedule**:
      - Different times per day
      - Different durations per day (30 mins to 2 hours)
    - Real-time booking summary
    - Weekly total calculation

### ✅ 5. Search Functionality
- Context-aware search in header
- Filters by multiple criteria
- Real-time results

---

## Using the Application

### Creating a Booking

1. Navigate to **Bookings** page
2. Use search if needed to find specific teacher
3. Click **Book** button on desired teacher
4. Fill in the booking form:
   
   **Student Information:**
   - Student Name
   - Grade Level
   
   **Parent Information:**
   - Parent Name
   - Contact Number
   - Facebook Link (optional)
   
   **Session Details:**
   - Subject (pre-filled, can modify)
   - Start Date
   - Default Preferred Time
   
   **Weekly Schedule:**
   - Check the days you want
   - For each day, set:
     - Specific time (or use default)
     - Duration (30 mins, 1 hour, 1.5 hours, or 2 hours)
   
   **Booking Summary** (right sidebar):
   - Shows total sessions
   - Lists all rates for each day
   - Displays weekly total

5. Review the summary
6. Click **Confirm Booking**

The booking will now appear in the teacher's profile!

### Managing Session Statuses

1. Go to **Teachers** page
2. Click on a teacher's **View Profile** button
3. Scroll to the weekly student table
4. Click on any day cell (M, T, W, Th, F, Sa, Su)
5. Select new status from dropdown:
   - **C** - Completed & Paid (counted in earnings)
   - **A** - Advance Paid (counted in earnings)
   - **P** - Pending (not counted)
   - **T** - Teacher Absent (not counted)
   - **S** - Student Absent (not counted)
   - **N** - No Schedule (removes from schedule)
6. Earnings automatically update

### Viewing Analytics

1. Navigate to **Dashboard**
2. Use the **Week/Month/Year** buttons to change period
3. View the four graphs:
   - Revenue trends
   - Session completion status
   - Most booked subjects
   - Top 10 teachers

---

## Sample Data

The application comes with sample data for demonstration:

**Teachers:**
- Sarah Johnson (Mathematics) - Active
- Michael Chen (Physics) - Inactive
- Emily Santos (English) - Active
- David Martinez (Chemistry) - Active
- Lisa Wong (Biology) - Active

**Dashboard Metrics:**
- Reflects realistic educational business data
- Changes based on selected time period

---

## Customization

### Changing Colors

Edit `src/index.css` CSS variables:

```css
:root {
  --color-primary: #8B7355;      /* Main brown color */
  --color-secondary: #C9A869;    /* Tan/gold color */
  --color-success: #7D9B76;      /* Green */
  --color-error: #B86B6B;        /* Red */
  /* ... more variables */
}
```

### Adding Teachers

Currently using sample data. To add real teachers:
1. Implement backend API
2. Update `teacherService.js`
3. Connect to database

### Modifying Hourly Rates

In sample data, all teachers have `hourlyRate: 125`
- Modify in `Bookings.jsx` sample data
- Or fetch from backend API

---

## Next Steps for Backend Implementation

### Recommended Tech Stack:
- **Server**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT tokens

### API Endpoints Needed:

```
GET    /api/teachers              # Get all teachers
GET    /api/teachers/:id          # Get teacher by ID
POST   /api/teachers              # Create teacher
PUT    /api/teachers/:id          # Update teacher
DELETE /api/teachers/:id          # Delete teacher

GET    /api/bookings              # Get all bookings
POST   /api/bookings              # Create booking
PUT    /api/bookings/:id          # Update booking
DELETE /api/bookings/:id          # Delete booking

GET    /api/sessions              # Get all sessions
PUT    /api/sessions/:id/status   # Update session status

GET    /api/analytics/revenue     # Get revenue data
GET    /api/analytics/teachers    # Get teacher stats
GET    /api/analytics/subjects    # Get subject stats
```

### Database Schema Examples:

**Teacher:**
```javascript
{
  _id: ObjectId,
  name: String,
  subject: String,
  email: String,
  phone: String,
  facebook: String,
  major: String,
  status: String, // 'active' or 'inactive'
  hourlyRate: Number,
  daysAvailable: [String],
  usualTime: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Booking:**
```javascript
{
  _id: ObjectId,
  teacherId: ObjectId,
  studentName: String,
  studentGrade: String,
  parentName: String,
  parentPhone: String,
  parentFacebook: String,
  subject: String,
  startDate: Date,
  weeklySchedule: [{
    day: String,
    time: String,
    duration: Number,
    rate: Number,
    status: String // 'C', 'A', 'P', 'T', 'S', 'N'
  }],
  additionalNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Port Already in Use
If port 5173 is busy:
```powershell
# Change port in vite.config.js
server: {
  port: 3000
}
```

### Dependencies Not Installing
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build Errors
```powershell
# Clear build cache
npm run build -- --force
```

---

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

---

## Performance Tips

1. **Lazy Loading**: Components load on demand
2. **Memoization**: Use React.memo for heavy components
3. **Pagination**: Add for large teacher lists
4. **Debouncing**: Search has built-in debouncing

---

## Support & Contact

For technical support or questions:
- Review the `FEATURES.md` documentation
- Check the inline code comments
- Contact the development team

---

**Happy Teaching Management! 📚**
