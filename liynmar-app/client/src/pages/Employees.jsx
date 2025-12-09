import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import './Employees.css';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    password: '',
    role: 'teacher_manager'
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      return;
    }
    fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await authService.getAllUsers();
      const allUsers = response.data || [];
      
      // Filter out admins and current user, separate deleted employees
      const active = allUsers.filter(u => u.role !== 'admin' && !u.isDeleted);
      const deleted = allUsers.filter(u => u.role !== 'admin' && u.isDeleted);
      
      setEmployees(active);
      setDeletedEmployees(deleted);
    } catch (error) {
      toast.error('Failed to load employees');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!newEmployee.fullName || !newEmployee.email || !newEmployee.contactNumber || !newEmployee.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await authService.register({
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        contactNumber: newEmployee.contactNumber,
        password: newEmployee.password,
        role: newEmployee.role
      });
      
      toast.success('Employee created successfully');
      setShowAddModal(false);
      setNewEmployee({
        fullName: '',
        email: '',
        contactNumber: '',
        password: '',
        role: 'teacher_manager'
      });
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create employee');
      console.error('Error creating employee:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await authService.deleteUser(employeeId);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
      console.error('Error deleting employee:', error);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'teacher_manager':
        return 'role-badge teacher-manager';
      case 'booking_manager':
        return 'role-badge booking-manager';
      default:
        return 'role-badge';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin (Owner)';
      case 'teacher_manager':
        return 'Teacher Manager';
      case 'booking_manager':
        return 'Booking Manager';
      default:
        return role;
    }
  };

  const getFilteredEmployees = () => {
    let filtered;
    
    switch (activeFilter) {
      case 'teacher_manager':
        filtered = employees.filter(e => e.role === 'teacher_manager');
        break;
      case 'booking_manager':
        filtered = employees.filter(e => e.role === 'booking_manager');
        break;
      case 'deleted':
        filtered = deletedEmployees;
        break;
      case 'all':
      default:
        filtered = employees;
        break;
    }
    
    return filtered;
  };

  const filteredEmployees = getFilteredEmployees();

  if (user?.role !== 'admin') {
    return (
      <div className="employees-page">
        <div className="access-denied">
          <i className="fas fa-lock"></i>
          <h2>Access Denied</h2>
          <p>Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Employee Management</h2>
          <p className="page-subtitle">Manage employee accounts and permissions</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-user-plus"></i> Add Employee
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="employees-tabs">
        <button
          className={`tab-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <i className="fas fa-list"></i> All
        </button>
        <button
          className={`tab-button ${activeFilter === 'teacher_manager' ? 'active' : ''}`}
          onClick={() => setActiveFilter('teacher_manager')}
        >
          <i className="fas fa-chalkboard-teacher"></i> Teacher Manager
          <span className="tab-count">{employees.filter(e => e.role === 'teacher_manager').length}</span>
        </button>
        <button
          className={`tab-button ${activeFilter === 'booking_manager' ? 'active' : ''}`}
          onClick={() => setActiveFilter('booking_manager')}
        >
          <i className="fas fa-calendar-check"></i> Booking Manager
          <span className="tab-count">{employees.filter(e => e.role === 'booking_manager').length}</span>
        </button>
        <button
          className={`tab-button ${activeFilter === 'deleted' ? 'active' : ''}`}
          onClick={() => setActiveFilter('deleted')}
        >
          <i className="fas fa-trash-alt"></i> Deleted Accounts
          <span className="tab-count">{deletedEmployees.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading employees...</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Employees List</h3>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact Number</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <div className="employee-cell">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.fullName)}&background=8B7355&color=fff`}
                            alt={employee.fullName}
                          />
                          <span>{employee.fullName}</span>
                        </div>
                      </td>
                      <td>{employee.contactNumber}</td>
                      <td>{employee.email}</td>
                      <td>
                        <span className={getRoleBadgeClass(employee.role)}>
                          {getRoleLabel(employee.role)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-icon view-employee"
                          title="View Profile"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-icon delete-employee"
                          onClick={() => handleDeleteEmployee(employee._id)}
                          title="Delete Employee"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-plus"></i>
                Add New Employee
              </h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="employee-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newEmployee.fullName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  value={newEmployee.contactNumber}
                  onChange={(e) => setNewEmployee({ ...newEmployee, contactNumber: e.target.value })}
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  placeholder="Enter password"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  required
                >
                  <option value="teacher_manager">Teacher Manager</option>
                  <option value="booking_manager">Booking Manager</option>
                </select>
                <div className="role-description">
                  {newEmployee.role === 'teacher_manager' && (
                    <p><i className="fas fa-info-circle"></i> Can only access Teachers section</p>
                  )}
                  {newEmployee.role === 'booking_manager' && (
                    <p><i className="fas fa-info-circle"></i> Can access Bookings and Students sections</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-user-plus"></i>
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
