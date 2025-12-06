# Students Module Implementation

## Overview
The Students module has been successfully added to the LiynMar Online Tutorial Services application, providing comprehensive student management capabilities similar to the existing Teachers module.

## New Features Added

### 1. Students Navigation Menu
- Added "Students" menu item to the sidebar navigation
- Icon: `fa-user-graduate`
- Route: `/students`

### 2. Students Page with Subtabs
The Students page includes four subtabs for filtering:
- **All Students**: Shows all active (non-deleted) students
- **Active Students**: Shows only students with active status
- **Inactive Students**: Shows only students with inactive status
- **Deleted Students**: Shows soft-deleted students with restore/permanent delete options

### 3. Student Table Columns
| Column | Description |
|--------|-------------|
| Parent Facebook Name | The Facebook name of the student's parent/guardian |
| Student Name | The full name of the student |
| Grade Level | Grade level (Grade 1 through Grade 12) |
| Assigned Teacher for the Week | Shows the currently assigned active teacher with assign/unassign buttons |
| Student Status | Active or Inactive badge |
| Actions | Delete, Restore, or Permanently Delete buttons |

### 4. Student Features

#### Add New Student
- Form includes:
  - Parent Facebook Name (required)
  - Student Name (required)
  - Grade Level (dropdown: Grade 1-12) (required)
  - Status (Active/Inactive) (required)

#### Assign/Unassign Teachers
- Students can be assigned to **active teachers only**
- Quick assign button for unassigned students
- Quick unassign button for assigned students
- Assignment selection via prompt dialog

#### Soft Delete & Restore
- Soft delete moves students to "Deleted Students" tab
- Restore functionality to bring back deleted students
- Permanent delete option for deleted students (irreversible)

## Sample Data Generator

### Data Initializer Component
A convenient data generator has been added to the Dashboard that creates:

#### Teachers:
- **25 Active Teachers** (with bookings from January to December)
- **10 Inactive Teachers** (no bookings - became inactive due to no bookings for one week)
- **5 Deleted Teachers**

#### Students:
- **40 Active Students** (most assigned to active teachers)
- **8 Inactive Students**
- **7 Deleted Students**

### Filipino Sample Data
All sample data uses authentic Filipino names:
- First names: Maria, Jose, Juan, Ana, Pedro, Rosa, Luis, Carmen, Miguel, Sofia, Carlos, etc.
- Last names: Reyes, Santos, Cruz, Bautista, Garcia, Mendoza, Torres, Lopez, Gonzales, Flores, etc.
- Subjects: Mathematics, English, Science, Filipino, History, Physics, Chemistry, Biology, etc.

### Booking Distribution
- Only **active teachers** have bookings (5-25 bookings each)
- Bookings are distributed across all months (January-December 2024)
- Inactive teachers have **zero bookings** (requirement: teachers become inactive after one week without bookings)
- Each booking includes:
  - Student name (Filipino)
  - Subject matching teacher's specialty
  - Random dates throughout 2024
  - Random time slots (10:00, 14:00, 16:00, 18:00)
  - Duration (1 hour, 1.5 hours, or 2 hours)
  - Status (mostly completed, some pending)

## How to Use

### Generate Sample Data
1. Navigate to the Dashboard
2. Click the "Generate Sample Data" button in the blue box at the top
3. Confirm the action (this will replace existing data)
4. Wait for the page to reload

### View Students
1. Click "Students" in the sidebar navigation
2. Use the tabs to filter by student status
3. Search students using the header search bar (searches across all fields)

### Assign a Teacher to a Student
1. Navigate to Students page
2. Find a student with "Not Assigned" in the teacher column
3. Click the assign button (user-plus icon)
4. Select a teacher from the list by entering the number
5. Confirm the assignment

### Unassign a Teacher
1. Find a student with an assigned teacher
2. Click the unassign button (user-times icon)
3. Confirm the action

### Delete/Restore Students
1. To soft delete: Click the trash icon → Confirm
2. To restore: Go to "Deleted Students" tab → Click restore icon → Confirm
3. To permanently delete: Go to "Deleted Students" tab → Click permanent delete icon → Confirm (irreversible)

## Technical Details

### Files Created/Modified

#### New Files:
- `client/src/pages/Students.jsx` - Main Students component
- `client/src/pages/Students.css` - Students page styling
- `client/src/components/DataInitializer.jsx` - Sample data generator component
- `client/src/utils/sampleDataGenerator.js` - Standalone sample data generator script

#### Modified Files:
- `client/src/components/Layout/Sidebar.jsx` - Added Students menu item
- `client/src/App.jsx` - Added Students route and import
- `client/src/pages/Dashboard.jsx` - Added DataInitializer component

### LocalStorage Keys Used
- `allStudents` - Array of active students
- `deletedStudents` - Array of soft-deleted students
- `allTeachers` - Array of active teachers
- `deletedTeachers` - Array of soft-deleted teachers
- `teacherBookings` - Object mapping teacher IDs to their bookings

### Student Data Structure
```javascript
{
  _id: "unique_id",
  parentFacebookName: "Parent Name",
  studentName: "Student Name",
  gradeLevel: "Grade 12",
  assignedTeacherId: "teacher_id" | null,
  status: "active" | "inactive",
  createdAt: "ISO_date_string",
  deletedAt: "ISO_date_string" (if deleted),
  isDeleted: boolean (if deleted)
}
```

## Business Rules

1. **Teacher Assignment**
   - Only **active** teachers can be assigned to students
   - Inactive teachers cannot receive student assignments
   - Students can have only one assigned teacher at a time

2. **Inactive Teachers**
   - Teachers become inactive after one week without bookings
   - Inactive teachers have **zero bookings** in the sample data
   - Only active teachers appear in the assignment list

3. **Soft Delete**
   - Deleted students are moved to a separate storage
   - Deleted students can be restored
   - Permanently deleted students are removed completely

## Responsive Design
- Mobile-friendly table layout
- Responsive navigation tabs
- Adaptive modal dialogs
- Touch-friendly buttons

## Future Enhancements
- Bulk student import via CSV
- Student profile page with detailed information
- Assignment history tracking
- Parent communication logs
- Student performance tracking
- Automated teacher assignment based on subject/grade level

## Support
For any issues or questions, please refer to the main project documentation or contact the development team.
