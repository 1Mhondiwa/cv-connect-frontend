import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/whyus', label: 'Why Us' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
  { to: '/associate-request', label: 'Become Associate' }
];
const authLinks = [
  { to: '/register', label: 'Register' },
  { to: '/login', label: 'Login' }
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: scrolled
          ? '#fff'
          : 'rgba(0,0,0,0.18)',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
        backdropFilter: 'blur(2px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        transition: 'background 0.25s, box-shadow 0.25s'
      }}
    >
      <nav className="container d-flex align-items-center justify-content-between py-2" style={{ maxWidth: 1200 }}>
        <Link to="/" className="logo d-flex align-items-center" style={{ textDecoration: 'none' }}>
          <img 
            src="/assets/img/cv-connect_logo.png" 
            alt="CV-Connect Logo" 
            style={{
              height: 40,
              width: 40,
              marginRight: 12,
              borderRadius: '50%'
            }}
          />
          <h1
            className="sitename"
            style={{
              color: scrolled ? '#fd680e' : '#fff',
              fontWeight: 600,
              fontSize: 32,
              margin: 0,
              letterSpacing: 1,
              transition: 'color 0.25s'
            }}
          >
            CV‑Connect
          </h1>
        </Link>
        {/* Desktop Nav */}
        <ul className="d-none d-md-flex align-items-center mb-0" style={{ listStyle: 'none', gap: 18, fontSize: 17 }}>
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end || false}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-cta active' : 'nav-link nav-cta'
                }
                style={({ isActive }) => ({
                  color: scrolled
                    ? isActive ? '#fd680e' : '#444'
                    : isActive ? '#fd680e' : '#fff',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  padding: '8px 22px',
                  borderRadius: 30,
                  background: isActive
                    ? 'rgba(253,104,14,0.10)'
                    : scrolled
                      ? 'rgba(253,104,14,0.06)'
                      : 'rgba(255,255,255,0.08)',
                  border: isActive
                    ? '2px solid #fd680e'
                    : '2px solid transparent',
                  marginRight: 2,
                  marginLeft: 2,
                  whiteSpace: 'nowrap',
                  fontSize: 16,
                  lineHeight: 1.2,
                  transition: 'transform 0.18s, box-shadow 0.18s, color 0.18s, background 0.18s, border 0.18s'
                })}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {/* Spacer */}
          <li style={{ width: 24 }}></li>
          {authLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-cta active' : 'nav-link nav-cta'
                }
                style={({ isActive }) => ({
                  color: isActive
                    ? '#fff'
                    : scrolled
                      ? '#fd680e'
                      : '#fd680e',
                  fontWeight: 700,
                  textDecoration: 'none',
                  padding: '8px 28px',
                  borderRadius: 30,
                  background: isActive
                    ? '#fd680e'
                    : 'rgba(253,104,14,0.10)',
                  border: '2px solid #fd680e',
                  marginRight: 2,
                  marginLeft: 2,
                  whiteSpace: 'nowrap',
                  fontSize: 16,
                  lineHeight: 1.2,
                  transition: 'transform 0.18s, box-shadow 0.18s, color 0.18s, background 0.18s, border 0.18s'
                })}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        {/* Hamburger for mobile */}
        <button
          className="d-md-none"
          style={{
            background: 'none',
            border: 'none',
            color: scrolled ? '#fd680e' : '#fff',
            fontSize: 32,
            cursor: 'pointer'
          }}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <i className={open ? 'bi bi-x' : 'bi bi-list'}></i>
        </button>
      </nav>
      {/* Mobile Nav */}
      {open && (
        <div
          className="d-md-none"
          style={{
            background: 'rgba(0,0,0,0.95)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center' }}>
            {[...navLinks, ...authLinks].map((link) => (
              <li key={link.to} style={{ margin: '18px 0' }}>
                <NavLink
                  to={link.to}
                  end={link.end || false}
                  className="nav-link nav-cta"
                  style={{
                    color: '#fff',
                    fontSize: 24,
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '12px 36px',
                    borderRadius: 30,
                    background: 'rgba(253,104,14,0.10)',
                    border: '2px solid #fd680e',
                    margin: 2,
                    transition: 'transform 0.18s, box-shadow 0.18s, color 0.18s, background 0.18s, border 0.18s'
                  }}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Button animation styles */}
      <style>{`
        .nav-cta:hover, .nav-cta:focus {
          transform: scale(1.07);
          box-shadow: 0 4px 24px rgba(253,104,14,0.18);
          z-index: 2;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
