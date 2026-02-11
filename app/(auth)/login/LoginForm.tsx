'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const sendingRef = useRef(false);
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (sendingRef.current) return;
    setError('');
    sendingRef.current = true;
    setLoading(true);
    const res = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    setLoading(false);
    sendingRef.current = false;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'Failed to send code.');
      return;
    }
    setOtpSent(true);
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\s/g, '').trim();
    if (!token || token.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setError('');
    setVerifying(true);
    const res = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: token, next }),
    });
    const json = await res.json().catch(() => ({}));
    setVerifying(false);
    if (!res.ok) {
      setError(json.error ?? 'Verification failed.');
      return;
    }
    if (json.redirect_url) {
      window.location.href = json.redirect_url;
      return;
    }
    setError('Something went wrong. Please try again.');
  }

  if (otpSent) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm'>
          <h1 className='text-xl font-semibold text-[var(--foreground)]'>Check your email</h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below to sign in.
          </p>
          <form onSubmit={handleVerifyCode} className='mt-4 space-y-3'>
            <input
              type='text'
              inputMode='numeric'
              autoComplete='one-time-code'
              placeholder='000000'
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className='w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center text-lg tracking-widest'
            />
            {error && <p className='text-sm text-red-600'>{error}</p>}
            <button
              type='submit'
              disabled={verifying || code.length !== 6}
              className='w-full rounded-lg bg-[var(--primary)] py-2 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50'
            >
              {verifying ? 'Verifying…' : 'Verify and sign in'}
            </button>
          </form>
          <button
            type='button'
            onClick={() => { setOtpSent(false); setCode(''); setError(''); }}
            className='mt-4 w-full rounded-lg border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]'
          >
            Use a different email
          </button>
          <p className='mt-4 text-center text-sm text-[var(--muted)]'>
            <Link href='/' className='hover:underline'>
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
      <div className='w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm'>
        <h1 className='text-xl font-semibold text-[var(--foreground)]'>Log in</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>We’ll send you a 6-digit code by email. No password needed.</p>
        <form onSubmit={handleSendOtp} className='mt-4 space-y-3'>
          <input
            type='email'
            placeholder='you@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2'
          />
          {error && <p className='text-sm text-red-600'>{error}</p>}
          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-lg bg-[var(--primary)] py-2 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50'
          >
            {loading ? 'Sending…' : 'Email me a code'}
          </button>
        </form>
        <p className='mt-4 text-center text-sm text-[var(--muted)]'>
          <Link href='/' className='hover:underline'>
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
