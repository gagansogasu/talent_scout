import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        console.log('Checking auth with token:', token ? 'Token exists' : 'No token');
        
        if (!token) {
            console.log('No token found, user is not authenticated');
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching user data from /api/auth/me');
            const response = await axios.get('http://localhost:5000/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            console.log('User data from /api/auth/me:', response.data);
            
            if (response.data && response.data.user) {
                const userData = response.data.user;
                const user = {
                    id: userData._id || userData.id,
                    email: userData.email,
                    name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
                    role: userData.role || 'talent', // Default to 'talent' if role is missing
                    phone: userData.phone || '',
                };
                
                console.log('Setting user data from checkAuth:', user);
                setUser(user);
            } else {
                console.error('Invalid user data format from /api/auth/me:', response.data);
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login with email:', email);
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: email.toLowerCase().trim(),
                password: password,
            });
            
            console.log('Login response:', response.data);
            
            if (response.data && response.data.token) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                
                // Ensure we have all required user fields with fallbacks
                const userData = {
                    id: user.id,
                    email: user.email,
                    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
                    role: user.role || 'talent', // Default to 'talent' if role is missing
                    phone: user.phone || '',
                };
                
                console.log('Setting user data after login:', userData);
                setUser(userData);
                return { success: true, user: userData };
            } else {
                const error = new Error('Invalid response from server');
                error.response = response;
                throw error;
            }
        } catch (error) {
            console.error('Login API error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to login. Please check your credentials.';
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            // Ensure role is set to 'talent' by default if not provided
            const registrationData = {
                ...userData,
                role: userData.role || 'talent', // Default to 'talent' if not specified
                name: userData.name || `${userData.firstName} ${userData.lastName}`.trim()
            };
            
            console.log('Registering user with data:', registrationData);
            
            const response = await axios.post('http://localhost:5000/api/auth/register', registrationData);
            
            if (response.data && response.data.token) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                
                // Ensure we have all required user fields
                const userData = {
                    id: user.id,
                    email: user.email,
                    name: user.name || `${user.firstName} ${user.lastName}`.trim(),
                    role: user.role || 'talent', // Ensure role is set
                    phone: user.phone || '',
                };
                
                setUser(userData);
                return { success: true, user: userData };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Registration API error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to register. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 