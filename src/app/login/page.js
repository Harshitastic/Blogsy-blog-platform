'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { LogIn } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function LoginFormContent() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(loginIdentifier, password);
      showToast('success', 'Welcome back!');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      showToast('error', err.message || 'Login failed');
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="loginIdentifier">Email or Username</label>
          <input
            className="form-input"
            type="text"
            id="loginIdentifier"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            placeholder="e.g. harsha or email@example.com"
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
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          className="btn-primary auth-btn-submit"
          type="submit"
          disabled={submitting}
        >
          <LogIn size={18} />
          <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <h1 className="auth-title text-gradient-style">Welcome Back</h1>
        <p className="auth-subtitle">Login to your account to start writing</p>

        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading form...</div>}>
          <LoginFormContent />
        </Suspense>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link className="auth-link" href="/register">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  );
}
