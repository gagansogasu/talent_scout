// src/pages/TalentProfile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TalentProfile = () => {
  const { id } = useParams(); // Talent ID from URL
  const [talent, setTalent] = useState(null);
  const [form, setForm] = useState({ date: '', budget: '', message: '' });

  useEffect(() => {
    axios.get(`/api/talent/${id}`)
      .then(res => setTalent(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/booking/request', { talentId: id, ...form }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Booking request sent!');
    } catch (error) {
      console.error(error);
      alert('Booking failed');
    }
  };

  if (!talent) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">{talent.name}</h2>
      <p><strong>Category:</strong> {talent.category}</p>
      <p><strong>Bio:</strong> {talent.bio}</p>
      <p><strong>Availability:</strong> {talent.availability}</p>
      <a href={`/uploads/${talent.resume}`} target="_blank" rel="noreferrer" className="text-blue-500">View Resume</a>
      <br />
      <img src={`/uploads/${talent.profilePicture}`} alt="Profile" className="w-32 h-32 object-cover my-3" />

      <h3 className="text-lg font-semibold mt-6">Book This Talent</h3>
      <input
        type="date"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
        className="border p-1 block my-2"
      />
      <input
        type="text"
        placeholder="Budget"
        value={form.budget}
        onChange={e => setForm({ ...form, budget: e.target.value })}
        className="border p-1 block my-2"
      />
      <textarea
        placeholder="Message"
        value={form.message}
        onChange={e => setForm({ ...form, message: e.target.value })}
        className="border p-1 block my-2"
      />
      <button onClick={handleBooking} className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit Booking
      </button>
    </div>
  );
};

export default TalentProfile;
