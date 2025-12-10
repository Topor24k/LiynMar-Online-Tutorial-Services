# Database Structure - LiynMar Tutorial Services

## Overview
This document outlines the complete MongoDB database structure for the LiynMar Online Tutorial Services application with role-based access control.

---

## Collections

### 1. Users Collection (NEW!)

**Purpose**: Stores employee/user accounts with role-based access control.

**Schema Fields**:
- `email` (String, Required, Unique) - User's email address for login
- `password` (String, Required) - Hashed password (bcrypt)
- `fullName` (String, Required) - User's full name
- `contactNumber` (String, Required) - User's contact number
- `role` (String, Enum: ['admin', 'teacher_manager', 'booking_manager'], Default: 'admin') - User role
- `createdBy` (ObjectId, Ref: 'User') - Reference to the admin who created this user
- `isActive` (Boolean, Default: true) - Active status
- `isDeleted` (Boolean, Default: false) - Soft delete flag
- `deletedAt` (Date) - Timestamp when deleted
- `createdAt` (Date) - Auto-generated timestamp
- `updatedAt` (Date) - Auto-generated timestamp

**Role Definitions**:
- `admin`: Full system access (Dashboard, Teachers, Students, Bookings, Employees, Analytics)
- `teacher_manager`: Can only access Teachers section
- `booking_manager`: Can access Bookings and Students sections

**Security**:
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens for authentication
- Role-based middleware protection on all routes

**Example Document**:
```json
{
  "_id": "693826bdfd8db79e535191fd",
  "email": "kayeencampana@gmail.com",
  "password": "$2b$10$hashed_password_here",
  "fullName": "Kayeen Campaña",
  "contactNumber": "+63 123 456 7890",
  "role": "admin",
  "isActive": true,
  "isDeleted": false,
  "createdAt": "2024-12-09T08:00:00.000Z",
  "updatedAt": "2024-12-09T08:00:00.000Z"
}
```

---

### 2. Teachers Collection

**Purpose**: Stores teacher profiles with their professional information.

**Schema Fields**:
- `name` (String, Required) - Teacher's full name
- `majorSubject` (String, Required) - Main subject the teacher specializes in
- `contactNumber` (String, Required) - Teacher's phone number
- `email` (String, Required, Unique) - Teacher's email address
- `facebookAccount` (String) - Teacher's Facebook profile link
- `totalBookings` (Number, Default: 0) - Total number of bookings this teacher has received
- `status` (String, Enum: ['active', 'inactive'], Default: 'active') - Current status
- `jobExperience` (Array of Objects):
  - `jobTitle` (String) - Position title
  - `companyName` (String) - Company name
  - `employmentType` (String, Enum: ['Full Time', 'Part Time', 'Internship', 'Freelance', 'Contractual'])
  - `startDate` (Date) - Start date in mm/dd/yyyy format
  - `endDate` (Date) - End date in mm/dd/yyyy format
  - `jobLocation` (String) - Location of the job
- `isDeleted` (Boolean, Default: false) - Soft delete flag
- `deletedAt` (Date) - Timestamp when deleted
- `createdAt` (Date) - Auto-generated timestamp
- `updatedAt` (Date) - Auto-generated timestamp

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Maria Santos",
  "majorSubject": "Mathematics",
  "contactNumber": "+63 912 345 6789",
  "email": "maria.santos@example.com",
  "facebookAccount": "https://facebook.com/maria.santos",
  "totalBookings": 15,
  "status": "active",
  "jobExperience": [
    {
      "jobTitle": "Math Tutor",
      "companyName": "Excel Learning Center",
      "employmentType": "Part Time",
      "startDate": "2022-06-01T00:00:00.000Z",
      "endDate": "2024-05-31T00:00:00.000Z",
      "jobLocation": "Manila, Philippines"
    }
  ],
  "isDeleted": false,
  "createdAt": "2024-01-15T08:30:00.000Z",
  "updatedAt": "2024-12-06T10:00:00.000Z"
}
```

---

### 2. Bookings Collection

**Purpose**: Stores weekly bookings showing which students are assigned to which teachers for a specific week.

**Schema Fields**:
- `teacherId` (ObjectId, Required, Ref: 'Teacher') - Reference to the teacher
- `parentFbName` (String, Required) - Parent's Facebook name
- `studentName` (String, Required) - Student's full name
- `gradeLevel` (String, Required, Enum: ['Grade 1' to 'Grade 12']) - Student's current grade
- `subjectFocus` (String, Required) - Subject the student will study
- `contactNumber` (String) - Contact number for the parent/student
- `facebookProfileLink` (String) - Facebook profile link of the parent
- `additionalNote` (String) - Additional notes or special instructions
- `weeklySchedule` (Object):
  - `monday` (Boolean, Default: false)
  - `tuesday` (Boolean, Default: false)
  - `wednesday` (Boolean, Default: false)
  - `thursday` (Boolean, Default: false)
  - `friday` (Boolean, Default: false)
  - `saturday` (Boolean, Default: false)
  - `sunday` (Boolean, Default: false)
- `totalEarningsPerWeek` (Number, Default: 0) - Total earnings for this booking per week
- `weekStartDate` (Date, Required) - Start date of the booking week
- `weekEndDate` (Date, Required) - End date of the booking week (auto-calculated as weekStartDate + 6 days)
- `status` (String, Enum: ['active', 'completed', 'cancelled'], Default: 'active')
- `isDeleted` (Boolean, Default: false)
- `deletedAt` (Date)
- `createdAt` (Date)
- `updatedAt` (Date)

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "teacherId": "507f1f77bcf86cd799439011",
  "parentFbName": "Juan Dela Cruz",
  "studentName": "Pedro Dela Cruz",
  "gradeLevel": "Grade 7",
  "subjectFocus": "Mathematics",
  "contactNumber": "+63 917 123 4567",
  "facebookProfileLink": "https://facebook.com/juan.delacruz",
  "additionalNote": "Student needs extra help with algebra",
  "weeklySchedule": {
    "monday": true,
    "tuesday": false,
    "wednesday": true,
    "thursday": false,
    "friday": true,
    "saturday": false,
    "sunday": false
  },
  "totalEarningsPerWeek": 375,
  "weekStartDate": "2024-12-02T00:00:00.000Z",
  "weekEndDate": "2024-12-08T00:00:00.000Z",
  "status": "active",
  "isDeleted": false,
  "createdAt": "2024-12-01T14:20:00.000Z",
  "updatedAt": "2024-12-01T14:20:00.000Z"
}
```

