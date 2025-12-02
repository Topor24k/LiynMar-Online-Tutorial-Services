# 📊 Session Status Reference Guide

## Quick Reference for Employee Use

### Session Status Codes

When managing teacher schedules, click on any day cell to update the session status using these codes:

---

## Status Codes Explained

### ✅ C - Completed & Paid
**Color:** Green  
**Meaning:** Session was completed and payment received  
**Counted in Earnings:** YES ✅  
**Use When:**
- Teacher completed the session
- Student attended
- Payment has been collected

**Example:** Monday session happened, student paid ₱125

---

### 💰 A - Advance Paid
**Color:** Gold/Yellow  
**Meaning:** Payment received but session is still pending  
**Counted in Earnings:** YES ✅  
**Use When:**
- Parent paid in advance
- Session scheduled for future date
- Pre-payment for upcoming week

**Example:** Parent paid for Friday's session on Monday

---

### ⏳ P - Pending (Unpaid)
**Color:** Orange  
**Meaning:** Session completed but payment not yet received  
**Counted in Earnings:** NO ❌  
**Use When:**
- Session happened
- Waiting for payment
- Parent promised to pay later

**Example:** Tuesday session done, parent will pay on Friday

---

### 🚫 T - Teacher Absent
**Color:** Red  
**Meaning:** Teacher did not show up for the session  
**Counted in Earnings:** NO ❌  
**Use When:**
- Teacher missed the session
- Teacher cancelled
- Teacher emergency

**Example:** Teacher was sick and couldn't conduct Wednesday session

---

### 🚫 S - Student Absent
**Color:** Blue  
**Meaning:** Student did not show up for the session  
**Counted in Earnings:** NO ❌  
**Use When:**
- Student didn't attend
- Student cancelled
- Student forgot

**Example:** Student had a family emergency on Thursday

---

### ➖ N - No Schedule
**Color:** Gray  
**Meaning:** No session scheduled for this day  
**Counted in Earnings:** NO ❌  
**Use When:**
- Day is not part of the weekly schedule
- Removing a previously scheduled day
- Student doesn't have class this day

**Example:** Student only has Mon/Wed/Fri sessions, so Tue/Thu/Sat/Sun are "N"

---

## How Earnings are Calculated

### ✅ COUNTED (Adds to Total Earnings)
- **C** (Completed & Paid)
- **A** (Advance Paid)

### ❌ NOT COUNTED (Does NOT add to earnings)
- **P** (Pending - not paid yet)
- **T** (Teacher Absent - no service provided)
- **S** (Student Absent - no service provided)
- **N** (No Schedule - not planned)

---

## Example Scenario

**Teacher:** Sarah Johnson  
**Student:** Alex Rodriguez  
**Weekly Schedule:**

| Day | Status | Time | Duration | Rate | Counted? |
|-----|--------|------|----------|------|----------|
| Monday | C | 3:00 PM | 1 hour | ₱125 | ✅ YES |
| Tuesday | N | - | - | - | ❌ NO |
| Wednesday | A | 3:00 PM | 1 hour | ₱125 | ✅ YES |
| Thursday | P | 3:00 PM | 1 hour | ₱125 | ❌ NO (yet) |
| Friday | S | 3:00 PM | 1 hour | ₱125 | ❌ NO |
| Saturday | T | - | - | - | ❌ NO |
| Sunday | N | - | - | - | ❌ NO |

**Calculation:**
- Total Sessions: 5 (Mon, Wed, Thu, Fri, Sat)
- Paid Sessions: 2 (C + A = Monday + Wednesday)
- Pending: 1 (Thursday)
- Total Earned: ₱250 (₱125 × 2)
- Company Share (25%): ₱62.50
- Teacher Share (75%): ₱187.50

---

## Important Notes

### 💡 Tips for Managing Status

1. **Update Immediately After Session**
   - Set to "C" if paid right away
   - Set to "P" if payment pending
   - Set to "A" if pre-paid

2. **Handle Absences Promptly**
   - "T" for teacher no-show (no charge to student)
   - "S" for student no-show (no payment to teacher)

3. **Manage Schedules Carefully**
   - Use "N" to mark days with no classes
   - Confirmation required when adding/removing schedules

4. **Track Payments**
   - Convert "P" to "C" once payment received
   - Convert "A" to "C" after session completes

### 🔄 Status Flow Examples

**Normal Flow:**
```
A (Advance Paid) → C (Completed & Paid) ✅
```

**Payment After Session:**
```
P (Pending) → C (Completed & Paid) ✅
```

**Cancelled Session:**
```
A (Advance Paid) → Refund → N (No Schedule)
```

**Rescheduled Session:**
```
T (Teacher Absent) → Reschedule → A or P
```

---

## Different Times & Durations

The system supports **variable schedules**:

**Example:**
| Day | Time | Duration | Rate |
|-----|------|----------|------|
| Monday | 3:00 PM | 1 hour | ₱125 |
| Wednesday | 4:00 PM | 30 mins | ₱62.50 |
| Friday | 3:00 PM | 2 hours | ₱250 |

Each day can have:
- Different start time
- Different duration (30 min, 1 hr, 1.5 hrs, 2 hrs)
- Different rate (based on duration)

---

## Week Navigation

Use the **Previous/Next Week** buttons to:
- View past weeks for record-keeping
- Plan future weeks
- Track payment history
- Review attendance patterns

---

## Booking Summary Calculations

When viewing Teacher Profile:

**Total Sessions Booked** = Count of all days with status (not "N")  
**Total Paid** = Count of "C" + "A" statuses  
**Pending** = Count of "P" status  
**Total Earnings** = Sum of (Rate × Duration) for "C" and "A" only  
**Company Share** = Total Earnings × 25%

---

## Color Legend

For quick visual reference:

🟢 **Green** = Money received (C)  
🟡 **Gold** = Money received in advance (A)  
🟠 **Orange** = Money pending (P)  
🔴 **Red** = Teacher issue (T)  
🔵 **Blue** = Student issue (S)  
⚪ **Gray** = No session (N)

---

## Best Practices

### ✅ DO:
- Update statuses promptly after each session
- Convert "A" to "C" after session completes
- Convert "P" to "C" once payment received
- Use "N" for days with no scheduled classes
- Check weekly totals match actual payments

### ❌ DON'T:
- Leave completed sessions unmarked
- Forget to update "P" to "C" after payment
- Use "C" if payment not yet received
- Delete sessions (use "N" instead)
- Ignore teacher/student absences

---

## Quick Actions

**Click on any day cell** → Opens status menu  
**Select new status** → Updates immediately  
**Earnings recalculate** → Automatic  
**Confirmation for "N"** → Prevents accidents

---

## Need Help?

Refer to:
- **FEATURES.md** - Complete feature documentation
- **QUICKSTART.md** - Setup and usage guide
- **In-app tooltips** - Hover over status cells

---

**Remember:** Only **C** (Completed & Paid) and **A** (Advance Paid) count toward total earnings!

---

*Last Updated: December 2, 2025*
