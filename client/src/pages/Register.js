import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'talent',
    phone: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter both first and last name');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Prepare data for API
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
    };

    setIsLoading(true);
    try {
      const result = await register(userData);
      if (result.success) {
        navigate(formData.role === 'talent' ? '/talent/dashboard' : '/recruiter/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginTop: '5px',
    fontSize: '14px',
  };

  const labelStyle = {
    marginTop: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    marginTop: '20px',
    cursor: 'pointer',
  };

  const errorBoxStyle = {
    backgroundColor: '#fee2e2',
    padding: '10px',
    border: '1px solid #f87171',
    borderRadius: '5px',
    marginBottom: '10px',
    color: '#b91c1c',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Create your account</h2>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          Or <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>sign in</Link> to your existing account
        </p>

        {error && <div style={errorBoxStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>First Name</label>
          <input 
            style={inputStyle} 
            type="text" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            required 
          />

          <label style={labelStyle}>Last Name</label>
          <input 
            style={inputStyle} 
            type="text" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
            required 
          />

          <label style={labelStyle}>Email Address</label>
          <input style={inputStyle} type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label style={labelStyle}>Phone Number</label>
          <input style={inputStyle} type="tel" name="phone" value={formData.phone} onChange={handleChange} required />

          <label style={labelStyle}>I am a</label>
          <select style={inputStyle} name="role" value={formData.role} onChange={handleChange} required>
            <option value="talent">Talent</option>
            <option value="recruiter">Recruiter</option>
          </select>

          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" name="password" value={formData.password} onChange={handleChange} required />

          <label style={labelStyle}>Confirm Password</label>
          <input style={inputStyle} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
