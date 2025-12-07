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
      .populate('assignedTeacherForTheWeek', 'name majorSubject')
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
      .populate('assignedTeacherForTheWeek', 'name majorSubject')
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
      .populate('assignedTeacherForTheWeek', 'name majorSubject email contactNumber');
    
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
    const { studentName, parentFbName } = req.body;
    
    // Check if student already exists (case-insensitive)
    const existingStudent = await Student.findOne({
      studentName: { $regex: new RegExp(`^${studentName}$`, 'i') },
      parentFbName: { $regex: new RegExp(`^${parentFbName}$`, 'i') },
      isDeleted: false
    });

    if (existingStudent) {
      return res.status(400).json({
        status: 'error',
        message: 'Student already exists',
        existingStudent: {
          _id: existingStudent._id,
          studentName: existingStudent.studentName,
          parentFbName: existingStudent.parentFbName,
          gradeLevel: existingStudent.gradeLevel,
          assignedTeacherForTheWeek: existingStudent.assignedTeacherForTheWeek
        }
      });
    }

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
    const { teacherId, weeklySchedule } = req.body;
    
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

    const updateData = { 
      assignedTeacherForTheWeek: teacherId 
    };
    
    // Add weekly schedule if provided
    if (weeklySchedule) {
      updateData.weeklySchedule = weeklySchedule;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedTeacherForTheWeek', 'name majorSubject');
    
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
      { 
        assignedTeacherForTheWeek: null,
        weeklySchedule: new Map()
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

// @desc    Find and remove duplicate students
// @route   POST /api/students/remove-duplicates
// @access  Public
export const removeDuplicates = async (req, res) => {
  try {
    // Find all non-deleted students
    const allStudents = await Student.find({ isDeleted: false }).sort({ createdAt: 1 });
    
    const seen = new Map(); // key: "studentName|parentFbName", value: first student record
    const duplicatesToDelete = [];
    
    for (const student of allStudents) {
      const key = `${student.studentName.toLowerCase()}|${student.parentFbName.toLowerCase()}`;
      
      if (seen.has(key)) {
        // This is a duplicate - mark for deletion
        duplicatesToDelete.push(student._id);
      } else {
        // This is the first occurrence - keep it
        seen.set(key, student);
      }
    }
    
    // Soft delete the duplicates
    if (duplicatesToDelete.length > 0) {
      await Student.updateMany(
        { _id: { $in: duplicatesToDelete } },
        { 
          isDeleted: true,
          deletedAt: new Date()
        }
      );
    }
    
    res.status(200).json({
      status: 'success',
      message: `Removed ${duplicatesToDelete.length} duplicate students`,
      removedCount: duplicatesToDelete.length,
      removedIds: duplicatesToDelete
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
