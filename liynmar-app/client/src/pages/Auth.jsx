import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Debug: Verify component is rendering
  console.log('Auth component rendering...');
  
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    role: '',
    email: '',
    password: ''
  });

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({
      ...signUpData,
      [name]: value
    });
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData({
      ...signInData,
      [name]: value
    });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!signUpData.fullName || !signUpData.role || !signUpData.email || !signUpData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signUpData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Map role to backend format
      const roleMap = {
        'Admin (Owner)': 'admin',
        'Teacher Profile Manager': 'user',
        'Booking Manager': 'user'
      };

      const response = await authService.register({
        username: signUpData.fullName,
        email: signUpData.email,
        password: signUpData.password,
        role: roleMap[signUpData.role] || 'user'
      });

      toast.success('Account created successfully!');
      
      // Auto login after signup
      const loginResponse = await authService.login({
        email: signUpData.email,
        password: signUpData.password
      });
      if (onLoginSuccess) onLoginSuccess();
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!signInData.email || !signInData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // TEMPORARY: Skip API call if backend is down
      try {
        await authService.login({
          email: signInData.email,
          password: signInData.password
        });
        toast.success('Logged in successfully!');
      } catch (error) {
        // If API fails, use temporary bypass
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          toast.warning('Backend offline - using demo mode');
          localStorage.setItem('token', 'demo-token');
          localStorage.setItem('currentUser', JSON.stringify({ email: signInData.email }));
        } else {
          throw error;
        }
      }
      
      if (onLoginSuccess) onLoginSuccess();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel - Illustration */}
      <div className="auth-left-panel" style={{ flex: 1, background: 'linear-gradient(135deg, #8B7355 0%, #6d5a43 100%)' }}>
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="brand-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1>LiynMar</h1>
          </div>
          <div className="auth-illustration">
            <div className="illustration-circle circle-1"></div>
            <div className="illustration-circle circle-2"></div>
            <div className="illustration-circle circle-3"></div>
            <div className="floating-icon icon-1">
              <i className="fas fa-book-open"></i>
            </div>
            <div className="floating-icon icon-2">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="floating-icon icon-3">
              <i className="fas fa-user-graduate"></i>
            </div>
          </div>
          <div className="auth-tagline">
            <h2>Tutorial Management System</h2>
            <p>Empowering educators and students through seamless online learning</p>
          </div>
        </div>
        <div className="wave-decoration"></div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Join us and start managing your tutorials' : 'Sign in to continue to your dashboard'}</p>
          </div>

          {isSignUp ? (
            <form className="auth-form" onSubmit={handleSignUpSubmit}>
              <div className="floating-input">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={signUpData.fullName}
                  onChange={handleSignUpChange}
                  placeholder=""
                  required
                />
                <label htmlFor="fullName">
                  <i className="fas fa-user"></i> Full Name
                </label>
              </div>

              <div className="floating-select">
                <select
                  id="role"
                  name="role"
                  value={signUpData.role}
                  onChange={handleSignUpChange}
                  required
                >
                  <option value="">Select your role</option>
                  <option value="Admin">Admin (Owner)</option>
                  <option value="Teacher Profile Manager">Teacher Profile Manager</option>
                  <option value="Booking Manager">Booking Manager</option>
                </select>
                <label htmlFor="role">
                  <i className="fas fa-briefcase"></i> Role
                </label>
              </div>

              <div className="floating-input">
                <input
                  type="email"
                  id="signUpEmail"
                  name="email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  placeholder=""
                  required
                />
                <label htmlFor="signUpEmail">
                  <i className="fas fa-envelope"></i> Email Address
                </label>
              </div>

              <div className="floating-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="signUpPassword"
                  name="password"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  placeholder=""
                  minLength="6"
                  required
                />
                <label htmlFor="signUpPassword">
                  <i className="fas fa-lock"></i> Password
                </label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignInSubmit}>
              <div className="floating-input">
                <input
                  type="email"
                  id="signInEmail"
                  name="email"
                  value={signInData.email}
                  onChange={handleSignInChange}
                  placeholder=""
                  required
                />
                <label htmlFor="signInEmail">
                  <i className="fas fa-envelope"></i> Email Address
                </label>
              </div>

              <div className="floating-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="signInPassword"
                  name="password"
                  value={signInData.password}
                  onChange={handleSignInChange}
                  placeholder=""
                  required
                />
                <label htmlFor="signInPassword">
                  <i className="fas fa-lock"></i> Password
                </label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <div className="forgot-password">
                <a href="#">Forgot password?</a>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                type="button"
                className="auth-switch-btn"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
