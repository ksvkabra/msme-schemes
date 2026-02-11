'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  GATEWAY_QUESTION,
  STARTUP_QUESTIONS,
  MSME_QUESTIONS,
  STEP2_QUESTIONS,
  getOptionLabel,
  type EntityType,
  type StartupFormData,
  type MSMEFormData,
} from '@/lib/eligibility/questions';
import { deriveStartupProfile, deriveMSMEProfile } from '@/lib/eligibility/derive-profile';
import type { Scheme } from '@/lib/db/types';

type Phase = 'email' | 'gateway' | 'startup' | 'msme' | 'summary' | 'results' | 'step2' | 'verify';

type MatchResult = {
  scheme: Scheme;
  score: number;
  missingRequirements: string[];
};

const STARTUP_LEN = STARTUP_QUESTIONS.length;
const MSME_LEN = MSME_QUESTIONS.length;
const STEP2_LEN = STEP2_QUESTIONS.length;

export function EligibilityForm() {
  const [phase, setPhase] = useState<Phase>('email');
  const [entityType, setEntityType] = useState<EntityType | null>(null);
  const [flowStepIndex, setFlowStepIndex] = useState(0);
  const [step2Index, setStep2Index] = useState(0);
  const [email, setEmail] = useState('');
  const [startupData, setStartupData] = useState<StartupFormData>({});
  const [msmeData, setMsmeData] = useState<MSMEFormData>({});
  const [step2Data, setStep2Data] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Verify step: send OTP only when user clicks (saves rate limit)
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const sendOtpRef = useRef(false);
  const router = useRouter();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user?.email && !email) setEmail(user.email);
      if (user && phase === 'email') setPhase('gateway');
    });
  }, []);

  const flowQuestions = entityType === 'startup' ? STARTUP_QUESTIONS : MSME_QUESTIONS;
  const flowLen = entityType === 'startup' ? STARTUP_LEN : MSME_LEN;
  const flowData = entityType === 'startup' ? startupData : msmeData;
  const currentFlowStep = flowQuestions[flowStepIndex];

  function setFlowData(key: string, val: string) {
    if (entityType === 'startup') {
      setStartupData((prev) => ({ ...prev, [key]: val }));
    } else {
      setMsmeData((prev) => ({ ...prev, [key]: val }));
    }
  }

  function getDerivedProfile() {
    if (entityType === 'startup') return deriveStartupProfile(startupData);
    return deriveMSMEProfile(msmeData);
  }

  // ——— Email ———
  function handleEmailNext(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;
    setPhase('gateway');
  }

  // ——— Gateway: Startup vs MSME ———
  function handleGatewaySelect(val: string) {
    if (val !== 'startup' && val !== 'msme') return;
    setEntityType(val);
    setFlowStepIndex(0);
    setPhase(val);
  }

  // ——— Startup / MSME flow (single-select only) ———
  const flowValue = currentFlowStep ? flowData[currentFlowStep.key] : undefined;

  function handleFlowSelect(val: string) {
    if (!currentFlowStep) return;
    setFlowData(currentFlowStep.key, val);
    if (flowStepIndex < flowLen - 1) {
      setFlowStepIndex((i) => i + 1);
    } else {
      fetchMatchesAndShowResults();
    }
  }

  async function fetchMatchesAndShowResults() {
    setSubmitting(true);
    setError('');
    // Store responses by email as soon as we reach the last question (before login)
    const profile = getDerivedProfile();
    const saveRes = await fetch('/api/eligibility/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        entityType,
        startup: entityType === 'startup' ? startupData : undefined,
        msme: entityType === 'msme' ? msmeData : undefined,
        derived: {
          business_type: profile.business_type,
          industry: profile.industry,
          state: profile.state,
          turnover_range: profile.turnover_range,
          company_age: profile.company_age,
          funding_goal: profile.funding_goal,
        },
      }),
    });
    if (!saveRes.ok) {
      setSubmitting(false);
      const j = await saveRes.json().catch(() => ({}));
      setError(j.error ?? 'Failed to save. Please try again.');
      return;
    }
    const res = await fetch('/api/eligibility/preview-matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType,
        startup: entityType === 'startup' ? startupData : undefined,
        msme: entityType === 'msme' ? msmeData : undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Could not load matches. Please try again.');
      return;
    }
    const json = await res.json();
    setMatches(json.matches ?? []);
    setPhase('summary');
  }

  // ——— Results: Save or Continue with full questionnaire ———
  async function handleSaveAndEmail() {
    setSubmitting(true);
    setError('');
    const profile = getDerivedProfile();
    const res = await fetch('/api/eligibility/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        entityType,
        startup: entityType === 'startup' ? startupData : undefined,
        msme: entityType === 'msme' ? msmeData : undefined,
        derived: {
          business_type: profile.business_type,
          industry: profile.industry,
          state: profile.state,
          turnover_range: profile.turnover_range,
          company_age: profile.company_age,
          funding_goal: profile.funding_goal,
        },
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Failed to save. Please try again.');
      return;
    }
    setPhase('verify');
  }

  function handleContinueFullQuestionnaire() {
    setPhase('step2');
    setStep2Index(0);
  }

  /** Logged-in: save profile to business_profiles and go to dashboard (single eligibility flow). */
  async function handleSaveAndGoToDashboard() {
    if (!entityType) return;
    setSubmitting(true);
    setError('');
    const profile = getDerivedProfile();
    const res = await fetch('/api/eligibility/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType,
        startup: entityType === 'startup' ? startupData : undefined,
        msme: entityType === 'msme' ? msmeData : undefined,
        derived: {
          business_type: profile.business_type,
          industry: profile.industry,
          state: profile.state,
          turnover_range: profile.turnover_range,
          company_age: profile.company_age,
          funding_goal: profile.funding_goal,
        },
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Failed to save. Please try again.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  // ——— Step 2: extended questions ———
  const currentStep2 = STEP2_QUESTIONS[step2Index];
  const step2Value = currentStep2 ? step2Data[currentStep2.key] : undefined;

  function handleStep2Select(val: string) {
    if (!currentStep2) return;
    setStep2Data((prev) => ({ ...prev, [currentStep2.key]: val }));
    if (step2Index < STEP2_LEN - 1) {
      setStep2Index((i) => i + 1);
    } else {
      submitWithStep2();
    }
  }

  async function submitWithStep2() {
    setSubmitting(true);
    setError('');
    const profile = getDerivedProfile();
    const res = await fetch('/api/eligibility/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        entityType,
        startup: entityType === 'startup' ? startupData : undefined,
        msme: entityType === 'msme' ? msmeData : undefined,
        step2: step2Data,
        derived: {
          business_type: profile.business_type,
          industry: profile.industry,
          state: profile.state,
          turnover_range: profile.turnover_range,
          company_age: profile.company_age,
          funding_goal: profile.funding_goal,
        },
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Failed to save. Please try again.');
      return;
    }
    setPhase('verify');
  }

  // ——— Verify: send OTP via our API (Resend), then verify and redirect to dashboard ———
  async function handleSendVerificationCode(e: React.FormEvent) {
    e.preventDefault();
    if (sendOtpRef.current) return;
    setError('');
    sendOtpRef.current = true;
    setSendOtpLoading(true);
    const res = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    setSendOtpLoading(false);
    sendOtpRef.current = false;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'Failed to send code.');
      return;
    }
    setVerificationCodeSent(true);
  }

  async function handleVerifyCodeAndContinue(e: React.FormEvent) {
    e.preventDefault();
    const token = verifyCode.replace(/\s/g, '').trim();
    if (!token || token.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setError('');
    setVerifying(true);
    const res = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: token, next: '/dashboard' }),
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

  // ——— Verify phase UI ———
  if (phase === 'verify') {
    if (!verificationCodeSent) {
      return (
        <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
          <div className='w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm'>
            <h1 className='text-xl font-semibold text-[var(--foreground)]'>Verify your email</h1>
            <p className='mt-3 text-sm text-[var(--muted)]'>
              We&apos;ve saved your profile for <strong>{email}</strong>. To see your matched schemes, we need to verify your email. Click
              below to receive a one-time code.
            </p>
            <form onSubmit={handleSendVerificationCode} className='mt-6 space-y-3'>
              <button
                type='submit'
                disabled={sendOtpLoading}
                className='w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50'
              >
                {sendOtpLoading ? 'Sending…' : 'Send verification code'}
              </button>
              {error && <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>}
            </form>
            <div className='mt-6 flex flex-col gap-3'>
              <Link
                href='/'
                className='w-full rounded-lg border border-[var(--border)] py-2.5 text-center text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]'
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm'>
          <h1 className='text-xl font-semibold text-[var(--foreground)]'>Check your email</h1>
          <p className='mt-3 text-sm text-[var(--muted)]'>
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below to see your matched schemes.
          </p>
          <form onSubmit={handleVerifyCodeAndContinue} className='mt-6 space-y-3'>
            <input
              type='text'
              inputMode='numeric'
              autoComplete='one-time-code'
              placeholder='000000'
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className='w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-center text-lg tracking-widest'
            />
            {error && <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>}
            <button
              type='submit'
              disabled={verifying || verifyCode.length !== 6}
              className='w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50'
            >
              {verifying ? 'Verifying…' : 'Verify and see schemes'}
            </button>
          </form>
          <button
            type='button'
            onClick={() => {
              setVerificationCodeSent(false);
              setVerifyCode('');
              setError('');
            }}
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

  // ——— Email step ———
  if (phase === 'email') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm'>
          <p className='text-sm font-medium text-[var(--muted)]'>Step 1</p>
          <h1 className='mt-2 text-xl font-semibold text-[var(--foreground)]'>Check your eligibility</h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>Enter your email to continue.</p>
          <form onSubmit={handleEmailNext} className='mt-6 space-y-3'>
            <input
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5'
            />
            {error && <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>}
            <button
              type='submit'
              className='w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90'
            >
              Continue
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

  // ——— Gateway ———
  if (phase === 'gateway') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm'>
          <p className='text-sm font-medium text-[var(--muted)]'>Step 2 — Entity classification</p>
          <h1 className='mt-2 text-xl font-semibold text-[var(--foreground)]'>{GATEWAY_QUESTION.title}</h1>
          {GATEWAY_QUESTION.subtitle && <p className='mt-1 text-sm text-[var(--muted)]'>{GATEWAY_QUESTION.subtitle}</p>}
          <ul className='mt-6 grid gap-3'>
            {GATEWAY_QUESTION.options.map((opt) => (
              <li key={opt.value}>
                <button
                  type='button'
                  onClick={() => handleGatewaySelect(opt.value)}
                  className='w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50'
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type='button'
            onClick={() => setPhase('email')}
            className='mt-6 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]'
          >
            ← Back
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

  // ——— Summary: all selections + one primary CTA to see schemes by logging in ———
  if (phase === 'summary') {
    const flowLabel = entityType === 'startup' ? 'Startup' : 'MSME';
    const summaryRows: { title: string; label: string }[] = [
      { title: GATEWAY_QUESTION.title, label: getOptionLabel(GATEWAY_QUESTION, entityType ?? '') },
    ];
    flowQuestions.forEach((q) => {
      const val = flowData[q.key];
      if (val != null && val !== '') {
        const label = typeof val === 'string' ? getOptionLabel(q, val) : Array.isArray(val) ? val.map((v) => getOptionLabel(q, v)).join(', ') : String(val);
        summaryRows.push({ title: q.title, label });
      }
    });
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm'>
          <h1 className='text-xl font-semibold text-[var(--foreground)]'>Summary of your selections</h1>
          <p className='mt-1 text-sm text-[var(--muted)]'>
            Review your <strong>{flowLabel}</strong> questionnaire answers below.
          </p>
          <ul className='mt-6 max-h-72 space-y-3 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4'>
            {summaryRows.map((row, i) => (
              <li key={i} className='flex flex-col gap-0.5 text-sm'>
                <span className='font-medium text-[var(--muted)]'>{row.title}</span>
                <span className='text-[var(--foreground)]'>{row.label}</span>
              </li>
            ))}
          </ul>
          {matches.length > 0 && (
            <p className='mt-4 text-sm text-[var(--muted)]'>
              We&apos;ve found {matches.length} scheme{matches.length !== 1 ? 's' : ''} matching your profile.
              {!isLoggedIn && ' Log in to see them.'}
            </p>
          )}
          <div className='mt-6 flex flex-col gap-3'>
            {isLoggedIn ? (
              <button
                type='button'
                onClick={handleSaveAndGoToDashboard}
                disabled={submitting}
                className='w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50'
              >
                {submitting ? 'Saving…' : 'Save and see my schemes'}
              </button>
            ) : (
              <button
                type='button'
                onClick={() => setPhase('verify')}
                className='w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90'
              >
                Send code to {email} to see my schemes
              </button>
            )}
            <button
              type='button'
              onClick={handleContinueFullQuestionnaire}
              className='w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 font-medium text-[var(--foreground)] hover:bg-[var(--background)]'
            >
              Continue with full questionnaire
            </button>
          </div>
          {error && <p className='mt-4 text-sm text-red-600 dark:text-red-400'>{error}</p>}
          <p className='mt-4 text-center text-sm text-[var(--muted)]'>
            <Link href='/' className='hover:underline'>
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ——— Results (after step2 or legacy) ———
  if (phase === 'results') {
    const profile = getDerivedProfile();
    const flowLabel = entityType === 'startup' ? 'Startup' : 'MSME';
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm'>
          <h1 className='text-xl font-semibold text-[var(--foreground)]'>Your matched schemes</h1>
          <p className='mt-1 text-sm text-[var(--muted)]'>
            Based on your <strong>{flowLabel}</strong> answers we&apos;ve classified you as <strong>{profile.business_type}</strong> in{' '}
            {profile.industry}.
          </p>
          <div className='mt-6 max-h-80 space-y-3 overflow-y-auto'>
            {matches.length === 0 ? (
              <p className='text-sm text-[var(--muted)]'>
                No schemes matched yet. Try different criteria or complete the full questionnaire.
              </p>
            ) : (
              matches.slice(0, 15).map((m) => (
                <div key={m.scheme.id} className='rounded-lg border border-[var(--border)] bg-[var(--background)] p-4'>
                  <div className='flex justify-between gap-2'>
                    <span className='font-medium text-[var(--foreground)]'>{m.scheme.name}</span>
                    <span className='text-sm text-[var(--muted)]'>{m.score}% match</span>
                  </div>
                  {m.scheme.key_benefit_display && <p className='mt-1 text-sm text-[var(--muted)]'>{m.scheme.key_benefit_display}</p>}
                  {m.missingRequirements.length > 0 && (
                    <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>Missing: {m.missingRequirements.join(', ')}</p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className='mt-6 flex flex-col gap-3'>
            <button
              type='button'
              onClick={handleSaveAndEmail}
              disabled={submitting}
              className='w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50'
            >
              {submitting ? 'Saving…' : 'Save and verify email to see schemes'}
            </button>
            <button
              type='button'
              onClick={handleContinueFullQuestionnaire}
              className='w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 font-medium text-[var(--foreground)] hover:bg-[var(--background)]'
            >
              Continue with full questionnaire
            </button>
          </div>
          {error && <p className='mt-4 text-sm text-red-600 dark:text-red-400'>{error}</p>}
          <p className='mt-4 text-center text-sm text-[var(--muted)]'>
            <Link href='/' className='hover:underline'>
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ——— Step 2: extended ———
  if (phase === 'step2' && currentStep2) {
    const progress = ((step2Index + 1) / STEP2_LEN) * 100;
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-lg'>
          <div className='mb-6'>
            <div className='flex justify-between text-sm text-[var(--muted)]'>
              Full questionnaire — {step2Index + 1} of {STEP2_LEN}
            </div>
            <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]'>
              <div className='h-full rounded-full bg-[var(--primary)] transition-all duration-300' style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className='rounded-xl border border-[var(--border)] bg-[var(--card)] p-8'>
            <h1 className='text-xl font-semibold text-[var(--foreground)]'>{currentStep2.title}</h1>
            {currentStep2.subtitle && <p className='mt-1 text-sm text-[var(--muted)]'>{currentStep2.subtitle}</p>}
            <ul className='mt-6 grid gap-3'>
              {currentStep2.options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type='button'
                    onClick={() => handleStep2Select(opt.value)}
                    disabled={submitting}
                    className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors ${
                      step2Value === opt.value
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
            {error && <p className='mt-4 text-sm text-red-600 dark:text-red-400'>{error}</p>}
            <button
              type='button'
              onClick={() => setStep2Index((i) => Math.max(0, i - 1))}
              className='mt-6 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]'
            >
              ← Back
            </button>
          </div>
          <p className='mt-4 text-center text-sm text-[var(--muted)]'>
            <Link href='/' className='hover:underline'>
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ——— Startup or MSME flow steps ———
  if ((phase === 'startup' || phase === 'msme') && currentFlowStep) {
    const totalSteps = 1 + 1 + flowLen; // email + gateway + flow
    const currentStepNumber = 2 + flowStepIndex;
    const progress = (currentStepNumber / totalSteps) * 100;
    const flowLabel = entityType === 'startup' ? 'Startup' : 'MSME';
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--background)] p-4'>
        <div className='w-full max-w-lg'>
          <div className='mb-6'>
            <div className='flex justify-between text-sm text-[var(--muted)]'>
              <span>
                {flowLabel} — Step {flowStepIndex + 1} of {flowLen}
              </span>
            </div>
            <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]'>
              <div className='h-full rounded-full bg-[var(--primary)] transition-all duration-300' style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className='rounded-xl border border-[var(--border)] bg-[var(--card)] p-8'>
            <h1 className='text-xl font-semibold text-[var(--foreground)]'>{currentFlowStep.title}</h1>
            {currentFlowStep.subtitle && <p className='mt-1 text-sm text-[var(--muted)]'>{currentFlowStep.subtitle}</p>}
            <ul className='mt-6 grid gap-3'>
              {currentFlowStep.options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type='button'
                    onClick={() => handleFlowSelect(opt.value)}
                    disabled={submitting}
                    className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors ${
                      flowValue === opt.value
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
            {error && <p className='mt-4 text-sm text-red-600 dark:text-red-400'>{error}</p>}
            {submitting && <p className='mt-4 text-sm text-[var(--muted)]'>Loading…</p>}
            <button
              type='button'
              onClick={() => (flowStepIndex > 0 ? setFlowStepIndex((i) => i - 1) : setPhase('gateway'))}
              className='mt-6 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]'
            >
              ← Back
            </button>
          </div>
          <p className='mt-4 text-center text-sm text-[var(--muted)]'>
            <Link href='/' className='hover:underline'>
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return null;
}
