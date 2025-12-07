import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
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
  assignedTeacherForTheWeek: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null
  },
  contactNumber: {
    type: String,
    trim: true
  },
  facebookProfileLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
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

// Indexes
studentSchema.index({ studentName: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ isDeleted: 1 });
studentSchema.index({ assignedTeacherForTheWeek: 1 });

// Virtual for assigned teacher details
studentSchema.virtual('assignedTeacher', {
  ref: 'Teacher',
  localField: 'assignedTeacherForTheWeek',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;
