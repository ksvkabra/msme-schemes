'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GATEWAY_QUESTION,
  STARTUP_QUESTIONS,
  MSME_QUESTIONS,
  STEP2_QUESTIONS,
  type EntityType,
  type StartupFormData,
  type MSMEFormData,
} from '@/lib/eligibility/questions';
import { deriveStartupProfile, deriveMSMEProfile } from '@/lib/eligibility/derive-profile';

const STARTUP_LEN = STARTUP_QUESTIONS.length;
const MSME_LEN = MSME_QUESTIONS.length;
const STEP2_LEN = STEP2_QUESTIONS.length;

type Step = 'gateway' | 'flow' | 'step2' | 'done';

export function ProfileEditForm({
  initialEntityType,
  initialQuestionnaire,
  initialStep2,
}: {
  initialEntityType: EntityType;
  initialQuestionnaire: Record<string, string | string[]>;
  initialStep2: Record<string, string>;
}) {
  const router = useRouter();
  const [entityType, setEntityType] = useState<EntityType>(initialEntityType);
  const [step, setStep] = useState<Step>('gateway');
  const [flowStepIndex, setFlowStepIndex] = useState(0);
  const [step2Index, setStep2Index] = useState(0);
  const [startupData, setStartupData] = useState<StartupFormData>(
    initialEntityType === 'startup' ? (initialQuestionnaire as StartupFormData) : {}
  );
  const [msmeData, setMsmeData] = useState<MSMEFormData>(
    initialEntityType === 'msme' ? (initialQuestionnaire as MSMEFormData) : {}
  );
  const [step2Data, setStep2Data] = useState<Record<string, string>>(initialStep2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const flowQuestions = entityType === 'startup' ? STARTUP_QUESTIONS : MSME_QUESTIONS;
  const flowLen = entityType === 'startup' ? STARTUP_LEN : MSME_LEN;
  const flowData = entityType === 'startup' ? startupData : msmeData;
  const currentFlowStep = flowQuestions[flowStepIndex];
  const currentStep2 = STEP2_QUESTIONS[step2Index];

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

  const flowValue = currentFlowStep ? flowData[currentFlowStep.key] : undefined;
  const step2Value = currentStep2 ? step2Data[currentStep2.key] : undefined;

  function handleGatewaySelect(val: string) {
    if (val !== 'startup' && val !== 'msme') return;
    setEntityType(val);
    setFlowStepIndex(0);
    setStep('flow');
  }

  function handleFlowSelect(val: string) {
    if (!currentFlowStep) return;
    setFlowData(currentFlowStep.key, val);
    if (flowStepIndex < flowLen - 1) {
      setFlowStepIndex((i) => i + 1);
    } else {
      setStep('step2');
      setStep2Index(0);
    }
  }

  function handleStep2Select(val: string) {
    if (!currentStep2) return;
    setStep2Data((prev) => ({ ...prev, [currentStep2.key]: val }));
    if (step2Index < STEP2_LEN - 1) {
      setStep2Index((i) => i + 1);
    } else {
      submitProfile();
    }
  }

  async function submitProfile() {
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
    router.push('/dashboard');
    router.refresh();
  }

  // Gateway
  if (step === 'gateway') {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{GATEWAY_QUESTION.title}</h2>
        {GATEWAY_QUESTION.subtitle && (
          <p className="mt-1 text-sm text-[var(--muted)]">{GATEWAY_QUESTION.subtitle}</p>
        )}
        <ul className="mt-6 grid gap-3">
          {GATEWAY_QUESTION.options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => handleGatewaySelect(opt.value)}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors ${
                  entityType === opt.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50'
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Flow (startup / msme questions)
  if (step === 'flow' && currentFlowStep) {
    const progress = ((flowStepIndex + 1) / flowLen) * 100;
    const flowLabel = entityType === 'startup' ? 'Startup' : 'MSME';
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-[var(--muted)]">
            {flowLabel} — {flowStepIndex + 1} of {flowLen}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{currentFlowStep.title}</h2>
        {currentFlowStep.subtitle && (
          <p className="mt-1 text-sm text-[var(--muted)]">{currentFlowStep.subtitle}</p>
        )}
        <ul className="mt-6 grid gap-3">
          {currentFlowStep.options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
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
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() =>
              flowStepIndex > 0 ? setFlowStepIndex((i) => i - 1) : setStep('gateway')
            }
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step2
  if (step === 'step2' && currentStep2) {
    const progress = ((step2Index + 1) / STEP2_LEN) * 100;
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-[var(--muted)]">
            Additional details — {step2Index + 1} of {STEP2_LEN}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{currentStep2.title}</h2>
        {currentStep2.subtitle && (
          <p className="mt-1 text-sm text-[var(--muted)]">{currentStep2.subtitle}</p>
        )}
        <ul className="mt-6 grid gap-3">
          {currentStep2.options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
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
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() => {
              if (step2Index > 0) {
                setStep2Index((i) => i - 1);
              } else {
                setStep('flow');
                setFlowStepIndex(flowLen - 1);
              }
            }}
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return null;
}
