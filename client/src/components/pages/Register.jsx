import React, { useState } from 'react';
import API from '../utils/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'talent' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', form);
      alert('Registration successful!');
      console.log(res.data);
    } catch (err) {
      alert(err.response.data.msg);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <select name="role" onChange={handleChange}>
          <option value="talent">Talent</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white py-2">Register</button>
      </form>
    </div>
  );
};

export default Register;
