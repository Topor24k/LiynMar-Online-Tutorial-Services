import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// @desc    Get all students (non-deleted)
// @route   GET /api/students
// @access  Public
export const getAllStudents = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { isDeleted: false };
    
    if (status) {
      query.status = status;
    }

    const students = await Student.find(query)
      .populate('assignedTeacherId', 'name subject')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get deleted students
// @route   GET /api/students/deleted
// @access  Public
export const getDeletedStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: true })
      .populate('assignedTeacherId', 'name subject')
      .sort({ deletedAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Public
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('assignedTeacherId', 'name subject email phone');
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Public
export const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Public
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTeacherId', 'name subject');
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Soft delete student
// @route   DELETE /api/students/:id
// @access  Public
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Student moved to deleted items',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Restore deleted student
// @route   PATCH /api/students/:id/restore
// @access  Public
export const restoreStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: false,
        $unset: { deletedAt: 1 }
      },
      { new: true }
    ).populate('assignedTeacherId', 'name subject');
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Student restored successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Permanent delete student
// @route   DELETE /api/students/:id/permanent
// @access  Public
export const permanentDeleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Student permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Assign teacher to student
// @route   PATCH /api/students/:id/assign-teacher
// @access  Public
export const assignTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    
    // Verify teacher exists and is active
    const teacher = await Teacher.findOne({ 
      _id: teacherId, 
      status: 'active',
      isDeleted: false 
    });
    
    if (!teacher) {
      return res.status(400).json({
        status: 'error',
        message: 'Teacher not found or not active'
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { assignedTeacherId: teacherId },
      { new: true }
    ).populate('assignedTeacherId', 'name subject');
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Teacher assigned successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Unassign teacher from student
// @route   PATCH /api/students/:id/unassign-teacher
// @access  Public
export const unassignTeacher = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { assignedTeacherId: null },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Teacher unassigned successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
