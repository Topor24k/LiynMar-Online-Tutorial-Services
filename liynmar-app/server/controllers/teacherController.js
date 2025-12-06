import Teacher from '../models/Teacher.js';
import Booking from '../models/Booking.js';

// @desc    Get all teachers (non-deleted)
// @route   GET /api/teachers
// @access  Public
export const getAllTeachers = async (req, res) => {
  try {
    const { status, sort } = req.query;
    
    let query = { isDeleted: false };
    
    if (status) {
      query.status = status;
    }

    let teachersQuery = Teacher.find(query);

    // Sorting
    if (sort === 'least-booked' || sort === 'most-booked') {
      // We'll handle this with aggregation
      const teachers = await Teacher.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'teacherId',
            as: 'bookings'
          }
        },
        {
          $addFields: {
            totalBookings: { $size: '$bookings' }
          }
        },
        {
          $sort: { totalBookings: sort === 'most-booked' ? -1 : 1 }
        },
        {
          $project: { bookings: 0 }
        }
      ]);
      
      return res.status(200).json({
        status: 'success',
        results: teachers.length,
        data: teachers
      });
    }

    const teachers = await teachersQuery.sort({ createdAt: -1 });

    // Get booking counts for each teacher
    const teachersWithBookings = await Promise.all(
      teachers.map(async (teacher) => {
        const bookingCount = await Booking.countDocuments({ 
          teacherId: teacher._id,
          isDeleted: false 
        });
        
        const lastBooking = await Booking.findOne({ 
          teacherId: teacher._id,
          isDeleted: false 
        }).sort({ date: -1 });

        return {
          ...teacher.toObject(),
          totalBookings: bookingCount,
          lastBookingDate: lastBooking?.date || null
        };
      })
    );

    res.status(200).json({
      status: 'success',
      results: teachersWithBookings.length,
      data: teachersWithBookings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get deleted teachers
// @route   GET /api/teachers/deleted
// @access  Public
export const getDeletedTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isDeleted: true }).sort({ deletedAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: teachers.length,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Public
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    // Get bookings for this teacher
    const bookings = await Booking.find({ 
      teacherId: teacher._id,
      isDeleted: false 
    }).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        teacher,
        bookings,
        totalBookings: bookings.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Public
export const createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: teacher
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Public
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: teacher
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Soft delete teacher
// @route   DELETE /api/teachers/:id
// @access  Public
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Teacher moved to deleted items',
      data: teacher
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Restore deleted teacher
// @route   PATCH /api/teachers/:id/restore
// @access  Public
export const restoreTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: false,
        $unset: { deletedAt: 1 }
      },
      { new: true }
    );
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Teacher restored successfully',
      data: teacher
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Permanent delete teacher
// @route   DELETE /api/teachers/:id/permanent
// @access  Public
export const permanentDeleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    // Also delete all bookings for this teacher
    await Booking.deleteMany({ teacherId: req.params.id });

    res.status(200).json({
      status: 'success',
      message: 'Teacher permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
