import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { teacherService } from '../services/teacherService';
import './Teachers.css';

const Teachers = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    subject: '',
    phone: '',
    email: '',
    facebook: '',
    status: 'active'
  });
  
  const { data: teachers, isLoading, error } = useQuery('teachers', teacherService.getAll);

  // Load teachers from localStorage
  const loadTeachers = () => {
    const stored = localStorage.getItem('allTeachers');
    return stored ? JSON.parse(stored) : [];
  };

  const [teachersData, setTeachersData] = useState(loadTeachers());

  // Calculate booking count from localStorage
  const getBookingCount = (teacherId) => {
    const bookings = JSON.parse(localStorage.getItem('teacherBookings') || '{}');
    return bookings[teacherId] ? bookings[teacherId].length : 0;
  };

  // Add booking counts to teachers
  const teachersWithBookings = teachersData.map(teacher => ({
    ...teacher,
    totalBookings: getBookingCount(teacher._id)
  }));

  // Filter and sort teachers
  const getFilteredAndSortedTeachers = () => {
    let filtered = teachersWithBookings;

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        teacher.phone.toLowerCase().includes(query) ||
        teacher.status.toLowerCase().includes(query)
      );
    }

    // Apply status/booking filters
    switch (filterType) {
      case 'active':
        filtered = filtered.filter(t => t.status === 'active');
        break;
      case 'inactive':
        filtered = filtered.filter(t => t.status === 'inactive');
        break;
      case 'most-booked':
        filtered = [...filtered].sort((a, b) => b.totalBookings - a.totalBookings);
        break;
      case 'least-booked':
        filtered = [...filtered].sort((a, b) => a.totalBookings - b.totalBookings);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredTeachers = getFilteredAndSortedTeachers();

  const handleAddTeacher = (e) => {
    e.preventDefault();
    
    const teacher = {
      _id: Date.now().toString(),
      ...newTeacher,
      daysAvailable: [],
      usualTime: '',
      totalBookings: 0
    };

    const updatedTeachers = [...teachersData, teacher];
    setTeachersData(updatedTeachers);
    localStorage.setItem('allTeachers', JSON.stringify(updatedTeachers));

    setNewTeacher({
      name: '',
      subject: '',
      phone: '',
      email: '',
      facebook: '',
      status: 'active'
    });
    setShowAddForm(false);
    alert('Teacher added successfully!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher({
      ...newTeacher,
      [name]: value
    });
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
                    name="subject"
                    value={newTeacher.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={newTeacher.phone}
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
                    name="facebook"
                    value={newTeacher.facebook}
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
          <h3 className="card-title">All Teachers</h3>
          <div className="filter-controls">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="all">All Teachers</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="most-booked">Most Booked</option>
              <option value="least-booked">Least Booked</option>
            </select>
          </div>
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
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
                    <td>{teacher.subject}</td>
                    <td>{teacher.phone}</td>
                    <td>{teacher.email}</td>
                    <td>
                      <span className="booking-count">{teacher.totalBookings}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${teacher.status}`}>
                        {teacher.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon view-teacher"
                        title="View Profile"
                        onClick={() => navigate(`/teachers/${teacher._id}`)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
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
