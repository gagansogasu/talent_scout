import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users/applications');
            setApplications(response.data);
        } catch (error) {
            setError('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'reviewed':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 py-8">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Applications</h1>

            {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                    You haven't applied to any jobs yet.
                    <div className="mt-4">
                        <Link
                            to="/jobs"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Browse available jobs
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {applications.map((application) => (
                        <div
                            key={application.job.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        <Link
                                            to={`/jobs/${application.job.id}`}
                                            className="text-blue-600 hover:text-blue-500"
                                        >
                                            {application.job.title}
                                        </Link>
                                    </h2>
                                    <p className="text-gray-600 mb-2">{application.job.company}</p>
                                    <div className="flex items-center text-gray-500 space-x-4 mb-4">
                                        <span>{application.job.location}</span>
                                        <span>•</span>
                                        <span>{application.job.type}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                                            application.application.status
                                        )}`}
                                    >
                                        {application.application.status.charAt(0).toUpperCase() +
                                            application.application.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Applied On</h3>
                                        <p className="mt-1">
                                            {new Date(application.application.appliedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Resume</h3>
                                        <a
                                            href={application.application.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 text-blue-600 hover:text-blue-500"
                                        >
                                            View Resume
                                        </a>
                                    </div>
                                </div>

                                {application.application.coverLetter && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-gray-500">Cover Letter</h3>
                                        <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                                            {application.application.coverLetter}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Applications; 