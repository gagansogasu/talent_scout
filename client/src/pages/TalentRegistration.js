import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

const TalentRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    experience: '',
    skills: '',
    hourlyRate: '',
    bio: '',
    resume: null,
    portfolio: '',
    location: '',
    availability: 'full-time',
    profilePic: null
  });

  // Fetch additional user data if needed
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || ''
          }));

          // Try to get additional user data if needed
          if (user.id) {
            const response = await axios.get(`/api/users/${user.id}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setFormData(prev => ({
              ...prev,
              ...(response.data.name && { name: response.data.name }),
              ...(response.data.email && { email: response.data.email }),
              ...(response.data.phone && { phone: response.data.phone }),
              ...(response.data.location && { location: response.data.location })
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Don't show error if it's just failing to fetch additional data
          if (error.response?.status !== 401) {
            console.error('Failed to load additional user data');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [preview, setPreview] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.info('Please log in to register as talent');
      navigate('/login', { state: { from: '/talent/register' } });
    }
  }, [user, loading, navigate]);

  // Set up preview for profile picture
  useEffect(() => {
    if (formData.profilePic) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(formData.profilePic);
    } else {
      setPreview('');
    }
  }, [formData.profilePic]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[0-9+\-\s()]+$/.test(value)) return 'Please enter a valid phone number';
        return '';
      case 'category':
        return value ? '' : 'Please select a category';
      case 'experience':
        return value ? '' : 'Please select your experience level';
      case 'skills':
        return value.trim() ? '' : 'Please enter your skills';
      case 'hourlyRate':
        if (!value) return 'Please enter your hourly rate';
        if (isNaN(value) || value < 0) return 'Please enter a valid amount';
        return '';
      case 'bio':
        return value.trim() ? '' : 'Please tell us about yourself';
      case 'location':
        return value.trim() ? '' : 'Please enter your location';
      case 'resume':
        return value ? '' : 'Resume is required';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      if (field !== 'portfolio' && field !== 'profilePic') {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Only validate if the field has been touched
    if (touched[name] || formData[name]) {
      const error = validateField(name, formData[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    // Handle file inputs
    if (type === 'file') {
      if (name === 'resume') {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      } else if (name === 'profilePic') {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Form submit triggered');

    // Mark all fields as touched for validation
    const newTouched = {};
    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      setIsSubmitting(false);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    // Create FormData for file uploads
    const formDataToSend = new FormData();

    // Append all form data to FormData
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        if (key === 'skills' && typeof formData[key] === 'string') {
          // Convert skills string to array
          const skillsArray = formData[key].split(',').map(skill => skill.trim());
          formDataToSend.append(key, JSON.stringify(skillsArray));
        } else if (key === 'resume' || key === 'profilePic') {
          // Append files directly
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    // Debug: Log FormData keys
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    try {
      console.log('Submitting form data to API...');
      const response = await axios.post('http://localhost:5000/api/talent/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 30000 // 30 second timeout
      });

      console.log('Server response:', response.data);

      if (response.data && response.data.success) {
        toast.success('Talent profile created successfully!');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Failed to create talent profile');
      }
    } catch (err) {
      console.error('Talent registration error:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });

      let errorMessage = 'Failed to create talent profile. Please try again.';

      if (err.response) {
        // Server responded with an error
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || 'Validation error. Please check your input.';
        } else if (err.response.status === 401) {
          errorMessage = 'Please log in to continue';
          navigate('/login');
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else {
        // Something else happened
        errorMessage = err.message || 'An unexpected error occurred';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.heading}>Join Talent Scout</h2>
        <p style={styles.subheading}>Create your profile and start your journey</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.name && styles.inputError) }}
              placeholder="Enter your full name"
            />
            {errors.name && <span style={styles.error}>{errors.name}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Email Address <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              style={{
                ...styles.input,
                backgroundColor: '#f3f4f6',
                cursor: 'not-allowed'
              }}
              placeholder="Your email address"
            />
            <div style={styles.helpText}>
              Contact support to change your email address
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.phone && styles.inputError) }}
              placeholder="Enter your phone number"
            />
            {errors.phone && <span style={styles.error}>{errors.phone}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.location && styles.inputError) }}
              placeholder="Enter your location"
            />
            {errors.location && <span style={styles.error}>{errors.location}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.category && styles.inputError) }}
            >
              <option value="">Select your category</option>
              <option value="Showbizz">🎭 Showbizz</option>
              <option value="Household">🏡 Household</option>
              <option value="Technical">⚙️ Technical</option>
              <option value="Creative">🎨 Creative</option>
              <option value="Professional">👔 Professional</option>
            </select>
            {errors.category && <span style={styles.error}>{errors.category}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Years of Experience *</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.experience && styles.inputError) }}
            >
              <option value="">Select experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
            {errors.experience && <span style={styles.error}>{errors.experience}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Skills *</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.skills && styles.inputError) }}
              placeholder="Enter your skills (comma separated)"
            />
            {errors.skills && <span style={styles.error}>{errors.skills}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Hourly Rate ($) *</label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.hourlyRate && styles.inputError) }}
              placeholder="Enter your hourly rate"
              min="0"
            />
            {errors.hourlyRate && <span style={styles.error}>{errors.hourlyRate}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Availability *</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Bio *</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              style={{ ...styles.textarea, ...(errors.bio && styles.inputError) }}
              placeholder="Tell us about yourself"
              rows="4"
            />
            {errors.bio && <span style={styles.error}>{errors.bio}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Resume/CV *</label>
            <input
              type="file"
              name="resume"
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.resume && styles.inputError) }}
              accept=".pdf,.doc,.docx"
            />
            {errors.resume && <span style={styles.error}>{errors.resume}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Profile Picture</label>
            <input
              type="file"
              name="profilePic"
              onChange={handleChange}
              style={styles.input}
              accept="image/*"
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>Optional: Upload a professional photo</small>
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Talent Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f5f7fa',
    padding: '20px',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '800px',
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#2d3748',
    fontSize: '2rem',
    marginBottom: '10px',
  },
  subheading: {
    textAlign: 'center',
    color: '#718096',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  label: {
    fontSize: '0.9rem',
    color: '#4a5568',
    fontWeight: '500',
  },
  input: {
    padding: '12px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    transition: 'border-color 0.2s',
    '&:focus': {
      outline: 'none',
      borderColor: '#4299e1',
    },
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  textarea: {
    padding: '12px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    resize: 'vertical',
    minHeight: '100px',
  },
  error: {
    color: '#e53e3e',
    fontSize: '0.8rem',
    marginTop: '4px',
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '4px',
    fontStyle: 'italic',
  },
  button: {
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '600',
    background: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      background: '#3182ce',
    },
    '&:disabled': {
      background: '#a0aec0',
      cursor: 'not-allowed',
    },
  },
};

export default TalentRegistration;
