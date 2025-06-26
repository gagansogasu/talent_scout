// src/pages/RecruiterDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecruiterDashboard = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/booking/my-requests', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setBookings(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Booking Requests</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((booking, idx) => (
          <div key={idx} className="border p-4 mb-4 rounded shadow">
            <h3 className="text-xl font-semibold">{booking.talent?.name}</h3>
            <p><strong>Date:</strong> {booking.date}</p>
            <p><strong>Budget:</strong> {booking.budget}</p>
            <p><strong>Message:</strong> {booking.message}</p>
            <p><strong>Status:</strong> <span className="font-bold">{booking.status}</span></p>
          </div>
        ))
      )}
    </div>
  );
};

export default RecruiterDashboard;
