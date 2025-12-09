# Automatic Status Management

## Overview
The system now automatically manages teacher and student statuses based on their current week bookings. Teachers and students are set to **inactive** when they have no bookings for the current week, and automatically reactivated when they receive bookings.

## How It Works

### Status Logic

#### Teachers
- **Active**: Teacher has at least one active booking for the current week
- **Inactive**: Teacher has no active bookings for the current week

#### Students
- **Active**: Student has an assigned teacher (via booking) for the current week
- **Inactive**: Student has no assigned teacher for the current week

### Week Definition
- Week runs from **Monday to Sunday**
- Current week is determined based on today's date
- Only bookings within the current week range are considered
- Past weeks are not included in the status calculation

### Automatic Updates

#### Scheduled Checks
The system runs automatic status checks at:

1. **Weekly Check**: Every Monday at 12:01 AM
   - Marks the start of a new week
   - Updates all teacher and student statuses

2. **Daily Check**: Every day at midnight
   - Catches any edge cases
   - Ensures statuses are always up-to-date

#### Real-Time Updates
Status updates also occur immediately when:

- **Booking Created**: 
  - Teacher status → Active
  - Student status → Active
  - Teacher assigned to student

- **Booking Deleted**:
  - System checks if teacher has other bookings this week
  - System checks if student has other teachers this week
  - Updates status to Inactive if no bookings remain

## API Endpoints

### Manual Status Check
Manually trigger a status check for all teachers and students:

```http
POST /api/bookings/check-status
```

**Response:**
```json
{
  "status": "success",
  "message": "Status check completed",
  "data": {
    "teachersUpdated": 5,
    "studentsUpdated": 12
  }
}
```

## Implementation Details

### Files Created/Modified

1. **`server/utils/statusManager.js`** (NEW)
   - Contains all status management logic
   - Functions for checking current week bookings
   - Functions for updating individual and all statuses

2. **`server/server.js`** (MODIFIED)
   - Added node-cron scheduler
   - Configured weekly and daily status checks
   - Uses Asia/Manila timezone (adjustable)

3. **`server/controllers/bookingController.js`** (MODIFIED)
   - Imports status management functions
   - Updates teacher/student status on booking creation
   - Updates teacher/student status on booking deletion
   - Added manual status check endpoint

4. **`server/routes/bookingRoutes.js`** (MODIFIED)
   - Added route for manual status check

### Key Functions

#### `getCurrentWeekDates()`
Returns the start (Monday) and end (Sunday) dates of the current week.

#### `hasCurrentWeekBookings(teacherId)`
Checks if a teacher has any active bookings for the current week.

#### `hasCurrentWeekTeacher(studentName, parentFbName)`
Checks if a student has an assigned teacher for the current week.

#### `updateTeacherStatus(teacherId)`
Updates a single teacher's status based on current week bookings.

#### `updateStudentStatus(studentId)`
Updates a single student's status based on current week teacher assignment.

#### `updateAllTeacherStatuses()`
Checks and updates all teachers' statuses.

#### `updateAllStudentStatuses()`
Checks and updates all students' statuses.

#### `runStatusCheck()`
Runs a full status check for both teachers and students.

## Configuration

### Timezone
The scheduler uses `Asia/Manila` timezone by default. To change this, modify the timezone in `server/server.js`:

```javascript
cron.schedule('1 0 * * 1', async () => {
  // ... code
}, {
  timezone: 'Your/Timezone' // Change this
});
```

### Schedule Times
To modify when status checks run, update the cron expressions in `server/server.js`:

```javascript
// Weekly: Every Monday at 12:01 AM
cron.schedule('1 0 * * 1', async () => { ... });

// Daily: Every day at midnight
cron.schedule('0 0 * * *', async () => { ... });
```

## Testing

### Manual Testing
1. Create a booking for the current week → Teacher and Student should become Active
2. Delete the booking → If no other bookings exist this week, both should become Inactive
3. Wait until next week → Statuses should update on Monday at 12:01 AM

### Manual Status Check
Use the API endpoint to manually trigger a status check:
```bash
curl -X POST http://localhost:5000/api/bookings/check-status
```

## Console Logs
The system provides detailed console logging:

```
⏰ Status check scheduler initialized
   - Weekly check: Every Monday at 12:01 AM
   - Daily check: Every day at midnight

🔄 Running weekly status check...
Current week: Mon Dec 09 2025 to Sun Dec 15 2025
Teacher John Doe status updated to inactive
Student Jane Smith status updated to active
Updated 3 teacher statuses
Updated 5 student statuses
Status check complete: 3 teachers and 5 students updated
```

## Notes

- Only **active** bookings are considered for status calculation
- Deleted bookings are excluded from status checks
- Student's `assignedTeacherForTheWeek` field is cleared when status becomes inactive
- The system gracefully handles errors and logs them to the console
- Status checks run even if the database connection fails initially
