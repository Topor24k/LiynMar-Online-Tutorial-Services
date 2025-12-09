import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Booking from '../models/Booking.js';

/**
 * Get the start and end dates of the current week (Monday to Sunday)
 */
export const getCurrentWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate days to subtract to get to Monday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysToMonday);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
};

/**
 * Check if a teacher has any bookings for the current week
 */
export const hasCurrentWeekBookings = async (teacherId) => {
  const { weekStart, weekEnd } = getCurrentWeekDates();
  
  const bookingCount = await Booking.countDocuments({
    teacherId,
    isDeleted: false,
    status: 'active',
    weekStartDate: { $lte: weekEnd },
    weekEndDate: { $gte: weekStart }
  });
  
  return bookingCount > 0;
};

/**
 * Check if a student has an assigned teacher for the current week
 */
export const hasCurrentWeekTeacher = async (studentName, parentFbName) => {
  const { weekStart, weekEnd } = getCurrentWeekDates();
  
  const bookingCount = await Booking.countDocuments({
    studentName: { $regex: new RegExp(`^${studentName}$`, 'i') },
    parentFbName: { $regex: new RegExp(`^${parentFbName}$`, 'i') },
    isDeleted: false,
    status: 'active',
    weekStartDate: { $lte: weekEnd },
    weekEndDate: { $gte: weekStart }
  });
  
  return bookingCount > 0;
};

/**
 * Update teacher status based on current week bookings
 */
export const updateTeacherStatus = async (teacherId) => {
  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || teacher.isDeleted) {
      return null;
    }

    const hasBookings = await hasCurrentWeekBookings(teacherId);
    const newStatus = hasBookings ? 'active' : 'inactive';
    const previousStatus = teacher.status;
    
    if (previousStatus !== newStatus) {
      // Status is changing
      teacher.status = newStatus;
      teacher.lastStatusChange = new Date();
      
      if (newStatus === 'active') {
        // Reset inactive days when becoming active
        teacher.inactiveDays = 0;
      } else {
        // Start counting from day 1 when becoming inactive
        teacher.inactiveDays = 1;
      }
      
      await teacher.save();
      console.log(`Teacher ${teacher.name} status updated to ${newStatus}`);
    } else if (newStatus === 'inactive') {
      // Still inactive, increment the counter (daily check)
      const lastChange = new Date(teacher.lastStatusChange);
      const now = new Date();
      const daysDiff = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0) {
        teacher.inactiveDays = daysDiff;
        await teacher.save();
        console.log(`Teacher ${teacher.name} inactive for ${teacher.inactiveDays} days`);
      }
    }
    
    return teacher;
  } catch (error) {
    console.error(`Error updating teacher status: ${error.message}`);
    throw error;
  }
};

/**
 * Update student status based on current week teacher assignment
 */
export const updateStudentStatus = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    if (!student || student.isDeleted) {
      return null;
    }

    const hasTeacher = await hasCurrentWeekTeacher(student.studentName, student.parentFbName);
    const newStatus = hasTeacher ? 'active' : 'inactive';
    const previousStatus = student.status;
    
    if (previousStatus !== newStatus) {
      // Status is changing
      student.status = newStatus;
      student.lastStatusChange = new Date();
      
      if (newStatus === 'active') {
        // Reset inactive days when becoming active
        student.inactiveDays = 0;
      } else {
        // Start counting from day 1 when becoming inactive
        student.inactiveDays = 1;
        student.assignedTeacherForTheWeek = null;
      }
      
      await student.save();
      console.log(`Student ${student.studentName} status updated to ${newStatus}`);
    } else if (newStatus === 'inactive') {
      // Still inactive, increment the counter (daily check)
      const lastChange = new Date(student.lastStatusChange);
      const now = new Date();
      const daysDiff = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0) {
        student.inactiveDays = daysDiff;
        student.assignedTeacherForTheWeek = null;
        await student.save();
        console.log(`Student ${student.studentName} inactive for ${student.inactiveDays} days`);
      }
    }
    
    return student;
  } catch (error) {
    console.error(`Error updating student status: ${error.message}`);
    throw error;
  }
};

