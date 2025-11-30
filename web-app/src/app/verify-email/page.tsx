'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const chars = value.slice(0, 6).split('');
      const newCode = [...code];
      chars.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      // Focus last input or next empty
      const nextIndex = Math.min(index + chars.length, 5);
      document.getElementById(`code-${nextIndex}`)?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const verificationCode = code.join('');

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      });
      router.push('/login?verified=true');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await resendSignUpCode({ username: email });
      setResendCooldown(60);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend code';
      setError(message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-map/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/aerologue.png"
              alt="Aerologue"
              width={260}
              height={78}
              className="h-[4.5rem] w-auto mx-auto"
            />
          </Link>
        </div>

        {/* Verification card */}
        <div className="card p-8">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-map/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-map" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-secondary">
              We sent a verification code to
              <br />
              <span className="text-foreground font-medium">{email || 'your email'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-error/10 border border-error/50 rounded-xl p-4 text-error text-sm flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Code inputs */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 bg-surface-alt border border-border rounded-xl text-center text-xl font-bold text-foreground focus:outline-none focus:border-map focus:ring-2 focus:ring-map/20 transition"
                  />
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || code.some((d) => !d)}
              className="w-full btn btn-map disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Email</span>
              )}
            </button>
          </form>

          {/* Resend code */}
          <div className="mt-6 text-center">
            <p className="text-secondary text-sm">
              Didn&apos;t receive the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-muted">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-map hover:text-map/80 font-medium transition"
                >
                  Resend
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Back to login */}
        <p className="text-center text-secondary mt-6">
          <Link href="/login" className="text-map hover:text-map/80 transition">
            &larr; Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-map border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
