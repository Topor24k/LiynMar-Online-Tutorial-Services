import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import studentService from '../services/studentService';
import teacherService from '../services/teacherService';
import './Students.css';

const Students = ({ searchQuery = '' }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive', 'deleted'
  const [loading, setLoading] = useState(true);
  const [studentsData, setStudentsData] = useState([]);
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [newStudent, setNewStudent] = useState({
    parentFacebookName: '',
    studentName: '',
    gradeLevel: '',
    status: 'active'
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
    if (!student.assignedTeacher) return 'Not Assigned';
    
    // If assignedTeacher is populated (has name property)
    if (typeof student.assignedTeacher === 'object' && student.assignedTeacher.name) {
      return student.assignedTeacher.name;
    }
    
    // If assignedTeacher is just an ID, find the teacher
    const teacher = teachersData.find(t => t._id === student.assignedTeacher);
    return teacher ? teacher.name : 'Not Assigned';
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

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((student) =>
        student.parentFacebookName.toLowerCase().includes(query) ||
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
        parentFacebookName: '',
        studentName: '',
        gradeLevel: '',
        status: 'active'
      });
      
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
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
    const activeTeachers = getActiveTeachers();
    
    if (activeTeachers.length === 0) {
      toast.warning('No active teachers available for assignment');
      return;
    }

    const teacherOptions = activeTeachers.map((t, idx) => `${idx + 1}. ${t.name} - ${t.subject}`).join('\n');
    const selection = prompt(`Select a teacher by number:\n${teacherOptions}`);
    
    if (selection === null) return;
    
    const selectedIndex = parseInt(selection) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= activeTeachers.length) {
      toast.error('Invalid selection');
      return;
    }

    const selectedTeacher = activeTeachers[selectedIndex];
    
    setLoading(true);
    try {
      await studentService.assignTeacher(studentId, selectedTeacher._id);
      toast.success(`Successfully assigned ${selectedTeacher.name} to the student`);
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
                    name="parentFacebookName"
                    value={newStudent.parentFacebookName}
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
                    <td>{student.parentFacebookName}</td>
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
