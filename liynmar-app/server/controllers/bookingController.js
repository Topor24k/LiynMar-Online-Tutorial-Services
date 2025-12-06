import Booking from '../models/Booking.js';
import Teacher from '../models/Teacher.js';

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
      .populate('teacherId', 'name subject email')
      .sort({ date: -1 });

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
    const completedBookings = await Booking.countDocuments({ status: 'completed', isDeleted: false });
    const pendingBookings = await Booking.countDocuments({ status: 'pending', isDeleted: false });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled', isDeleted: false });

    res.status(200).json({
      status: 'success',
      data: {
        totalBookings,
        completedBookings,
        pendingBookings,
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
    }).sort({ date: -1 });

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
      .populate('teacherId', 'name subject email phone');
    
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
    const booking = await Booking.create(req.body);
    
    // Update teacher's last booking date
    await Teacher.findByIdAndUpdate(
      booking.teacherId,
      { lastBookingDate: booking.date }
    );

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
    ).populate('teacherId', 'name subject');
    
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
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

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
