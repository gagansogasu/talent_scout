import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [application, setApplication] = useState({
        resume: '',
        coverLetter: ''
    });
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState('');

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
            setJob(response.data);
        } catch (error) {
            setError('Failed to fetch job details');
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationChange = (e) => {
        const { name, value } = e.target;
        setApplication(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        setApplying(true);
        setApplyError('');

        try {
            await axios.post(`http://localhost:5000/api/jobs/${id}/apply`, application);
            navigate('/applications');
        } catch (error) {
            setApplyError(error.response?.data?.message || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 py-8">{error}</div>;
    }

    if (!job) {
        return <div className="text-center py-8">Job not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Job Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                        <span className="mr-4">{job.company}</span>
                        <span className="mr-4">•</span>
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {job.type}
                        </span>
                        {job.salary && (
                            <span className="text-gray-600">
                                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Job Details */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                    <p className="text-gray-700 whitespace-pre-wrap mb-6">{job.description}</p>

                    <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                    <ul className="list-disc list-inside text-gray-700 mb-6">
                        {job.requirements.map((requirement, index) => (
                            <li key={index}>{requirement}</li>
                        ))}
                    </ul>
                </div>

                {/* Application Form */}
                {user?.role === 'jobseeker' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Apply for this Position</h2>

                        {applyError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {applyError}
                            </div>
                        )}

                        <form onSubmit={handleApply} className="space-y-6">
                            <div>
                                <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                                    Resume URL
                                </label>
                                <input
                                    type="url"
                                    id="resume"
                                    name="resume"
                                    value={application.resume}
                                    onChange={handleApplicationChange}
                                    required
                                    placeholder="Link to your resume"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Letter
                                </label>
                                <textarea
                                    id="coverLetter"
                                    name="coverLetter"
                                    value={application.coverLetter}
                                    onChange={handleApplicationChange}
                                    required
                                    rows="6"
                                    placeholder="Tell us why you're interested in this position"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={applying}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {applying ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                )}

                {!user && (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-gray-600 mb-4">
                            Please log in to apply for this position
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                        >
                            Log In
                        </button>
                    </div>
                )}

                {user?.role === 'employer' && (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-gray-600">
                            Employers cannot apply for jobs
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetail; 