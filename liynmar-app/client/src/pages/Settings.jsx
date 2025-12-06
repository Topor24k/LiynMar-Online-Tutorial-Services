import React, { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/helpers';
import './Settings.css';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    facebook: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Get current user from localStorage
    const user = getLocalStorage('currentUser', {});
    setCurrentUser(user);
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      email: user.email || '',
      address: user.address || '',
      facebook: user.facebook || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setMessage({ type: '', text: '' });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email) {
      setMessage({ type: 'error', text: 'Full name and email are required' });
      return;
    }

    // Password change validation
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required to change password' });
        return;
      }
      
      if (formData.currentPassword !== currentUser.password) {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
        return;
      }
    }

    // Update user data
    const updatedUser = {
      ...currentUser,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      facebook: formData.facebook,
      password: formData.newPassword || currentUser.password
    };

    // Update in users array
    const users = getLocalStorage('users', []);
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      setLocalStorage('users', users);
    }

    // Update current user
    setLocalStorage('currentUser', updatedUser);
    setCurrentUser(updatedUser);

    // Clear password fields
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setMessage({ type: 'success', text: 'Profile updated successfully!' });
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="profile-container">
        {/* Left Section - Profile Card */}
        <div className="profile-left">
          <div className="profile-card">
            <div className="profile-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <h3 className="profile-name">{currentUser.fullName}</h3>
            <p className="profile-role">{currentUser.role}</p>
            
            <div className="profile-social">
              <label htmlFor="facebook">
                <i className="fab fa-facebook"></i> Facebook Link
              </label>
              <input
                type="url"
                id="facebook"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/yourprofile"
                className="social-input"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Profile Form */}
        <div className="profile-right">
          <div className="profile-form-card">
            {message.text && (
              <div className={`message-alert ${message.type}`}>
                <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                <span>{message.text}</span>
              </div>
            )}

            <div className="form-section">
              <h4 className="section-title">Personal Information</h4>
              
              <div className="form-group">
                <label htmlFor="fullName">
                  <i className="fas fa-user"></i> Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i> Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+63 123 456 7890"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i> Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <i className="fas fa-map-marker-alt"></i> Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter your complete address"
                />
              </div>
            </div>

            <div className="form-divider"></div>

            <div className="form-section">
              <h4 className="section-title">Change Password</h4>
              
              <div className="form-group">
                <label htmlFor="currentPassword">
                  <i className="fas fa-lock"></i> Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newPassword">
                    <i className="fas fa-key"></i> New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <i className="fas fa-check-circle"></i> Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    minLength="6"
                  />
                </div>
              </div>

              <p className="password-hint">
                <i className="fas fa-info-circle"></i>
                Leave password fields empty if you don't want to change it
              </p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-update">
                <i className="fas fa-save"></i>
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
