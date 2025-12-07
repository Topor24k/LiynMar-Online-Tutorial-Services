import mongoose from 'mongoose';

const sessionDaySchema = new mongoose.Schema({
  isScheduled: { type: Boolean, default: false },
  duration: { type: Number, enum: [0.5, 1, 1.5, 2], default: 1 }, // in hours
  rate: { type: Number, default: 0 } // rate for this session
}, { _id: false });

const weeklyScheduleSchema = new mongoose.Schema({
  monday: { type: sessionDaySchema, default: () => ({ isScheduled: false, duration: 1, rate: 0 }) },
  tuesday: { type: sessionDaySchema, default: () => ({ isScheduled: false, duration: 1, rate: 0 }) },
  wednesday: { type: sessionDaySchema, default: () => ({ isScheduled: false, duration: 1, rate: 0 }) },
  thursday: { type: sessionDaySchema, default: () => ({ isScheduled: false, duration: 1, rate: 0 }) },
  friday: { type: sessionDaySchema, default: () => ({ isScheduled: false, duration: 1, rate: 0 }) },
  saturday: { type: sessionDaySchema, default: () => ({ isScheduled: false, duration: 1, rate: 0 }) },
  sunday: { type: sessionDaySchema, default: () => ({ isScheduled: false, duration: 1, rate: 0 }) }
}, { _id: false });

const sessionStatusDaySchema = new mongoose.Schema({
  status: { type: String, enum: ['C', 'A', 'P', 'T', 'S', 'N', 'AT', 'AS'], default: 'N' },
  date: { type: Date },
  weekStart: { type: Date },
  weekEnd: { type: Date }
}, { _id: false });

const sessionStatusSchema = new mongoose.Schema({
  monday: { type: sessionStatusDaySchema, default: () => ({ status: 'N' }) },
  tuesday: { type: sessionStatusDaySchema, default: () => ({ status: 'N' }) },
  wednesday: { type: sessionStatusDaySchema, default: () => ({ status: 'N' }) },
  thursday: { type: sessionStatusDaySchema, default: () => ({ status: 'N' }) },
  friday: { type: sessionStatusDaySchema, default: () => ({ status: 'N' }) },
  saturday: { type: sessionStatusDaySchema, default: () => ({ status: 'N' }) },
  sunday: { type: sessionStatusDaySchema, default: () => ({ status: 'N' }) }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher ID is required']
  },
  parentFbName: {
    type: String,
    required: [true, 'Parent Facebook name is required'],
    trim: true
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  gradeLevel: {
    type: String,
    required: [true, 'Grade level is required'],
    enum: [
      'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
      'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
    ]
  },
  subjectFocus: {
    type: String,
    required: [true, 'Subject focus is required'],
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  },
  facebookProfileLink: {
    type: String,
    trim: true
  },
  additionalNote: {
    type: String,
    trim: true
  },
  weeklySchedule: weeklyScheduleSchema,
  sessionStatus: {
    type: sessionStatusSchema,
    default: () => ({})
  },
  totalEarningsPerWeek: {
    type: Number,
    default: 0
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware to set sessionStatus based on weeklySchedule
bookingSchema.pre('save', function(next) {
  // Only set initial sessionStatus if it's a new document or sessionStatus is not set
  if (this.isNew || !this.sessionStatus || Object.keys(this.sessionStatus).length === 0) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayMap = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
    const newSessionStatus = {};
    
    days.forEach(day => {
      const dayDate = new Date(this.weekStartDate);
      dayDate.setDate(this.weekStartDate.getDate() + dayMap[day]);
      
      // Check if weeklySchedule has the new structure (object) or old structure (boolean)
      const isScheduled = this.weeklySchedule && this.weeklySchedule[day] 
        ? (typeof this.weeklySchedule[day] === 'boolean' ? this.weeklySchedule[day] : this.weeklySchedule[day].isScheduled)
        : false;
      
      newSessionStatus[day] = {
        status: isScheduled ? 'P' : 'N',
        date: isScheduled ? dayDate : null,  // Only set date if scheduled
        weekStart: isScheduled ? this.weekStartDate : null,
        weekEnd: isScheduled ? this.weekEndDate : null
      };
    });
    
    this.sessionStatus = newSessionStatus;
  }
  next();
});

// Indexes for faster queries
bookingSchema.index({ teacherId: 1 });
bookingSchema.index({ studentName: 1 });
bookingSchema.index({ weekStartDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ isDeleted: 1 });
bookingSchema.index({ teacherId: 1, weekStartDate: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
