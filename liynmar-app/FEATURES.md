# LiynMar Online Tutorial Services - Features Documentation

## Overview
This is a comprehensive tutorial management system with role-based access control for tracking teachers, students, bookings, and revenue.

---

## 🔐 ROLE-BASED ACCESS CONTROL SYSTEM (NEW!)

### User Roles

#### 1. **Admin (Owner)**
- **Full System Access**: Can access all features
- **Accessible Sections**:
  - Dashboard
  - Teachers Management
  - Students Management
  - Bookings Management
  - Employee Management (exclusive)
  - Analytics
- **Special Permissions**:
  - Create/manage employee accounts
  - Assign roles to employees
  - View all system data
  - Delete and restore records

#### 2. **Teacher Manager**
- **Limited Access**: Teachers section only
- **Accessible Sections**:
  - Teachers Management (full CRUD access)
- **Restricted Sections** (locked with visual indicator):
  - Dashboard
  - Students
  - Bookings
  - Employees
  - Analytics

#### 3. **Booking Manager**
- **Limited Access**: Bookings and Students sections
- **Accessible Sections**:
  - Bookings Management (full CRUD access)
  - Students Management (full CRUD access)
- **Restricted Sections** (locked with visual indicator):
  - Dashboard
  - Teachers
  - Employees
  - Analytics

### Security Features
- **Backend Middleware Protection**: Routes protected by role-checking middleware
- **Frontend Access Control**: Visual locks on restricted navigation items
- **JWT Authentication**: Secure token-based authentication
- **Role Validation**: Server-side role verification for all API requests

---

## 👥 EMPLOYEE MANAGEMENT (NEW!)

### Features
- **Admin-Only Access**: Only administrators can manage employees
- **Create Employee Accounts**: Add new employees with specific roles
- **Role Assignment**: Assign Teacher Manager or Booking Manager roles
- **Employee List Table**:
  - Name with avatar
  - Contact Number
  - Email Address
  - Role Badge (color-coded)
  - Actions (View Profile, Delete)

### Filter Tabs
1. **All**: Shows all active employees
2. **Teacher Manager**: Filter by Teacher Manager role
3. **Booking Manager**: Filter by Booking Manager role
4. **Deleted Accounts**: View soft-deleted employee accounts

### Employee Form
Required fields:
- Full Name
- Email Address (unique)
- Contact Number
- Password (minimum 6 characters)
- Role Selection (Teacher Manager / Booking Manager)

### Role Descriptions
- **Teacher Manager**: Can only access Teachers section
- **Booking Manager**: Can access Bookings and Students sections

---

## 🎯 Main Components

### 1. HEADER
- **Company Name**: LIYNMAR branding
- **Search Bar**: Context-aware search (changes placeholder based on current page)
- **Profile Section**: Employee name and profile dropdown
- **Features**:
  - Search across teachers by name, subject, contact, email, status
  - Search in bookings for available teachers
  - Responsive design for mobile

### 2. SIDEBAR NAVIGATION
- Dashboard (🔒 Admin only)
- Teachers (🔒 Admin + Teacher Manager)
- Students (🔒 Admin + Booking Manager)
- Bookings (🔒 Admin + Booking Manager)
- Employees (🔒 Admin only)
- Analytics (🔒 Admin only)
- Settings (future implementation)

**Lock Indicators**: 
- Visual lock icons appear for restricted sections
- Locked items show in reduced opacity
- Hover displays "Access Restricted" message

---

## 📊 1. DASHBOARD

### Metrics Cards (with Period Filters: Week/Month/Year)
1. **Total Teachers**: Shows total active instructors
2. **Total Booked Students**: Updates based on selected period (week/month/year)
3. **Sessions This Period**: Total sessions for selected timeframe
4. **Revenue This Period**: Revenue with percentage change indicator

### Four Interactive Graphs

#### 1.1 Revenue Trend Graph
- **Type**: Bar Chart
- **Shows**: Company revenue increase/decrease
- **Filters**: Week (Mon-Sun), Month (Week 1-4), Year (Jan-Dec)
- **Features**:
  - Visual bars with amounts
  - Hover tooltips showing exact values
  - Responsive to period selection

#### 1.2 Session Status Graph
- **Type**: Donut Chart
- **Shows**: 
  - Completed Sessions (Green)
  - Student Absent Sessions (Red)
  - Teacher Absent Sessions (Orange)
- **Features**:
  - Center shows total sessions
  - Color-coded legend
  - Percentage-based visualization

