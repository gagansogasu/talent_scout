import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NewNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Base styles
    const baseStyles = {
        nav: {
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            padding: '0 2rem',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
        },
        logo: {
            textDecoration: 'none',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #3498db, #9b59b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            transition: 'all 0.3s ease'
        },
        navLinks: {
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            '@media (max-width: 768px)': {
                display: 'none'
            }
        },
        navLink: {
            color: '#333',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.3s ease'
        },
        navLinkHover: {
            color: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)'
        },
        button: {
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        buttonHover: {
            backgroundColor: '#2980b9',
            transform: 'translateY(-2px)'
        },
        menuButton: {
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#333',
            '@media (max-width: 768px)': {
                display: 'block'
            }
        },
        mobileMenu: {
            display: 'none',
            position: 'absolute',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '1rem',
            flexDirection: 'column',
            gap: '1rem'
        }
    };

    // Merge base styles with conditional styles
    const styles = {
        ...baseStyles,
        mobileMenu: {
            ...baseStyles.mobileMenu,
            display: isMenuOpen && window.innerWidth <= 768 ? 'flex' : 'none'
        },
        navLink: (isHovered = false) => ({
            ...baseStyles.navLink,
            ...(isHovered && baseStyles.navLinkHover)
        }),
        button: (isHovered = false) => ({
            ...baseStyles.button,
            ...(isHovered && baseStyles.buttonHover)
        })
    };

    // Handle hover state for nav links
    const [hoveredLink, setHoveredLink] = useState(null);
    const [hoveredButton, setHoveredButton] = useState(false);

    return (
        <>
            <nav style={styles.nav}>
                <Link to="/" style={styles.logo}>
                    Talent Scout
                </Link>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={styles.menuButton}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>


                <div style={styles.navLinks}>
                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                style={styles.navLink(hoveredLink === 'dashboard')}
                                onMouseEnter={() => setHoveredLink('dashboard')}
                                onMouseLeave={() => setHoveredLink(null)}
                            >
                                Dashboard
                            </Link>
                            {user.role === 'talent' ? (
                                <Link
                                    to="/join-talent"
                                    style={styles.navLink(hoveredLink === 'join')}
                                    onMouseEnter={() => setHoveredLink('join')}
                                    onMouseLeave={() => setHoveredLink(null)}
                                >
                                    Join as Talent
                                </Link>
                            ) : (
                                <Link
                                    to="/explore-talent"
                                    style={styles.navLink(hoveredLink === 'explore')}
                                    onMouseEnter={() => setHoveredLink('explore')}
                                    onMouseLeave={() => setHoveredLink(null)}
                                >
                                    Explore Talent
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                style={styles.button(hoveredButton)}
                                onMouseEnter={() => setHoveredButton(true)}
                                onMouseLeave={() => setHoveredButton(false)}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={styles.navLink(hoveredLink === 'login')}
                                onMouseEnter={() => setHoveredLink('login')}
                                onMouseLeave={() => setHoveredLink(null)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                style={styles.button(hoveredButton)}
                                onMouseEnter={() => setHoveredButton(true)}
                                onMouseLeave={() => setHoveredButton(false)}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Mobile Menu */}
            <div style={styles.mobileMenu}>
                {user ? (
                    <>
                        <Link
                            to="/dashboard"
                            style={styles.navLink(false)}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        {user.role === 'talent' ? (
                            <Link
                                to="/join-talent"
                                style={styles.navLink(false)}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Join as Talent
                            </Link>
                        ) : (
                            <Link
                                to="/explore-talent"
                                style={styles.navLink(false)}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Explore Talent
                            </Link>
                        )}
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            style={styles.button(false)}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            style={styles.navLink(false)}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            style={styles.button(false)}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </>
    );
};

export default NewNavbar;
