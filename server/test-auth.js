const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'talent',
    phone: '1234567890'
};

// 1. Test registration
async function testRegistration() {
    try {
        console.log('Testing registration...');
        const response = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('✅ Registration successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Registration failed:', error.response?.data || error.message);
        throw error;
    }
}

// 2. Test login
async function testLogin() {
    try {
        console.log('\nTesting login...');
        const { email, password } = testUser;
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        console.log('✅ Login successful');
        return response.data;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        throw error;
    }
}

// 3. Test protected route
async function testProtectedRoute(token) {
    try {
        console.log('\nTesting protected route...');
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Protected route access successful');
        console.log('User data:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Protected route access failed:', error.response?.data || error.message);
        throw error;
    }
}

// Run all tests
async function runTests() {
    try {
        // Test registration
        const registerData = await testRegistration();
        
        // Test login
        const loginData = await testLogin();
        
        // Test protected route with the token from login
        if (loginData.token) {
            await testProtectedRoute(loginData.token);
        }
        
        console.log('\n🎉 All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Tests failed:', error);
        process.exit(1);
    }
}

// Run the tests
runTests();
