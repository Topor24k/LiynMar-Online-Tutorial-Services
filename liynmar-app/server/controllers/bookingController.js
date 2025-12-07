import Booking from '../models/Booking.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Public
export const getAllBookings = async (req, res) => {
  try {
    const { status, teacherId } = req.query;
    
    let query = { isDeleted: false };
    
    if (status) {
      query.status = status;
    }
    
    if (teacherId) {
      query.teacherId = teacherId;
    }

    const bookings = await Booking.find(query)
      .populate('teacherId', 'name majorSubject email')
      .sort({ weekStartDate: -1 });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Public
export const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ isDeleted: false });
    const activeBookings = await Booking.countDocuments({ status: 'active', isDeleted: false });
    const completedBookings = await Booking.countDocuments({ status: 'completed', isDeleted: false });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled', isDeleted: false });

    res.status(200).json({
      status: 'success',
      data: {
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get bookings by teacher
// @route   GET /api/bookings/teacher/:teacherId
// @access  Public
export const getBookingsByTeacher = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      teacherId: req.params.teacherId,
      isDeleted: false 
    }).sort({ weekStartDate: -1 });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Public
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('teacherId', 'name majorSubject email contactNumber facebookAccount');
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req, res) => {
  try {
    const { 
      teacherId, 
      parentFbName,
      studentName, 
      gradeLevel,
      subjectFocus,
      contactNumber,
      facebookProfileLink,
      additionalNote,
      weeklySchedule,
      totalEarningsPerWeek,
      weekStartDate,
      skipStudentCreation
    } = req.body;

    // Validate required fields
    if (!teacherId || !parentFbName || !studentName || !gradeLevel || !subjectFocus || !weekStartDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Calculate week end date (6 days after start)
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Rate calculation based on duration
    const getRateForDuration = (duration) => {
      const rates = {
        0.5: 63,   // 30 mins
        1: 125,    // 1 hour
        1.5: 188,  // 1.5 hours
        2: 250     // 2 hours
      };
      return rates[duration] || 125;
    };

    // Initialize weeklySchedule and sessionStatus with dates and rates
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayMap = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
    const sessionStatus = {};
    let totalWeekEarnings = 0;

    days.forEach(day => {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + dayMap[day]);
      
      // Check if this day is scheduled (supports both boolean and object format)
      const daySchedule = weeklySchedule && weeklySchedule[day];
      const isScheduled = daySchedule ? (typeof daySchedule === 'boolean' ? daySchedule : daySchedule.isScheduled) : false;
      const duration = daySchedule && typeof daySchedule === 'object' ? daySchedule.duration : 1;
      const rate = getRateForDuration(duration);
      
      if (isScheduled) {
        totalWeekEarnings += rate;
      }
      
      sessionStatus[day] = {
        status: isScheduled ? 'P' : 'N',
        date: isScheduled ? dayDate : null,  // Only set date if scheduled
        weekStart: isScheduled ? startDate : null,
        weekEnd: isScheduled ? endDate : null
      };
    });

    // Create the booking
    const booking = await Booking.create({
      teacherId,
      parentFbName,
      studentName,
      gradeLevel,
      subjectFocus,
      contactNumber,
      facebookProfileLink,
      additionalNote,
      weeklySchedule,
      sessionStatus,
      totalEarningsPerWeek: totalWeekEarnings,
      weekStartDate: startDate,
      weekEndDate: endDate,
      status: 'active'
    });

    // Update or create student record (prevent duplicates)
    // Only handle student creation if skipStudentCreation is not true
    if (!skipStudentCreation) {
      let student = await Student.findOne({ 
        studentName: { $regex: new RegExp(`^${studentName}$`, 'i') },
        parentFbName: { $regex: new RegExp(`^${parentFbName}$`, 'i') },
        isDeleted: false 
      });

      if (!student) {
        // Create new student only if not found
        student = await Student.create({
          parentFbName,
          studentName,
          gradeLevel,
          assignedTeacherForTheWeek: teacherId,
          contactNumber,
          facebookProfileLink,
          status: 'active'
        });
      } else {
        // Update existing student with current week's teacher and latest info
        student.assignedTeacherForTheWeek = teacherId;
        student.gradeLevel = gradeLevel;
        student.contactNumber = contactNumber || student.contactNumber;
        student.facebookProfileLink = facebookProfileLink || student.facebookProfileLink;
        student.status = 'active'; // Ensure student is active
        await student.save();
      }
    }

    // Update teacher's total bookings
    await Teacher.findByIdAndUpdate(
      teacherId,
      { $inc: { totalBookings: 1 } }
    );

    // Populate teacher info before sending response
    await booking.populate('teacherId', 'name majorSubject email');

    res.status(201).json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Public
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('teacherId', 'name majorSubject');
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Public
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Store teacherId before deletion
    const teacherId = booking.teacherId;

    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    // Decrement teacher's totalBookings
    await Teacher.findByIdAndUpdate(
      teacherId,
      { $inc: { totalBookings: -1 } }
    );

    res.status(200).json({
      status: 'success',
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
