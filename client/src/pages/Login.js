import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                // Navigate based on user role
                const targetPath = result.user.role === 'talent' ? '/talent/dashboard' : '/recruiter/dashboard';
                navigate(targetPath);
            } else {
                setError(result.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ margin: '0 auto', width: '100%', maxWidth: '28rem' }}>
                <h2 style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '1.875rem', fontWeight: '800', color: '#1f2937' }}>
                    Sign in to your account
                </h2>
                <p style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    Or <Link to="/register" style={{ fontWeight: '500', color: '#2563eb', textDecoration: 'none' }}>create a new account</Link>
                </p>
            </div>

            <div style={{ marginTop: '2rem', marginLeft: 'auto', marginRight: 'auto', width: '100%', maxWidth: '28rem' }}>
                <div style={{ backgroundColor: '#fff', padding: '2rem 1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #f87171', padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <svg style={{ height: '20px', width: '20px', color: '#f87171' }} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p style={{ marginLeft: '0.75rem', fontSize: '0.875rem', color: '#b91c1c' }}>{error}</p>
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    marginTop: '0.25rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    marginTop: '0.25rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#111827' }}>
                                <input type="checkbox" name="remember-me" style={{ marginRight: '0.5rem' }} />
                                Remember me
                            </label>
                            <a href="#" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>Forgot your password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '0.5rem 1rem',
                                border: 'none',
                                borderRadius: '0.375rem',
                                backgroundColor: isLoading ? '#60a5fa' : '#2563eb',
                                color: '#fff',
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading && (
                                <svg style={{ marginRight: '0.75rem', height: '20px', width: '20px' }} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
