// src/pages/TalentDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TalentDashboard = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/booking/incoming', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setRequests(res.data))
    .catch(err => console.error(err));
  }, []);

  const handleResponse = (id, status) => {
    const token = localStorage.getItem('token');
    axios.patch(`/api/booking/${id}/respond`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setRequests(prev => prev.map(req =>
        req._id === id ? { ...req, status } : req
      ));
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Incoming Booking Requests</h2>
      {requests.length === 0 ? (
        <p>No booking requests yet.</p>
      ) : (
        requests.map(req => (
          <div key={req._id} className="border p-4 mb-4 rounded shadow">
            <p><strong>Recruiter:</strong> {req.recruiter?.name} ({req.recruiter?.email})</p>
            <p><strong>Date:</strong> {req.date}</p>
            <p><strong>Budget:</strong> {req.budget}</p>
            <p><strong>Message:</strong> {req.message}</p>
            <p><strong>Status:</strong> <span className="font-bold">{req.status}</span></p>

            {req.status === 'Pending' && (
              <div className="mt-2 space-x-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => handleResponse(req._id, 'Accepted')}
                >
                  Accept
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleResponse(req._id, 'Rejected')}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TalentDashboard;
