import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import teacherService from '../services/teacherService';
import './Teachers.css';

const Teachers = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive', 'least-booked', 'most-booked', 'deleted'
  const [loading, setLoading] = useState(true);
  const [teachersData, setTeachersData] = useState([]);
  const [deletedTeachers, setDeletedTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    majorSubject: '',
    contactNumber: '',
    email: '',
    facebookAccount: '',
    status: 'active',
    jobExperience: [{
      jobTitle: '',
      companyName: '',
      employmentType: 'Full Time',
      startDate: '',
      endDate: '',
      jobLocation: ''
    }]
  });

  // Fetch teachers from API
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getAllTeachers();
      const allTeachers = response.data || [];
      
      // Separate active and deleted teachers
      const active = allTeachers.filter(t => !t.isDeleted);
      const deleted = allTeachers.filter(t => t.isDeleted);
      
      setTeachersData(active);
      setDeletedTeachers(deleted);
    } catch (error) {
      toast.error('Failed to load teachers');
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort teachers
  const getFilteredAndSortedTeachers = () => {
    let filtered;

    // Choose dataset and apply initial filter based on activeFilter
    switch (activeFilter) {
      case 'deleted':
        filtered = deletedTeachers;
        break;
      case 'active':
        filtered = teachersData.filter(t => t.status === 'active');
        break;
      case 'inactive':
        filtered = teachersData.filter(t => t.status === 'inactive');
        break;
      case 'least-booked':
        filtered = [...teachersData].sort((a, b) => ((a.currentBookingCount || a.totalBookings || 0) - (b.currentBookingCount || b.totalBookings || 0)));
        break;
      case 'most-booked':
        filtered = [...teachersData].sort((a, b) => ((b.currentBookingCount || b.totalBookings || 0) - (a.currentBookingCount || a.totalBookings || 0)));
        break;
      case 'all':
      default:
        filtered = teachersData;
        break;
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        (teacher.majorSubject && teacher.majorSubject.toLowerCase().includes(query)) ||
        (teacher.subject && teacher.subject.toLowerCase().includes(query)) ||
        teacher.email.toLowerCase().includes(query) ||
        (teacher.contactNumber && teacher.contactNumber.toLowerCase().includes(query)) ||
        (teacher.phone && teacher.phone.toLowerCase().includes(query)) ||
        (teacher.status && teacher.status.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredTeachers = getFilteredAndSortedTeachers();

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await teacherService.createTeacher(newTeacher);
      
      toast.success('Teacher added successfully!');
      setShowAddForm(false);
      setNewTeacher({
        name: '',
        majorSubject: '',
        contactNumber: '',
        email: '',
        facebookAccount: '',
        status: 'active',
        jobExperience: [{
          jobTitle: '',
          companyName: '',
          employmentType: 'Full Time',
          startDate: '',
          endDate: '',
          jobLocation: ''
        }]
      });
      
      // Refresh teachers list
      await fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher({
      ...newTeacher,
      [name]: value
    });
  };

  const handleJobExperienceChange = (index, field, value) => {
    const updatedExperience = [...newTeacher.jobExperience];
    updatedExperience[index][field] = value;
    setNewTeacher({
      ...newTeacher,
      jobExperience: updatedExperience
    });
  };

  const addJobExperience = () => {
    setNewTeacher({
      ...newTeacher,
      jobExperience: [...newTeacher.jobExperience, {
        jobTitle: '',
        companyName: '',
        employmentType: 'Full Time',
        startDate: '',
        endDate: '',
        jobLocation: ''
      }]
    });
  };

  const removeJobExperience = (index) => {
    const updatedExperience = newTeacher.jobExperience.filter((_, i) => i !== index);
    setNewTeacher({
      ...newTeacher,
      jobExperience: updatedExperience
    });
  };

  const handleSoftDelete = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    setLoading(true);
    try {
      await teacherService.deleteTeacher(teacherId);
      toast.success('Teacher moved to deleted items');
      await fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (teacherId) => {
    if (!window.confirm('Are you sure you want to restore this teacher?')) {
      return;
    }

    setLoading(true);
    try {
      await teacherService.restoreTeacher(teacherId);
      toast.success('Teacher restored successfully');
      await fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore teacher');
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (teacherId) => {
    if (!window.confirm('Are you sure you want to permanently delete this teacher? This action cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      await teacherService.permanentDeleteTeacher(teacherId);
      toast.success('Teacher permanently deleted');
      await fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to permanently delete teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teachers-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Teachers Management</h2>
          <p className="page-subtitle">Manage and monitor all teaching staff</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            <i className="fas fa-plus"></i> Add Teacher
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="teachers-tabs">
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
          <i className="fas fa-users"></i> Active Teachers
          <span className="tab-count">{teachersData.filter(t => t.status === 'active').length}</span>
        </button>
        <button 
          className={`tab-button ${activeFilter === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveFilter('inactive')}
        >
          <i className="fas fa-user-slash"></i> Inactive Teachers
          <span className="tab-count">{teachersData.filter(t => t.status === 'inactive').length}</span>
        </button>
        <button 
          className={`tab-button ${activeFilter === 'least-booked' ? 'active' : ''}`}
          onClick={() => setActiveFilter('least-booked')}
        >
          <i className="fas fa-arrow-down"></i> Least Booked
        </button>
        <button 
          className={`tab-button ${activeFilter === 'most-booked' ? 'active' : ''}`}
          onClick={() => setActiveFilter('most-booked')}
        >
          <i className="fas fa-arrow-up"></i> Most Booked
        </button>
        <button 
          className={`tab-button ${activeFilter === 'deleted' ? 'active' : ''}`}
          onClick={() => setActiveFilter('deleted')}
        >
          <i className="fas fa-trash-alt"></i> Deleted Teachers
          <span className="tab-count">{deletedTeachers.length}</span>
        </button>
      </div>

      {/* Add Teacher Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Teacher</h3>
              <button className="btn-close" onClick={() => setShowAddForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddTeacher}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newTeacher.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Major Subject *</label>
                  <input
                    type="text"
                    name="majorSubject"
                    value={newTeacher.majorSubject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={newTeacher.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={newTeacher.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Facebook Account</label>
                  <input
                    type="text"
                    name="facebookAccount"
                    value={newTeacher.facebookAccount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={newTeacher.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Job Experience Section */}
              <div className="job-experience-section">
                <div className="section-header">
                  <h4>Job Experience</h4>
                  <button type="button" className="btn-add-experience" onClick={addJobExperience}>
                    <i className="fas fa-plus"></i> Add Experience
                  </button>
                </div>

                {newTeacher.jobExperience.map((exp, index) => (
                  <div key={index} className="experience-card">
                    <div className="experience-header">
                      <h5>Experience {index + 1}</h5>
                      {newTeacher.jobExperience.length > 1 && (
                        <button type="button" className="btn-remove" onClick={() => removeJobExperience(index)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => handleJobExperienceChange(index, 'jobTitle', e.target.value)}
                          placeholder="e.g., Senior Teacher"
                        />
                      </div>
                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) => handleJobExperienceChange(index, 'companyName', e.target.value)}
                          placeholder="e.g., ABC School"
                        />
                      </div>
                      <div className="form-group">
                        <label>Employment Type</label>
                        <select
                          value={exp.employmentType}
                          onChange={(e) => handleJobExperienceChange(index, 'employmentType', e.target.value)}
                        >
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Internship">Internship</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Contractual">Contractual</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => handleJobExperienceChange(index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleJobExperienceChange(index, 'endDate', e.target.value)}
                          placeholder="Leave empty if current"
                        />
                      </div>
                      <div className="form-group">
                        <label>Job Location</label>
                        <input
                          type="text"
                          value={exp.jobLocation}
                          onChange={(e) => handleJobExperienceChange(index, 'jobLocation', e.target.value)}
                          placeholder="e.g., Manila, Philippines"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Teachers List</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Major Subject</th>
                <th>Contact Number</th>
                <th>Email Address</th>
                <th>Total Bookings</th>
                <th>{activeFilter === 'deleted' ? 'Deleted Date' : 'Status'}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <i className="fas fa-spinner fa-spin"></i> Loading teachers...
                  </td>
                </tr>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="teacher-row">
                    <td>
                      <div className="teacher-cell">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=8B7355&color=fff`}
                          alt={teacher.name}
                        />
                        <span>{teacher.name}</span>
                      </div>
                    </td>
                    <td>{teacher.majorSubject || teacher.subject}</td>
                    <td>{teacher.contactNumber || teacher.phone}</td>
                    <td>{teacher.email}</td>
                    <td>
                      <span className="booking-count">{teacher.currentBookingCount || teacher.totalBookings || 0}</span>
                    </td>
                    <td>
                      {activeFilter === 'deleted' ? (
                        <span className="deleted-date">
                          {new Date(teacher.deletedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className={`status-badge ${teacher.status}`}>
                          {teacher.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td>
                      {activeFilter === 'deleted' ? (
                        <>
                          <button
                            className="btn-icon restore-teacher"
                            title="Restore Teacher"
                            onClick={() => handleRestore(teacher._id)}
                          >
                            <i className="fas fa-undo"></i>
                          </button>
                          <button
                            className="btn-icon permanent-delete-teacher"
                            title="Permanently Delete"
                            onClick={() => handlePermanentDelete(teacher._id)}
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-icon view-teacher"
                            title="View Profile"
                            onClick={() => navigate(`/teachers/${teacher._id}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn-icon delete-teacher"
                            title="Delete Teacher"
                            onClick={() => handleSoftDelete(teacher._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No teachers found
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

export default Teachers;
