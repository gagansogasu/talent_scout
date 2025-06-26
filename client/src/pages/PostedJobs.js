import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PostedJobs = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPostedJobs();
    }, []);

    const fetchPostedJobs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobs/posted', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setJobs(response.data);
        } catch (error) {
            setError('Failed to fetch posted jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job posting?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setJobs(jobs.filter(job => job._id !== jobId));
        } catch (error) {
            setError('Failed to delete job posting');
        }
    };

    if (!user) {
        return <div className="text-center py-8">Please log in to view your posted jobs.</div>;
    }

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 py-8">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Posted Jobs</h1>
                <Link
                    to="/post-job"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Post New Job
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                    You haven't posted any jobs yet.
                    <div className="mt-4">
                        <Link
                            to="/post-job"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Post your first job
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {jobs.map((job) => (
                        <div
                            key={job._id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        <Link
                                            to={`/jobs/${job._id}`}
                                            className="text-blue-600 hover:text-blue-500"
                                        >
                                            {job.title}
                                        </Link>
                                    </h2>
                                    <p className="text-gray-600 mb-2">{job.company}</p>
                                    <div className="flex items-center text-gray-500 space-x-4 mb-4">
                                        <span>{job.location}</span>
                                        <span>•</span>
                                        <span>{job.type}</span>
                                        <span>•</span>
                                        <span>{job.applications?.length || 0} applications</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to={`/jobs/${job._id}/edit`}
                                        className="text-blue-600 hover:text-blue-500"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteJob(job._id)}
                                        className="text-red-600 hover:text-red-500"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm text-gray-500">
                                            Posted on {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/jobs/${job._id}/applications`}
                                        className="text-blue-600 hover:text-blue-500"
                                    >
                                        View Applications
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostedJobs; 