'use client';

import { useState } from 'react';
import Image from 'next/image';

const PlaneIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18M9 17V9m4 8v-5m4 5V6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);



const RocketIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function InvestorLanding() {
  const [email, setEmail] = useState('');


  const features = [
    {
      icon: <GlobeIcon />,
      title: 'Smart Trip Planning',
      description: 'AI-powered itinerary builder that optimises your journey from booking to arrival, with real-time updates and personalised recommendations.',
    },
    {
      icon: <ChartIcon />,
      title: 'Live Flight Updates',
      description: 'Real-time notifications for delays, gate changes, and boarding times. Never miss a connection with predictive alerts.',
    },
  ];

  const roadmap = [
    { phase: 'Q1 2025', title: 'Core Platform', items: ['Trip management', 'Flight tracking', 'User profiles'], status: 'current' },
    { phase: 'Q2 2025', title: 'Travel Features', items: ['Booking integration', 'Loyalty programs', 'Mobile apps'], status: 'upcoming' },
    { phase: 'Q3 2025', title: 'Web3 & Rewards', items: ['Travel NFTs', 'Token rewards', 'Exclusive perks'], status: 'upcoming' },
    { phase: 'Q4 2025', title: 'Expansion', items: ['B2B partnerships', 'Airport services', 'Global rollout'], status: 'upcoming' },
  ];

  const investmentHighlights = [
    'First-mover in Web3-enabled travel companion space',
    'Freemium model with premium subscriptions & partnerships',
    'Experienced team from aviation and travel tech industries',
    'Strategic airline and airport partnerships in progress',
    'Clear path to 1M+ users within 24 months',
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/aerologue.png"
                alt="Aerologue"
                width={180}
                height={48}
                className="h-10 w-auto"
                priority
              />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#roadmap" className="text-white/70 hover:text-white transition-colors">Roadmap</a>
              <a href="#invest" className="text-white/70 hover:text-white transition-colors">Invest</a>
            </div>
            <a
              href="https://demo.aerologue.com/map"
              target="_blank"
              className="glass-button text-sm"
            >
              View Demo
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-white/80">Now accepting strategic investors</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Ultimate{' '}
              <span className="gradient-text">Air Travel Companion</span>
            </h1>

            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Aerologue transforms how you travel by air. From planning to landing,
              we&apos;re with you every step of the journey with smart tools and rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#invest" className="glass-button inline-flex items-center justify-center gap-2">
                <RocketIcon />
                Investment Deck
              </a>
              <a
                href="https://demo.aerologue.com/map"
                target="_blank"
                className="glass-button inline-flex items-center justify-center gap-2 !bg-white/5"
              >
                Explore Platform
                <ArrowRightIcon />
              </a>
            </div>
          </div>

          {/* Hero visual - Glass card with map preview */}
          <div className="mt-16 relative">
            <div className="glass-card p-2 max-w-5xl mx-auto">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative overflow-hidden">
                {/* Simulated map interface */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                  <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <PlaneIcon />
                    <p className="text-white/40 mt-4">Your journey, beautifully managed</p>
                    <a
                      href="https://demo.aerologue.com/map"
                      target="_blank"
                      className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Try the Experience <ArrowRightIcon />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why <span className="gradient-text">Aerologue</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              The all-in-one travel companion that makes every journey smoother, smarter, and more rewarding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card glass-card-hover p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-10 md:p-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Investment <span className="gradient-text">Opportunity</span>
                </h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  Join us in building the ultimate air travel companion platform.
                  We&apos;re seeking strategic partners who share our vision for transforming how people experience air travel.
                </p>
                <a href="#invest" className="glass-button inline-flex items-center gap-2">
                  Request Investor Deck
                  <ArrowRightIcon />
                </a>
              </div>
              <div className="space-y-4">
                {investmentHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <CheckIcon />
                    <span className="text-white/80">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Product <span className="gradient-text">Roadmap</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Our strategic path to becoming the leading air travel companion platform.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {roadmap.map((item, index) => (
              <div
                key={index}
                className={`glass-card p-6 relative ${item.status === 'current' ? 'border-blue-500/50' : ''}`}
              >
                {item.status === 'current' && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-blue-500 text-xs font-semibold">
                    Current
                  </div>
                )}
                <div className="text-sm text-blue-400 font-semibold mb-2">{item.phase}</div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <ul className="space-y-2">
                  {item.items.map((listItem, i) => (
                    <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      {listItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="invest" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-10 md:p-16 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to <span className="gradient-text">Invest</span>?
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Request our comprehensive investor deck and schedule a call with our team.
              </p>

              <form
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Handle form submission
                  alert('Thank you! We will be in touch soon.');
                  setEmail('');
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input flex-1"
                  required
                />
                <button type="submit" className="glass-button whitespace-nowrap">
                  Get Deck
                </button>
              </form>

              <p className="text-white/40 text-sm mt-6">
                For accredited investors only. By submitting, you agree to our terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Main footer content */}
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Logo and tagline */}
            <div>
              <Image
                src="/aerologue.png"
                alt="Aerologue"
                width={160}
                height={42}
                className="h-10 w-auto mb-4"
              />
              <p className="text-white/50 text-sm leading-relaxed">
                Your ultimate air travel companion. Smart tools and rewards for every journey.
              </p>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-white/60 text-sm">
                <p>
                  <a href="https://www.aerologue.com" target="_blank" className="hover:text-white transition-colors">
                    www.aerologue.com
                  </a>
                </p>
                <p>
                  <a href="mailto:info@aerologue.com" className="hover:text-white transition-colors">
                    info@aerologue.com
                  </a>
                </p>
                <p>
                  <a href="tel:+442031484613" className="hover:text-white transition-colors">
                    020 3148 4613
                  </a>
                </p>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-3 text-white/60 text-sm">
                <p><a href="#features" className="hover:text-white transition-colors">Features</a></p>
                <p><a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a></p>
                <p><a href="#invest" className="hover:text-white transition-colors">Invest</a></p>
                <p><a href="https://demo.aerologue.com/map" target="_blank" className="hover:text-white transition-colors">Live Demo</a></p>
              </div>
            </div>
          </div>

          {/* Company details and copyright */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white/40 text-xs text-center md:text-left">
                <p className="font-medium text-white/50">AEROLOGUE LTD</p>
                <p>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom</p>
                <p>Registered in United Kingdom, Company Number 16876117</p>
              </div>
              <div className="flex items-center gap-6 text-white/40 text-sm">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <span>&copy; 2025 Aerologue Ltd. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
