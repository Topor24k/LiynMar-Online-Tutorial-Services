import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher ID is required']
  },
  teacherName: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['30 minutes', '1 hour', '1.5 hours', '2 hours']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  sessionNotes: {
    type: String,
    trim: true
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

// Indexes for faster queries
bookingSchema.index({ teacherId: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ isDeleted: 1 });
bookingSchema.index({ teacherId: 1, date: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
