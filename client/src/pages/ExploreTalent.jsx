import React, { useState } from 'react';
import API from '../utils/api';

const ExploreTalent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await API.post('/talent/search', { query });
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Explore Talents</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. React Developer, Graphic Designer..."
          className="border p-2 flex-1 rounded"
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((talent, i) => (
            <div key={talent._id} className="border rounded-xl p-4 shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold">{talent.name}</h3>
              <p className="text-sm text-gray-600">{talent.category}</p>
              <p className="my-2">{talent.bio}</p>
              <p className="text-sm">📞 {talent.phone}</p>
              <p className="text-sm">⏰ {talent.availability}</p>
              <p className="text-sm text-green-600">Similarity Score: {talent.similarity.toFixed(2)}</p>
              {talent.resume && (
                <a
                  href={`http://localhost:5000/uploads/${talent.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View Resume
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreTalent;
