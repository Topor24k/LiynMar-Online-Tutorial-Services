import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import studentService from '../services/studentService';
import teacherService from '../services/teacherService';
import './Students.css';

const Students = ({ searchQuery = '' }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentForAssignment, setSelectedStudentForAssignment] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive', 'deleted'
  const [loading, setLoading] = useState(true);
  const [studentsData, setStudentsData] = useState([]);
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [newStudent, setNewStudent] = useState({
    parentFbName: '',
    studentName: '',
    gradeLevel: '',
    contactNumber: '',
    facebookProfileLink: '',
    status: 'active'
  });
  const [assignmentData, setAssignmentData] = useState({
    teacherId: '',
    subjectFocus: '',
    weeks: [
      {
        id: Date.now(),
        weekStartDate: null,
        weekEndDate: null,
        schedule: {
          monday: { selected: false, time: '', duration: '1', subject: '' },
          tuesday: { selected: false, time: '', duration: '1', subject: '' },
          wednesday: { selected: false, time: '', duration: '1', subject: '' },
          thursday: { selected: false, time: '', duration: '1', subject: '' },
          friday: { selected: false, time: '', duration: '1', subject: '' },
          saturday: { selected: false, time: '', duration: '1', subject: '' },
          sunday: { selected: false, time: '', duration: '1', subject: '' },
        }
      }
    ]
  });

  // Fetch students and teachers from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsResponse, teachersResponse] = await Promise.all([
        studentService.getAllStudents(),
        teacherService.getAllTeachers()
      ]);
      
      const allStudents = studentsResponse.data || [];
      const allTeachers = teachersResponse.data || [];
      
      // Separate active and deleted students
      const active = allStudents.filter(s => !s.isDeleted);
      const deleted = allStudents.filter(s => s.isDeleted);
      
      setStudentsData(active);
      setDeletedStudents(deleted);
      setTeachersData(allTeachers.filter(t => !t.isDeleted));
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get active teachers only
  const getActiveTeachers = () => {
    return teachersData.filter(teacher => teacher.status === 'active');
  };

  // Get assigned teacher for a student
  const getAssignedTeacher = (student) => {
    // Check assignedTeacherForTheWeek first (new field)
    if (student.assignedTeacherForTheWeek) {
      // If populated (has name property)
      if (typeof student.assignedTeacherForTheWeek === 'object' && student.assignedTeacherForTheWeek.name) {
        return student.assignedTeacherForTheWeek.name;
      }
      // If just an ID, find the teacher
      const teacher = teachersData.find(t => t._id === student.assignedTeacherForTheWeek);
      return teacher ? teacher.name : 'Not Assigned';
    }
    
    // Fallback to old assignedTeacher field for backward compatibility
    if (student.assignedTeacher) {
      if (typeof student.assignedTeacher === 'object' && student.assignedTeacher.name) {
        return student.assignedTeacher.name;
      }
      const teacher = teachersData.find(t => t._id === student.assignedTeacher);
      return teacher ? teacher.name : 'Not Assigned';
    }
    
    return 'Not Assigned';
  };

  // Filter and sort students
  const getFilteredAndSortedStudents = () => {
    let filtered;

    // Choose dataset based on activeFilter
    switch (activeFilter) {
      case 'deleted':
        filtered = deletedStudents.map(student => ({
          ...student,
          assignedTeacher: getAssignedTeacher(student)
        }));
        break;
      case 'active':
        filtered = studentsData
          .filter(s => s.status === 'active')
          .map(student => ({
            ...student,
            assignedTeacher: getAssignedTeacher(student)
          }));
        break;
      case 'inactive':
        filtered = studentsData
          .filter(s => s.status === 'inactive')
          .map(student => ({
            ...student,
            assignedTeacher: getAssignedTeacher(student)
          }));
        break;
      case 'all':
      default:
        filtered = studentsData.map(student => ({
          ...student,
          assignedTeacher: getAssignedTeacher(student)
        }));
        break;
    }

    // Remove duplicates by _id - keep only unique students
    const uniqueStudents = [];
    const seenIds = new Set();
    
    filtered.forEach(student => {
      if (!seenIds.has(student._id)) {
        seenIds.add(student._id);
        uniqueStudents.push(student);
      }
    });
    
    filtered = uniqueStudents;

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((student) =>
        (student.parentFbName && student.parentFbName.toLowerCase().includes(query)) ||
        (student.parentFacebookName && student.parentFacebookName.toLowerCase().includes(query)) ||
        student.studentName.toLowerCase().includes(query) ||
        student.gradeLevel.toLowerCase().includes(query) ||
        (student.assignedTeacher && student.assignedTeacher.toLowerCase().includes(query)) ||
        (student.status && student.status.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredStudents = getFilteredAndSortedStudents();

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await studentService.createStudent(newStudent);
      
      toast.success('Student added successfully!');
      setShowAddForm(false);
      setNewStudent({
        parentFbName: '',
        studentName: '',
        gradeLevel: '',
        contactNumber: '',
        facebookProfileLink: '',
        status: 'active'
      });
      
      await fetchData();
    } catch (error) {
      // Check if it's a duplicate student error
      if (error.response?.data?.existingStudent) {
        const existing = error.response.data.existingStudent;
        const message = `Student "${existing.studentName}" (Parent: ${existing.parentFbName}) already exists. ${existing.assignedTeacherForTheWeek ? 'Already has an assigned teacher.' : 'You can assign a teacher to the existing student.'}`;
        toast.warning(message, { autoClose: 5000 });
      } else {
        toast.error(error.response?.data?.message || 'Failed to add student');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({
      ...newStudent,
      [name]: value
    });
  };

  const handleSoftDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    setLoading(true);
    try {
      await studentService.deleteStudent(studentId);
      toast.success('Student moved to deleted items');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (studentId) => {
    if (!window.confirm('Are you sure you want to restore this student?')) {
      return;
    }

    setLoading(true);
    try {
      await studentService.restoreStudent(studentId);
      toast.success('Student restored successfully');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore student');
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this student? This action cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      await studentService.permanentDeleteStudent(studentId);
      toast.success('Student permanently deleted');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to permanently delete student');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async (studentId) => {
    const student = studentsData.find(s => s._id === studentId);
    if (!student) return;

    // Get current week's Monday
    const today = new Date();
    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? 1 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    setSelectedStudentForAssignment(student);
    setAssignmentData({
      teacherId: '',
      subjectFocus: '',
      weeks: [
        {
          id: Date.now(),
          weekStartDate: monday,
          weekEndDate: sunday,
          schedule: {
            monday: { selected: false, time: '', duration: '1', subject: '' },
            tuesday: { selected: false, time: '', duration: '1', subject: '' },
            wednesday: { selected: false, time: '', duration: '1', subject: '' },
            thursday: { selected: false, time: '', duration: '1', subject: '' },
            friday: { selected: false, time: '', duration: '1', subject: '' },
            saturday: { selected: false, time: '', duration: '1', subject: '' },
            sunday: { selected: false, time: '', duration: '1', subject: '' },
          }
        }
      ]
    });
    setShowAssignModal(true);
  };

  const addWeek = () => {
    const lastWeek = assignmentData.weeks[assignmentData.weeks.length - 1];
    const newWeekStart = new Date(lastWeek.weekStartDate);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    
    const newWeekEnd = new Date(newWeekStart);
    newWeekEnd.setDate(newWeekEnd.getDate() + 6);
    newWeekEnd.setHours(23, 59, 59, 999);
    
    setAssignmentData({
      ...assignmentData,
      weeks: [
        ...assignmentData.weeks,
        {
          id: Date.now(),
          weekStartDate: newWeekStart,
          weekEndDate: newWeekEnd,
          schedule: {
            monday: { selected: false, time: '', duration: '1', subject: '' },
            tuesday: { selected: false, time: '', duration: '1', subject: '' },
            wednesday: { selected: false, time: '', duration: '1', subject: '' },
            thursday: { selected: false, time: '', duration: '1', subject: '' },
            friday: { selected: false, time: '', duration: '1', subject: '' },
            saturday: { selected: false, time: '', duration: '1', subject: '' },
            sunday: { selected: false, time: '', duration: '1', subject: '' },
          }
        }
      ]
    });
  };

  const removeWeek = (weekIndex) => {
    if (assignmentData.weeks.length > 1) {
      setAssignmentData({
        ...assignmentData,
        weeks: assignmentData.weeks.filter((_, index) => index !== weekIndex)
      });
    }
  };

  const handleDayToggle = (weekIndex, day) => {
    const newWeeks = [...assignmentData.weeks];
    newWeeks[weekIndex].schedule[day].selected = !newWeeks[weekIndex].schedule[day].selected;
    setAssignmentData({
      ...assignmentData,
      weeks: newWeeks
    });
  };

  const handleScheduleChange = (weekIndex, day, field, value) => {
    const newWeeks = [...assignmentData.weeks];
    newWeeks[weekIndex].schedule[day][field] = value;
    setAssignmentData({
      ...assignmentData,
      weeks: newWeeks
    });
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (!assignmentData.teacherId) {
      toast.error('Please select a teacher');
      return;
    }

    // Check if at least one day is selected across all weeks
    const hasSelectedDay = assignmentData.weeks.some(week =>
      Object.values(week.schedule).some(day => day.selected)
    );
    
    if (!hasSelectedDay) {
      toast.error('Please select at least one day in the weekly schedule');
      return;
    }

    setLoading(true);
    try {
      // Build combined weekly schedule from all weeks
      const combinedSchedule = {};
      assignmentData.weeks.forEach(week => {
        Object.entries(week.schedule).forEach(([day, schedule]) => {
          if (schedule.selected) {
            if (!combinedSchedule[day]) {
              combinedSchedule[day] = schedule;
            }
          }
        });
      });

      await studentService.assignTeacher(
        selectedStudentForAssignment._id, 
        assignmentData.teacherId,
        combinedSchedule
      );
      
      const teacher = teachersData.find(t => t._id === assignmentData.teacherId);
      toast.success(`Successfully assigned ${teacher.name} to ${selectedStudentForAssignment.studentName}`);
      setShowAssignModal(false);
      setSelectedStudentForAssignment(null);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignTeacher = async (studentId) => {
    if (!window.confirm('Are you sure you want to unassign the teacher from this student?')) {
      return;
    }

    setLoading(true);
    try {
      await studentService.unassignTeacher(studentId);
      toast.success('Teacher unassigned successfully');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unassign teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!window.confirm('This will remove duplicate students (same name and parent). The oldest record will be kept. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await studentService.removeDuplicates();
      toast.success(`Successfully removed ${response.removedCount} duplicate student(s)`);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove duplicates');
    } finally {
      setLoading(false);
    }
  };

  // Count students by status
  const allCount = studentsData.length;
  const activeCount = studentsData.filter(s => s.status === 'active').length;
  const inactiveCount = studentsData.filter(s => s.status === 'inactive').length;
  const deletedCount = deletedStudents.length;

  return (
    <div className="students-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Students Management</h2>
          <p className="page-subtitle">Manage and monitor all students</p>
        </div>
        <div className="page-actions">
          <button className="btn-secondary" onClick={handleRemoveDuplicates}>
            <i className="fas fa-broom"></i> Clean Duplicates
          </button>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            <i className="fas fa-plus"></i> Add Student
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="students-tabs">
        <button 
          className={`tab-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <i className="fas fa-list"></i> All
        </button>
        <button 
          className={`tab-button ${activeFilter === 'active' ? 'active' : ''}`}
          onClick={() => setActiveFilter('active')}
        >
          <i className="fas fa-users"></i> Active Students
          <span className="tab-count">{activeCount}</span>
        </button>
        <button 
          className={`tab-button ${activeFilter === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveFilter('inactive')}
        >
          <i className="fas fa-user-slash"></i> Inactive Students
          <span className="tab-count">{inactiveCount}</span>
        </button>
        <button 
          className={`tab-button ${activeFilter === 'deleted' ? 'active' : ''}`}
          onClick={() => setActiveFilter('deleted')}
        >
          <i className="fas fa-trash-alt"></i> Deleted Students
          <span className="tab-count">{deletedCount}</span>
        </button>
      </div>

      {/* Add Student Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="btn-close" onClick={() => setShowAddForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Parent Facebook Name *</label>
                  <input
                    type="text"
                    name="parentFbName"
                    value={newStudent.parentFbName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    value={newStudent.studentName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Grade Level *</label>
                  <select
                    name="gradeLevel"
                    value={newStudent.gradeLevel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Grade Level</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={newStudent.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && selectedStudentForAssignment && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content assign-teacher-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Session Schedule</h3>
              <button className="btn-close" onClick={() => setShowAssignModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitAssignment}>
              <div className="form-content">
                <div className="form-section">
                  
                  <div className="form-group">
                    <label>Select Teacher *</label>
                    <select
                      value={assignmentData.teacherId}
                      onChange={(e) => setAssignmentData({...assignmentData, teacherId: e.target.value})}
                      required
                    >
                      <option value="">Choose a teacher</option>
                      {getActiveTeachers().map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} - {teacher.majorSubject || teacher.subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subjectFocus">
                      <i className="fas fa-book icon-label"></i> Subject Focus *
                    </label>
                    <input
                      id="subjectFocus"
                      type="text"
                      value={assignmentData.subjectFocus}
                      onChange={(e) => setAssignmentData({...assignmentData, subjectFocus: e.target.value})}
                      required
                      placeholder="e.g., Math and Science, English Literature, etc."
                    />
                    <p className="form-help">Primary subjects that will be covered in the tutoring sessions</p>
                  </div>

                  <div className="form-divider"></div>

                  <div className="form-group full-width">
                    <div className="schedule-header">
                      <label className="schedule-label">
                        <i className="fas fa-calendar-week icon-label"></i> Weekly Schedules *
                      </label>
                      <button 
                        type="button" 
                        className="btn-add-week"
                        onClick={addWeek}
                      >
                        <i className="fas fa-plus"></i> Add Next Week
                      </button>
                    </div>
                    <p className="form-help">Each week is a separate booking. Click "Add Next Week" to schedule additional weeks.</p>
                    
                    {assignmentData.weeks.map((week, weekIndex) => (
                      <div key={week.id} className="week-block">
                        <div className="week-block-header">
                          <h4>
                            <i className="fas fa-calendar-alt"></i> 
                            Week {weekIndex + 1}: {week.weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {week.weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </h4>
                          {assignmentData.weeks.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-week"
                              onClick={() => removeWeek(weekIndex)}
                              title="Remove this week"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                        
                        <div className="weekly-schedule">
                          {Object.entries(week.schedule).map(([day, schedule]) => (
                            <div key={day} className={`day-schedule ${schedule.selected ? 'selected' : ''}`}>
                              <div className="day-header">
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={schedule.selected}
                                    onChange={() => handleDayToggle(weekIndex, day)}
                                  />
                                  <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                                </label>
                              </div>
                              {schedule.selected && (
                                <div className="day-details">
                                  <div className="detail-field">
                                    <label>Time</label>
                                    <input
                                      type="time"
                                      value={schedule.time}
                                      onChange={(e) => handleScheduleChange(weekIndex, day, 'time', e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="detail-field">
                                    <label>Duration</label>
                                    <select
                                      value={schedule.duration}
                                      onChange={(e) => handleScheduleChange(weekIndex, day, 'duration', e.target.value)}
                                    >
                                      <option value="0.5">30 mins</option>
                                      <option value="1">1 hour</option>
                                      <option value="1.5">1.5 hours</option>
                                      <option value="2">2 hours</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Assign Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Students List</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parent Facebook Name</th>
                <th>Student Name</th>
                <th>Grade Level</th>
                <th>Assigned Teacher for the Week</th>
                <th>{activeFilter === 'deleted' ? 'Deleted Date' : 'Student Status'}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    <i className="fas fa-spinner fa-spin"></i> Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="student-row">
                    <td>{student.parentFbName || student.parentFacebookName}</td>
                    <td>
                      <div className="student-cell">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.studentName)}&background=8B7355&color=fff`}
                          alt={student.studentName}
                        />
                        <span>{student.studentName}</span>
                      </div>
                    </td>
                    <td>{student.gradeLevel}</td>
                    <td>
                      <div className="assigned-teacher-cell">
                        <span>{student.assignedTeacher || 'Not Assigned'}</span>
                        {!activeFilter.includes('deleted') && student.status === 'active' && (
                          <div className="teacher-actions-inline">
                            {student.assignedTeacher && student.assignedTeacher !== 'Not Assigned' ? (
                              <button
                                className="btn-icon unassign-teacher"
                                onClick={() => handleUnassignTeacher(student._id)}
                                title="Unassign Teacher"
                              >
                                <i className="fas fa-user-times"></i>
                              </button>
                            ) : (
                              <button
                                className="btn-icon assign-teacher"
                                onClick={() => handleAssignTeacher(student._id)}
                                title="Assign Teacher"
                              >
                                <i className="fas fa-user-plus"></i>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {activeFilter === 'deleted' ? (
                        <span className="deleted-date">
                          {new Date(student.deletedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className={`status-badge ${student.status}`}>
                          {student.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td>
                      {activeFilter === 'deleted' ? (
                        <>
                          <button
                            className="btn-icon restore-student"
                            title="Restore Student"
                            onClick={() => handleRestore(student._id)}
                          >
                            <i className="fas fa-undo"></i>
                          </button>
                          <button
                            className="btn-icon permanent-delete-student"
                            title="Permanently Delete"
                            onClick={() => handlePermanentDelete(student._id)}
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-icon delete-student"
                          title="Delete Student"
                          onClick={() => handleSoftDelete(student._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;