#### 1.3 Most Booked Major Subjects
- **Type**: Horizontal Bar Chart
- **Shows**: Top 5 subjects by booking count
- **Features**:
  - Color-coded bars
  - Booking counts displayed
  - Responsive width based on data

#### 1.4 Top 10 Teachers
- **Type**: Ranked List
- **Shows**: Top performing teachers with:
  - Rank (1-10) with medal icons for top 3
  - Teacher name and subject
  - Total bookings
  - Total earnings
- **Features**:
  - Special styling for podium positions (1st, 2nd, 3rd)
  - Earnings in Philippine Peso (₱)
  - Responsive grid layout

---

## 👨‍🏫 2. TEACHERS MANAGEMENT

### All Teachers Table
Displays all teachers with columns:
- **Name**: With avatar
- **Major Subject**: Primary teaching subject
- **Contact Number**: Phone number
- **Email Address**: Email contact
- **Status**: Active or Inactive badge
- **Actions**: View profile button

### Search Functionality
Search teachers by:
- Name
- Subject
- Contact number
- Email
- Status (active/inactive)

---

## 👤 2.1 TEACHER PROFILE PAGE

### Profile Information Sections

#### Contact Information
- Email Address
- Contact Number
- Facebook Account

#### Professional Information
- Subject Major
- Teaching Experience (if available)

### 2.2 Weekly Student Bookings Table

**Table Columns:**
- Parent Name
- Student Name
- Grade Level
- Subject
- Time (can vary by day)
- Duration (can vary by day - 30 mins, 1 hour, 1.5 hours, 2 hours)
- Days: M, T, W, Th, F, Sa, Su (interactive status indicators)
- Total Earnings

### 2.3 Session Status Management (Interactive)

**Click on any day cell to change status:**

| Code | Label | Meaning | Payment |
|------|-------|---------|---------|
| **C** | Completed & Paid | Session completed and paid | ✅ Counted |
| **A** | Advance Paid | Paid but session pending | ✅ Counted |
| **P** | Pending | Session done, not yet paid | ❌ Not counted |
| **T** | Teacher Absent | Teacher didn't show up | ❌ Not counted |
| **S** | Student Absent | Student didn't show up | ❌ Not counted |
| **N** | No Schedule | No session scheduled | ❌ Not counted |

**Features:**
- Click any status cell to open dropdown menu
- Select new status from menu
- Confirmation dialog when adding/removing schedule (N status)
- Different times and rates can be set for each day
- Automatic calculation based on duration × hourly rate

**Important Notes:**
- Only **C (Completed & Paid)** and **A (Advance Paid)** sessions are calculated in earnings
- Different durations on different days are supported (e.g., Monday 1hr, Wednesday 30mins)
- Different rates apply based on duration

### 2.4 Earnings Summary

Displays at bottom of student table:
- **Total Sessions Booked**: Count of all scheduled sessions
- **Total Paid (Completed + Advance)**: Count of C and A status sessions
- **Pending (Unpaid)**: Count of P status sessions
- **Total Earnings**: Sum of all C and A session rates
- **Company Share (25%)**: Calculated company commission

**Week Navigation:**
- Previous/Next week buttons
- Current week display
- Historical and future week viewing

---

## 📅 3. BOOKINGS MANAGEMENT

### Available Teachers Table

Shows only **Active** teachers available for booking:
- Name (with avatar)
- Major Subject
- Contact Number
- Email Address
- Status (Active only)
- Book button

### Search in Bookings
Filter available teachers by:
- Name
- Subject
- Contact info
- Status

---

## 📝 3.1 BOOKING FORM (Comprehensive)

### Teacher Information (Read-only)
- Teacher name and subject
- Phone number
- Email
- Hourly rate

### Student Information Section
**Required Fields:**
- Student Name
- Grade Level (dropdown: Grade 1-12)

### Parent/Guardian Information
**Required Fields:**
- Parent/Guardian Name
- Contact Number
**Optional:**
- Facebook Link

### Session Details Section

#### Basic Information
- **Major Subject**: Can customize (e.g., "Algebra", "Grammar")
- **Start Date**: When sessions begin
- **Default Preferred Time**: Base time for all sessions

#### Weekly Schedule (Advanced)
**For each day (Monday - Sunday):**
1. Checkbox to select/deselect day
2. If selected, configure:
   - **Time**: Can override default time
   - **Duration**: Dropdown with options:
     - 30 mins (0.5 hour)
     - 1 hour
     - 1.5 hours
     - 2 hours

**Features:**
- Different times for different days
- Different durations for different days
- Visual feedback when day is selected
- Flexible scheduling

