'use client';

import { useEffect, useState, useCallback } from 'react';
import type { FlightPosition } from '@/types';

// Flight details from AeroDataBox API
interface FlightDetails {
  aircraft_id: string;
  flight_number: string | null;
  callsign: string | null;
  airline: {
    name: string;
    iata: string;
    icao: string;
  } | null;
  aircraft: {
    registration: string;
    model: string;
    type: string;
  } | null;
  departure: {
    airport_iata: string | null;
    airport_icao: string | null;
    airport_name: string | null;
    scheduled: string | null;
    actual: string | null;
    terminal: string | null;
    gate: string | null;
  } | null;
  arrival: {
    airport_iata: string | null;
    airport_icao: string | null;
    airport_name: string | null;
    scheduled: string | null;
    estimated: string | null;
    terminal: string | null;
    gate: string | null;
  } | null;
  status: string | null;
  is_cargo: boolean;
  fetched_at: string;
}

interface FlightPanelProps {
  flight: FlightPosition | null;
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod';

export default function FlightPanel({ flight, isOpen, onClose }: FlightPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [flightDetails, setFlightDetails] = useState<FlightDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Fetch flight details when panel opens with a flight
  const fetchFlightDetails = useCallback(async (icao24: string) => {
    setIsLoadingDetails(true);
    setDetailsError(null);
    setFlightDetails(null);

    try {
      const response = await fetch(`${API_BASE_URL}/flights/${icao24}/details`);
      const data = await response.json();

      if (data.success && data.data) {
        setFlightDetails(data.data);
      } else if (data.disabled) {
        setDetailsError('Route info temporarily unavailable');
      } else {
        setDetailsError(data.error || 'Route info not found');
      }
    } catch (error) {
      console.error('Error fetching flight details:', error);
      setDetailsError('Failed to load route info');
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Fetch details when flight changes and panel is open
  useEffect(() => {
    if (isOpen && flight?.icao24) {
      fetchFlightDetails(flight.icao24);
    }
  }, [isOpen, flight?.icao24, fetchFlightDetails]);

  if (!flight && !isAnimating) return null;

  return (
    <>
      {/* Panel - slides in from right, no backdrop overlay */}
      <div
        className={`
          fixed right-0 top-16 bottom-0 w-full max-w-md bg-surface border-l border-border z-40
          transform transition-transform duration-300 ease-out overflow-y-auto shadow-2xl
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

              {/* Route Information */}
              <div className="bg-gradient-to-r from-map/10 to-crossing/10 rounded-xl p-4 border border-map/20">
                <h3 className="text-sm font-medium text-secondary mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Flight Route
                </h3>

                {isLoadingDetails && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-5 h-5 border-2 border-map border-t-transparent rounded-full mr-2" />
                    <span className="text-sm text-muted">Loading route info...</span>
                  </div>
                )}

                {detailsError && !isLoadingDetails && (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted">{detailsError}</p>
                  </div>
                )}

                {flightDetails && !isLoadingDetails && (
                  <div className="flex items-center justify-between">
                    {/* Departure */}
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-map">
                        {flightDetails.departure?.airport_iata || '???'}
                      </div>
                      <div className="text-xs text-muted mt-1 truncate max-w-[100px] mx-auto" title={flightDetails.departure?.airport_name || undefined}>
                        {flightDetails.departure?.airport_name || 'Unknown'}
                      </div>
                      {flightDetails.departure?.actual && (
                        <div className="text-xs text-success mt-1">
                          {new Date(flightDetails.departure.actual).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 px-2">
                      <div className="flex items-center text-muted">
                        <div className="w-8 h-px bg-border"></div>
                        <svg className="w-5 h-5 mx-1 text-crossing" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                        <div className="w-8 h-px bg-border"></div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-crossing">
                        {flightDetails.arrival?.airport_iata || '???'}
                      </div>
                      <div className="text-xs text-muted mt-1 truncate max-w-[100px] mx-auto" title={flightDetails.arrival?.airport_name || undefined}>
                        {flightDetails.arrival?.airport_name || 'Unknown'}
                      </div>
                      {flightDetails.arrival?.estimated && (
                        <div className="text-xs text-secondary mt-1">
                          ETA: {new Date(flightDetails.arrival.estimated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Airline info if available */}
                {flightDetails?.airline && (
                  <div className="mt-3 pt-3 border-t border-border/50 text-center">
                    <span className="text-sm text-muted">Operated by </span>
                    <span className="text-sm font-medium text-foreground">{flightDetails.airline.name}</span>
                    {flightDetails.flight_number && (
                      <span className="text-sm text-map ml-2">({flightDetails.flight_number})</span>
                    )}
                  </div>
                )}

                {/* Status */}
                {flightDetails?.status && (
                  <div className="mt-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      flightDetails.status === 'En-Route' ? 'bg-success/20 text-success' :
                      flightDetails.status === 'Landed' ? 'bg-map/20 text-map' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {flightDetails.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Flight stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Altitude"
                  value={flight.altitude ? `${Math.round(flight.altitude).toLocaleString()} ft` : 'N/A'}
                />
                <StatCard
                  label="Speed"
                  value={flight.velocity ? `${Math.round(flight.velocity)} kts` : 'N/A'}
                />
                <StatCard
                  label="Heading"
                  value={flight.heading ? `${Math.round(flight.heading)}°` : 'N/A'}
                />
                <StatCard
                  label="Vertical Rate"
                  value={flight.verticalRate ? `${Math.round(flight.verticalRate)} ft/m` : 'N/A'}
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
                <div className="mb-3">
                  <h3 className="font-medium text-foreground">Transponder Data</h3>
                  <p className="text-xs text-muted">
                    via {flight.source === 'adsb-exchange' ? 'ADS-B Exchange' : flight.source === 'opensky' ? 'OpenSky Network' : 'Unknown source'}
                  </p>
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
                  <div className="flex items-center text-danger">
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-alt rounded-xl p-4">
      <div className="text-sm text-secondary mb-2">{label}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}
