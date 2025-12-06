import mongoose from 'mongoose';

const jobExperienceSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Internship', 'Freelance', 'Contractual'],
    default: 'Full Time'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  jobLocation: {
    type: String,
    trim: true
  }
}, { _id: false });

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  facebook: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  daysAvailable: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  usualTime: {
    type: String,
    trim: true
  },
  jobExperience: [jobExperienceSchema],
  lastBookingDate: {
    type: Date
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

// Index for faster queries
// Index for faster queries
teacherSchema.index({ email: 1 }, { unique: true });
teacherSchema.index({ status: 1 });
teacherSchema.index({ isDeleted: 1 });
// Virtual for total bookings (will be populated from bookings collection)
teacherSchema.virtual('totalBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'teacherId',
  count: true
});

// Ensure virtuals are included in JSON
teacherSchema.set('toJSON', { virtuals: true });
teacherSchema.set('toObject', { virtuals: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