#### Additional Notes
- Optional text area for special requirements

### 3.2 Booking Summary (Live Sidebar)

**Displays:**
- Total Sessions per Week
- Breakdown of each selected day:
  - Day name
  - Time
  - Duration
  - Rate (calculated: duration × hourly rate)
- **Weekly Total**: Sum of all session rates

**Features:**
- Updates in real-time as you select/configure days
- Shows exactly what customer will pay
- Clear rate calculation transparency

### 3.3 Form Actions
- **Cancel**: Return to teacher list
- **Confirm Booking**: Submit booking (with validation)

**Validation:**
- At least one day must be selected
- All required fields must be filled
- Proper data format validation

### Post-Booking
After confirming:
- Booking appears in teacher's weekly student list
- Can be viewed in Teacher Profile page
- Sessions start with default status based on date
- Employee can manage session statuses going forward

---

## 🔍 4. SEARCH FUNCTIONALITY

### Header Search Features
The search bar is **context-aware** and changes based on the current page:

#### On Teachers Page:
Search by: name, subject, days, contact, email, status

#### On Bookings Page:
Search by: teacher name, subject, contact, time, days, status

#### On Other Pages:
Appropriate search context for each page

**Features:**
- Real-time filtering
- Case-insensitive
- Clear button to reset search
- Visual placeholder hints

---

## 💡 Key Features Summary

### ✅ Completed Features

1. **Dashboard with Analytics**
   - 4 comprehensive graphs
   - Period filtering (Week/Month/Year)
   - Real-time metrics

2. **Teachers Management**
   - Full CRUD interface
   - Status management (Active/Inactive)
   - Detailed profiles

3. **Teacher Profile**
   - Complete contact and professional info
   - Weekly student schedule
   - Interactive session status management
   - Earnings calculation with company share

4. **Booking System**
   - Available teacher browsing
   - Comprehensive booking form
   - Flexible weekly scheduling
   - Real-time booking summary
   - Different times/durations per day

5. **Session Management**
   - 6 status types (C, A, P, T, S, N)
   - Click-to-change interface
   - Confirmation dialogs
   - Smart earnings calculation

6. **Search**
   - Context-aware header search
   - Multi-field filtering
   - Real-time results

### 🎨 Design Features

- Consistent color scheme with brown/tan theme
- Responsive design for all screen sizes
- Smooth animations and transitions
- Intuitive icons and visual feedback
- Professional business aesthetic
- Accessibility considerations

### 🔢 Data Handling

- Sample data structure for demonstration
- Ready for backend API integration
- Proper state management
- Form validation
- Error handling

---

## 🚀 Future Enhancements (Recommended)

1. **Backend Integration**
   - Connect to Node.js/Express API
   - MongoDB database
   - Real-time updates

2. **Authentication**
   - Employee login system
   - Role-based access control
   - Secure sessions

3. **Analytics Dashboard Expansion**
   - More detailed reports
   - Export to PDF/Excel
   - Custom date ranges

4. **Notifications**
   - Email/SMS reminders
   - Payment notifications
   - Booking confirmations

5. **Payment Integration**
   - Online payment processing
   - Receipt generation
   - Payment history

6. **Calendar View**
   - Visual calendar interface
   - Drag-and-drop scheduling
   - Conflict detection

7. **Reports**
   - Teacher performance reports
   - Revenue reports
   - Student attendance reports

---

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

All components adapt gracefully to different screen sizes.

---

## 🎯 Usage Guidelines

### For Employees:

1. **Managing Teachers**
   - View all teachers in Teachers page
   - Click on teacher to see their profile
   - Review their weekly schedules
   - Update session statuses

2. **Creating Bookings**
   - Go to Bookings page
   - Search for suitable teacher
   - Click "Book" button
   - Fill in all student/parent information
   - Select days and configure times/durations
   - Review summary and confirm

3. **Tracking Sessions**
   - Navigate to teacher profile
   - View weekly schedule
   - Click on day cells to update status
   - Monitor earnings and payments

4. **Viewing Analytics**
   - Check Dashboard for overview
   - Switch between Week/Month/Year views
   - Monitor top teachers and subjects
   - Track revenue trends

---

## 💻 Technical Stack

- **Frontend**: React.js
- **Styling**: Custom CSS with CSS Variables
- **Routing**: React Router
- **State Management**: React Hooks (useState)
- **Icons**: Font Awesome
- **API Ready**: React Query integration prepared

---

## 📞 Support

For questions or issues, contact the development team.

**LiynMar Online Tutorial Services** - Empowering Education Through Technology