/**
 * Check and update all teachers' statuses based on current week bookings
 */
export const updateAllTeacherStatuses = async () => {
  try {
    const teachers = await Teacher.find({ isDeleted: false });
    let updatedCount = 0;
    
    for (const teacher of teachers) {
      const hasBookings = await hasCurrentWeekBookings(teacher._id);
      const newStatus = hasBookings ? 'active' : 'inactive';
      const previousStatus = teacher.status;
      
      if (previousStatus !== newStatus) {
        // Status is changing
        teacher.status = newStatus;
        teacher.lastStatusChange = new Date();
        
        if (newStatus === 'active') {
          teacher.inactiveDays = 0;
        } else {
          teacher.inactiveDays = 1;
        }
        
        await teacher.save();
        updatedCount++;
        console.log(`Teacher ${teacher.name} status updated to ${newStatus}`);
      } else if (newStatus === 'inactive') {
        // Still inactive, increment the counter
        const lastChange = new Date(teacher.lastStatusChange);
        const now = new Date();
        const daysDiff = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0 && teacher.inactiveDays !== daysDiff) {
          teacher.inactiveDays = daysDiff;
          await teacher.save();
          updatedCount++;
          console.log(`Teacher ${teacher.name} inactive for ${teacher.inactiveDays} days`);
        }
      }
    }
    
    console.log(`Updated ${updatedCount} teacher statuses`);
    return updatedCount;
  } catch (error) {
    console.error(`Error updating all teacher statuses: ${error.message}`);
    throw error;
  }
};

/**
 * Check and update all students' statuses based on current week teacher assignments
 */
export const updateAllStudentStatuses = async () => {
  try {
    const students = await Student.find({ isDeleted: false });
    let updatedCount = 0;
    
    for (const student of students) {
      const hasTeacher = await hasCurrentWeekTeacher(student.studentName, student.parentFbName);
      const newStatus = hasTeacher ? 'active' : 'inactive';
      const previousStatus = student.status;
      
      if (previousStatus !== newStatus) {
        // Status is changing
        student.status = newStatus;
        student.lastStatusChange = new Date();
        
        if (newStatus === 'active') {
          student.inactiveDays = 0;
        } else {
          student.inactiveDays = 1;
          student.assignedTeacherForTheWeek = null;
        }
        
        await student.save();
        updatedCount++;
        console.log(`Student ${student.studentName} status updated to ${newStatus}`);
      } else if (newStatus === 'inactive') {
        // Still inactive, increment the counter
        const lastChange = new Date(student.lastStatusChange);
        const now = new Date();
        const daysDiff = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0 && student.inactiveDays !== daysDiff) {
          student.inactiveDays = daysDiff;
          student.assignedTeacherForTheWeek = null;
          await student.save();
          updatedCount++;
          console.log(`Student ${student.studentName} inactive for ${student.inactiveDays} days`);
        }
      }
    }
    
    console.log(`Updated ${updatedCount} student statuses`);
    return updatedCount;
  } catch (error) {
    console.error(`Error updating all student statuses: ${error.message}`);
    throw error;
  }
};

/**
 * Run full status check for both teachers and students
 */
export const runStatusCheck = async () => {
  console.log('Running status check...');
  const { weekStart, weekEnd } = getCurrentWeekDates();
  console.log(`Current week: ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);
  
  try {
    const teachersUpdated = await updateAllTeacherStatuses();
    const studentsUpdated = await updateAllStudentStatuses();
    
    console.log(`Status check complete: ${teachersUpdated} teachers and ${studentsUpdated} students updated`);
    return { teachersUpdated, studentsUpdated };
  } catch (error) {
    console.error(`Status check failed: ${error.message}`);
    throw error;
  }
};
