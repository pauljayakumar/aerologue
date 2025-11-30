'use client';

import { useEffect, useState } from 'react';
import type { FlightPosition } from '@/types';

interface FlightPanelProps {
  flight: FlightPosition | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FlightPanel({ flight, isOpen, onClose }: FlightPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!flight && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed right-0 top-16 bottom-0 w-full max-w-md bg-surface border-l border-border z-40
          transform transition-transform duration-300 ease-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        onTransitionEnd={() => !isOpen && setIsAnimating(false)}
      >
        {flight && (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{flight.callsign || flight.icao24.toUpperCase()}</h2>
                <p className="text-sm text-secondary">
                  {flight.registration || flight.aircraftType
                    ? `${flight.registration || ''} ${flight.aircraftType ? `• ${flight.aircraftType}` : ''}`.trim()
                    : `ICAO: ${flight.icao24.toUpperCase()}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-alt rounded-lg transition"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Flight header with callsign and registration */}
              <div className="bg-surface-alt rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-3xl font-bold text-foreground">{flight.callsign || 'N/A'}</div>
                    <div className="text-xs text-muted mt-1">Callsign</div>
                  </div>
                  {flight.registration && (
                    <>
                      <div className="h-10 w-px bg-border mx-4"></div>
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-map">{flight.registration}</div>
                        <div className="text-xs text-muted mt-1">Registration</div>
                      </div>
                    </>
                  )}
                </div>
                {flight.aircraftType && (
                  <div className="mt-3 pt-3 border-t border-border text-center">
                    <span className="text-muted">Aircraft: </span>
                    <span className="font-medium text-foreground">{flight.aircraftType}</span>
                  </div>
                )}
              </div>

              {/* Flight stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Altitude"
                  value={flight.altitude ? `${Math.round(flight.altitude).toLocaleString()} ft` : 'N/A'}
                  icon="📈"
                />
                <StatCard
                  label="Speed"
                  value={flight.velocity ? `${Math.round(flight.velocity)} kts` : 'N/A'}
                  icon="💨"
                />
                <StatCard
                  label="Heading"
                  value={flight.heading ? `${Math.round(flight.heading)}°` : 'N/A'}
                  icon="🧭"
                />
                <StatCard
                  label="Vertical Rate"
                  value={flight.verticalRate ? `${Math.round(flight.verticalRate)} ft/m` : 'N/A'}
                  icon={flight.verticalRate && flight.verticalRate > 0 ? '⬆️' : '⬇️'}
                />
              </div>

              {/* Position */}
              <div className="bg-surface-alt rounded-xl p-4">
                <h3 className="text-sm font-medium text-secondary mb-3">Current Position</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted">Latitude: </span>
                    <span className="font-mono text-foreground">{flight.latitude.toFixed(4)}°</span>
                  </div>
                  <div>
                    <span className="text-muted">Longitude: </span>
                    <span className="font-mono text-foreground">{flight.longitude.toFixed(4)}°</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full btn btn-map">
                  <span>Track This Flight</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button className="w-full btn btn-secondary">
                  <span>View Flight History</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              {/* Transponder & Status */}
              <div className="bg-gradient-to-br from-surface-alt to-surface-alt/50 rounded-xl p-4 border border-border">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-map/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📡</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Transponder Data</h3>
                    <p className="text-xs text-muted">
                      via {flight.source === 'adsb-exchange' ? 'ADS-B Exchange' : flight.source === 'opensky' ? 'OpenSky Network' : 'Unknown source'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">ICAO24:</span>
                    <span className="font-mono text-foreground uppercase">{flight.icao24}</span>
                  </div>
                  {flight.squawk && (
                    <div className="flex justify-between">
                      <span className="text-muted">Squawk:</span>
                      <span className="font-mono text-foreground">{flight.squawk}</span>
                    </div>
                  )}
                  {flight.category && (
                    <div className="flex justify-between">
                      <span className="text-muted">Category:</span>
                      <span className="text-foreground">{flight.category}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted">Status:</span>
                    <span className={`font-medium ${flight.onGround ? 'text-warning' : 'text-success'}`}>
                      {flight.onGround ? 'On Ground' : 'Airborne'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency status (if any) */}
              {flight.emergency && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 text-danger">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold">Emergency: {flight.emergency}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-surface-alt rounded-xl p-4">
      <div className="flex items-center space-x-2 mb-2">
        <span>{icon}</span>
        <span className="text-sm text-secondary">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}
