'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = createClient();

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const baseUrl =
      typeof process.env.NEXT_PUBLIC_APP_URL === 'string' && process.env.NEXT_PUBLIC_APP_URL
        ? process.env.NEXT_PUBLIC_APP_URL
        : window.location.origin;
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (err) {
      const isRateLimit = /rate limit|too many requests/i.test(err.message) || err.message?.includes("rate_limit");
      setError(
        isRateLimit
          ? "Too many sign-in links sent. Please wait an hour before requesting another, or check your inbox for an existing link."
          : err.message
      );
      return;
    }
    setLinkSent(true);
  }

  if (linkSent) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm'>
          <h1 className='text-xl font-semibold text-[var(--foreground)]'>Check your email</h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>
            We sent a sign-in link to <strong>{email}</strong>. Click the link in that email to sign in.
          </p>
          <button
            type='button'
            onClick={() => setLinkSent(false)}
            className='mt-6 w-full rounded-lg border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]'
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
        <p className='mt-2 text-sm text-[var(--muted)]'>We’ll send you a sign-in link by email. No password needed.</p>
        <form onSubmit={handleSendLink} className='mt-4 space-y-3'>
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
            {loading ? 'Sending…' : 'Email me a link'}
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
