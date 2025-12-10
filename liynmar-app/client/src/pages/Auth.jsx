import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { login } = useAuth();
  
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData({
      ...signInData,
      [name]: value
    });
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
      const result = await login(signInData.email, signInData.password);
      
      if (result.success) {
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showSignIn) {
    return (
      <div className="auth-signin-container">
        <button className="back-to-home-btn" onClick={() => setShowSignIn(false)}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
        
        <div className="signin-card">
          <div className="signin-header">
            <div className="brand-logo">
              <i className="fas fa-graduation-cap"></i>
              <h1>LiynMar</h1>
            </div>
            <h2>Admin & Employee Sign In</h2>
            <p>Enter your credentials to access the dashboard</p>
            <div className="access-notice">
              <i className="fas fa-lock"></i>
              <span>This portal is restricted to Admin and Employees only</span>
            </div>
          </div>

          <form className="signin-form" onSubmit={handleSignInSubmit}>
            <div className="form-group">
              <label htmlFor="signInEmail">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                id="signInEmail"
                name="email"
                value={signInData.email}
                onChange={handleSignInChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signInPassword">
                <i className="fas fa-lock"></i> Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="signInPassword"
                  name="password"
                  value={signInData.password}
                  onChange={handleSignInChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Sign In
                </>
              )}
            </button>
          </form>

          <div className="signin-footer">
            <p className="contact-admin">
              <i className="fas fa-info-circle"></i>
              Need access? Contact the administrator
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <i className="fas fa-graduation-cap"></i>
          <span>LiynMar</span>
        </div>
        <div className="nav-links">
          <a href="#home" className={activeSection === 'home' ? 'active' : ''} onClick={() => setActiveSection('home')}>Home</a>
          <a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={() => setActiveSection('about')}>About</a>
          <a href="#contact" className={activeSection === 'contact' ? 'active' : ''} onClick={() => setActiveSection('contact')}>Contact</a>
          <button className="nav-signin-btn" onClick={() => setShowSignIn(true)}>
            <i className="fas fa-user-lock"></i> Admin Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="brand-highlight">LiynMar</span>
            </h1>
            <p className="hero-subtitle">
              Online Tutorial Services Management Platform
            </p>
            <p className="hero-description">
              Streamlining education management with powerful tools for scheduling, 
              tracking, and organizing online tutoring sessions.
            </p>
            <div className="hero-stats">
              <div className="hero-stat-item">
                <i className="fas fa-users-cog"></i>
                <div>
                  <h3>Teacher Management</h3>
                  <p>Manage tutor profiles and track performance</p>
                </div>
              </div>
              <div className="hero-stat-item">
                <i className="fas fa-book-reader"></i>
                <div>
                  <h3>Student Records</h3>
                  <p>Maintain comprehensive student information</p>
                </div>
              </div>
              <div className="hero-stat-item">
                <i className="fas fa-calendar-week"></i>
                <div>
                  <h3>Booking System</h3>
                  <p>Schedule and manage tutorial sessions</p>
                </div>
              </div>
              <div className="hero-stat-item">
                <i className="fas fa-chart-bar"></i>
                <div>
                  <h3>Analytics Dashboard</h3>
                  <p>Track metrics and generate insights</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <i className="fas fa-chalkboard-teacher"></i>
              <div>
                <h4>Expert Tutors</h4>
                <p>Qualified educators</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <i className="fas fa-calendar-check"></i>
              <div>
                <h4>Flexible Scheduling</h4>
                <p>Book sessions easily</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Track Progress</h4>
                <p>Monitor performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <h2 className="auth-section-title">About LiynMar</h2>
          <div className="about-content">
            <div className="about-card">
              <div className="card-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Our Mission</h3>
              <p>
                To streamline the management of tutoring operations at Liynmar, providing employees 
                with a secure, efficient, and user-friendly platform to manage bookings, track salaries, 
                and monitor teacher-student interactions.
              </p>
            </div>
            <div className="about-card">
              <div className="card-icon">
                <i className="fas fa-cogs"></i>
              </div>
              <h3>What We Offer</h3>
              <p>
                A comprehensive administrative system that allows Liynmar employees to:
              </p>
              <ul>
                <li>Manage and track bookings between students and teachers.</li>
                <li>Monitor teacher attendance and calculate weekly salaries accurately.</li>
                <li>Prevent fraudulent receipts and ensure transparent, secure transactions.</li>
                <li>Reduce time-consuming manual processes, enabling a seamless workflow.</li>
              </ul>
            </div>
            <div className="about-card">
              <div className="card-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Admin Access</h3>
              <p>
                This platform is exclusively for Liynmar employees and administrators. Access is 
                restricted to authorized personnel, ensuring operational security and efficient 
                management of tutoring services.
              </p>
            </div>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <i className="fas fa-users-cog"></i>
              <h4>Teacher Management</h4>
              <p>Manage tutor profiles and track performance</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-book-reader"></i>
              <h4>Student Records</h4>
              <p>Maintain comprehensive student information</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-calendar-week"></i>
              <h4>Booking System</h4>
              <p>Schedule and manage tutorial sessions</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-chart-bar"></i>
              <h4>Analytics Dashboard</h4>
              <p>Track metrics and generate insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <h2 className="auth-section-title">Get In Touch</h2>
          <p className="contact-subtitle">
            Have questions or need assistance? Reach out to us through any of these channels
          </p>
          <div className="contact-methods">
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h3>Email Us</h3>
              <a href="mailto:info@liynmar.com">info@liynmar.com</a>
              <p>We'll respond within 24 hours</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fab fa-facebook"></i>
              </div>
              <h3>Facebook</h3>
              <a href="https://facebook.com/liynmar" target="_blank" rel="noopener noreferrer">
                @LiynMarTutorials
              </a>
              <p>Send us a message</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fab fa-whatsapp"></i>
              </div>
              <h3>WhatsApp</h3>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
                +1 (234) 567-8900
              </a>
              <p>Chat with us directly</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <i className="fas fa-phone"></i>
              </div>
              <h3>Call Us</h3>
              <a href="tel:+1234567890">+1 (234) 567-8900</a>
              <p>Mon-Fri, 9AM-5PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