**Note**: The Bookings collection represents the weekly schedule visible in the Teacher's Profile showing all students booked for that week.

---

### 3. Students Collection

**Purpose**: Stores student information and their current teacher assignment.

**Schema Fields**:
- `parentFbName` (String, Required) - Parent's Facebook name
- `studentName` (String, Required) - Student's full name
- `gradeLevel` (String, Required, Enum: ['Grade 1' to 'Grade 12']) - Current grade level
- `assignedTeacherForTheWeek` (ObjectId, Ref: 'Teacher') - Current teacher assigned for this week
- `contactNumber` (String) - Contact number
- `facebookProfileLink` (String) - Facebook profile link
- `status` (String, Enum: ['active', 'inactive'], Default: 'active') - Student status
- `isDeleted` (Boolean, Default: false)
- `deletedAt` (Date)
- `createdAt` (Date)
- `updatedAt` (Date)

**Virtual Fields**:
- `assignedTeacher` - Populated teacher details (name, majorSubject)

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "parentFbName": "Juan Dela Cruz",
  "studentName": "Pedro Dela Cruz",
  "gradeLevel": "Grade 7",
  "assignedTeacherForTheWeek": "507f1f77bcf86cd799439011",
  "contactNumber": "+63 917 123 4567",
  "facebookProfileLink": "https://facebook.com/juan.delacruz",
  "status": "active",
  "isDeleted": false,
  "createdAt": "2024-12-01T14:20:00.000Z",
  "updatedAt": "2024-12-06T09:15:00.000Z"
}
```

---

## Relationships

```
Teacher (1) ----< (M) Booking
  |
  |
  └----< (M) Student (assignedTeacherForTheWeek)
```

- One Teacher can have multiple Bookings
- One Teacher can have multiple Students assigned
- One Student has one Teacher assigned for the current week
- Bookings reference both Teacher and contain Student information for the week

---

## API Endpoints

### Teachers
- `GET /api/teachers` - Get all teachers with totalBookings count
- `GET /api/teachers/:id` - Get single teacher
- `POST /api/teachers` - Create new teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Soft delete teacher

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/teacher/:teacherId` - Get bookings for specific teacher
- `GET /api/bookings/:id` - Get single booking with student profile
- `POST /api/bookings` - Create new booking (also creates/updates student)
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Soft delete booking

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Soft delete student

---

## Data Flow

### Creating a Booking:
1. Admin creates a booking with student and teacher information
2. System creates a `Booking` document with:
   - Teacher reference
   - Student details
   - Weekly schedule (M, T, W, TH, F, SA, SU)
   - Total earnings per week
   - Week start/end dates
3. System creates or updates `Student` document:
   - If student doesn't exist, creates new student
   - Assigns teacher to `assignedTeacherForTheWeek`
4. System increments teacher's `totalBookings` count

### Viewing Teacher Profile:
1. Query `Teacher` by ID
2. Query all `Bookings` where `teacherId` matches and `status` is 'active'
3. Display weekly schedule with all students booked for the current week
4. Show total earnings per week

### Viewing Student Profile (from Booking):
1. Click "View" action on a booking
2. Display:
   - Student Name
   - Grade Level
   - Parent FB Name
   - Contact Number
   - Facebook Profile Link
   - Additional Note (shown on hover over "Note" indicator)

---

## Important Notes

1. **Week Management**: Bookings are organized by week with `weekStartDate` and `weekEndDate`
2. **Soft Deletes**: All collections use `isDeleted` flag instead of permanent deletion
3. **Teacher Assignment**: Students have `assignedTeacherForTheWeek` which can change weekly
4. **Auto-calculations**: `weekEndDate` is automatically calculated as `weekStartDate + 6 days`
5. **Total Bookings**: Teacher's `totalBookings` increments with each new booking

---

## Migration from Old Schema

**Changed Field Names**:
- Teacher: `subject` → `majorSubject`
- Teacher: `phone` → `contactNumber`
- Teacher: `facebook` → `facebookAccount`
- Student: `parentFacebookName` → `parentFbName`
- Student: `assignedTeacherId` → `assignedTeacherForTheWeek`

**Removed Fields**:
- Teacher: `usualTime`, `weeklyBookings`, `weekStartDate`, `lastBookingDate`

**New Booking Structure**:
- Old: Single booking with date/time/duration
- New: Weekly booking with schedule and earnings per week
