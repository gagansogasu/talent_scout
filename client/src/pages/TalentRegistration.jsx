import React, { useState } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

const TalentRegistration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    category: '',
    availability: '',
  });
  const [resume, setResume] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });
    if (resume) formData.append('resume', resume);
    if (profilePic) formData.append('profilePicture', profilePic);

    try {
      await API.post('/talent/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Profile created successfully!');
      navigate('/talent-profile');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Talent Registration</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" encType="multipart/form-data">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="border p-2 rounded" />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required className="border p-2 rounded" />
        <textarea name="bio" placeholder="Short Bio" onChange={handleChange} required className="border p-2 rounded" />
        <input type="text" name="category" placeholder="Category (e.g. Web Developer)" onChange={handleChange} required className="border p-2 rounded" />
        <input type="text" name="availability" placeholder="Availability (e.g. Weekends)" onChange={handleChange} required className="border p-2 rounded" />
        <input type="file" onChange={(e) => setResume(e.target.files[0])} accept=".pdf,.doc,.docx" className="border p-2 rounded" />
        <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} accept="image/*" className="border p-2 rounded" />
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Submit</button>
      </form>
    </div>
  );
};

export default TalentRegistration;
