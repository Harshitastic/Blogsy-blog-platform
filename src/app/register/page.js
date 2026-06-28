'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);

    try {
      await register(username, email, password, name);
      showToast('success', 'Welcome! Account created successfully');
    } catch (err) {
      setError(err.message || 'Registration failed');
      showToast('error', err.message || 'Registration failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <h1 className="auth-title text-gradient-style">Get Started</h1>
        <p className="auth-subtitle">Create a new account to join AuraBlog</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name (Optional)</label>
            <input
              className="form-input"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              className="form-input"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="e.g. johndoe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              className="form-input"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Must be at least 6 characters"
              required
            />
          </div>

          <button
            className="btn-primary auth-btn-submit"
            type="submit"
            disabled={submitting}
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link className="auth-link" href="/login">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
