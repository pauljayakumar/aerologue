'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFlightStore } from '@/store/useFlightStore';
import { getAircraftIconName } from '@/lib/aircraftIcons';
import { loadAirports } from '@/lib/airports';
import type { FlightPosition } from '@/types';
import type { Airport } from '@/types/airport';

interface FlightMapProps {
  className?: string;
  onFlightClick?: (flight: FlightPosition) => void;
}

export interface FlightMapRef {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  showTrail: (icao24: string) => Promise<void>;
  hideTrail: () => void;
}

// Trail point from API
interface TrailPoint {
  lat: number;
  lon: number;
  alt: number;
  ts: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mazzuw3qr6.execute-api.us-east-1.amazonaws.com/prod';

// Major airport codes for low zoom visibility - defined outside component to prevent recreation
const MAJOR_AIRPORT_CODES = new Set([
  'JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'ATL', 'SFO', 'SEA', 'MIA', 'BOS',
  'IAH', 'EWR', 'LAS', 'PHX', 'MSP', 'DTW', 'CLT', 'MCO', 'PHL', 'DCA',
  'YYZ', 'YVR', 'YUL', 'YYC', 'MEX', 'CUN',
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'MUC', 'ZRH', 'VIE',
  'LGW', 'MAN', 'DUB', 'CPH', 'OSL', 'ARN', 'HEL', 'BRU', 'LIS', 'ATH',
  'HND', 'NRT', 'PEK', 'PVG', 'HKG', 'SIN', 'ICN', 'BKK', 'KUL', 'CGK',
  'DEL', 'BOM', 'DXB', 'DOH', 'IST', 'TLV',
  'SYD', 'MEL', 'BNE', 'PER', 'AKL',
  'GRU', 'GIG', 'EZE', 'SCL', 'LIM', 'BOG',
  'JNB', 'CAI', 'CPT', 'NBO', 'ADD', 'CMN'
]);

const FlightMap = forwardRef<FlightMapRef, FlightMapProps>(function FlightMap(
  { className = '', onFlightClick },
  ref
) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const flightsRef = useRef<Map<string, FlightPosition>>(new Map());
  const airportsRef = useRef<Airport[]>([]);
  const airportsLoadedRef = useRef(false);
  const currentTrailRef = useRef<string | null>(null);

  const { flights } = useFlightStore();


  // Helper function to clear trail from map
  const clearTrail = useCallback(() => {
    if (!map.current) return;

    if (map.current.getLayer('flight-trail-line')) {
      map.current.removeLayer('flight-trail-line');
    }
    if (map.current.getLayer('flight-trail-points')) {
      map.current.removeLayer('flight-trail-points');
    }
    if (map.current.getSource('flight-trail')) {
      map.current.removeSource('flight-trail');
    }
    currentTrailRef.current = null;
  }, []);

  // Expose flyTo, showTrail, hideTrail methods via ref
  useImperativeHandle(ref, () => ({
    flyTo: (lng: number, lat: number, zoom?: number) => {
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: zoom ?? 10,
          duration: 1500,
          essential: true
        });
      }
    },
    showTrail: async (icao24: string) => {
      if (!map.current || !mapLoaded) return;

      // Clear existing trail
      clearTrail();

      try {
        // Fetch trail data from API
        const response = await fetch(`${API_BASE_URL}/trails/${icao24}`);
        const data = await response.json();

        if (!data.success || !data.data?.points || data.data.points.length === 0) {
          console.log('No trail data available for', icao24);
          return;
        }

        const points: TrailPoint[] = data.data.points;
        currentTrailRef.current = icao24;

        // Create line coordinates from trail points
        const coordinates: [number, number][] = points.map(p => [p.lon, p.lat]);

        // Add current position if we have it
        const currentFlight = flightsRef.current.get(icao24);
        if (currentFlight) {
          coordinates.push([currentFlight.longitude, currentFlight.latitude]);
        }

        // Add trail source
        map.current!.addSource('flight-trail', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              // Line feature
              {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates
                },
                properties: {}
              },
              // Point features for trail dots
              ...points.map((p, i) => ({
                type: 'Feature' as const,
                geometry: {
                  type: 'Point' as const,
                  coordinates: [p.lon, p.lat]
                },
                properties: {
                  altitude: p.alt,
                  timestamp: p.ts,
                  index: i
                }
              }))
            ]
          }
        });

        // Add trail line layer (below flights)
        map.current!.addLayer({
          id: 'flight-trail-line',
          type: 'line',
          source: 'flight-trail',
          filter: ['==', '$type', 'LineString'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#0ea5e9',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-dasharray': [2, 1]
          }
        }, 'flights-layer'); // Insert before flights layer

        // Add trail points layer
        map.current!.addLayer({
          id: 'flight-trail-points',
          type: 'circle',
          source: 'flight-trail',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              5, 2,
              10, 4
            ],
            'circle-color': '#0ea5e9',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.7
          }
        }, 'flights-layer');

        console.log(`Showing trail for ${icao24} with ${points.length} points`);
      } catch (error) {
        console.error('Error fetching trail:', error);
      }
    },
    hideTrail: () => {
      clearTrail();
    }
  }), [mapLoaded, clearTrail]);

  // Keep ref updated
  useEffect(() => {
    flightsRef.current = flights;
  }, [flights]);

  // Load aircraft icons
  const loadAircraftIcons = useCallback(async (mapInstance: maplibregl.Map) => {
    const iconNames = ['737', '747', '777', '787', 'A320', 'A340', 'A350', 'A380', 'ATR72'];

    for (const name of iconNames) {
      if (mapInstance.hasImage(name)) continue;

      try {
        const img = new Image();
        img.src = `/aircraft/optimized/${name}.png`;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        mapInstance.addImage(name, img, { sdf: false });
      } catch (e) {
        console.warn(`Failed to load icon: ${name}`);
      }
    }
  }, []);

  // Load and add airport layers
  const loadAirportLayers = useCallback(async (mapInstance: maplibregl.Map) => {
    // Guard: only load airports once
    if (airportsLoadedRef.current) return;
    airportsLoadedRef.current = true;

    try {
      const airports = await loadAirports();
      airportsRef.current = airports;

      // Create GeoJSON features for all airports
      const allAirportFeatures: GeoJSON.Feature[] = airports.map(airport => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [airport.lon, airport.lat]
        },
        properties: {
          iata: airport.iata,
          icao: airport.icao,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          isMajor: MAJOR_AIRPORT_CODES.has(airport.iata)
        }
      }));

      // Add airports source
      mapInstance.addSource('airports', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: allAirportFeatures
        }
      });

      // Layer 1: Major airports - visible at zoom 3+
      mapInstance.addLayer({
        id: 'airports-major-dots',
        type: 'circle',
        source: 'airports',
        filter: ['==', ['get', 'isMajor'], true],
        minzoom: 3,
        maxzoom: 8,
        paint: {
          'circle-radius': 4,
          'circle-color': '#f59e0b',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Layer 2: Major airport labels - visible at zoom 5+
      mapInstance.addLayer({
        id: 'airports-major-labels',
        type: 'symbol',
        source: 'airports',
        filter: ['==', ['get', 'isMajor'], true],
        minzoom: 5,
        maxzoom: 9,
        layout: {
          'text-field': ['get', 'iata'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-allow-overlap': false
        },
        paint: {
          'text-color': '#f59e0b',
          'text-halo-color': '#1e293b',
          'text-halo-width': 1.5
        }
      });

      // Layer 3: All airports (dots) - visible at zoom 8+
      mapInstance.addLayer({
        id: 'airports-all-dots',
        type: 'circle',
        source: 'airports',
        minzoom: 8,
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            8, 3,
            12, 5
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'isMajor'], true],
            '#f59e0b',
            '#94a3b8'
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Layer 4: All airport labels - visible at zoom 9+
      mapInstance.addLayer({
        id: 'airports-all-labels',
        type: 'symbol',
        source: 'airports',
        minzoom: 9,
        layout: {
          'text-field': ['get', 'iata'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            9, 10,
            12, 12
          ],
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-allow-overlap': false
        },
        paint: {
          'text-color': [
            'case',
            ['==', ['get', 'isMajor'], true],
            '#f59e0b',
            '#cbd5e1'
          ],
          'text-halo-color': '#1e293b',
          'text-halo-width': 1.5
        }
      });

      // Add click handler for airports
      mapInstance.on('click', 'airports-major-dots', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          new maplibregl.Popup({ closeButton: false, className: 'airport-popup' })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="font-medium">${props?.iata} - ${props?.name}</div>
              <div class="text-sm text-gray-400">${props?.city}, ${props?.country}</div>
            `)
            .addTo(mapInstance);
        }
      });

      mapInstance.on('click', 'airports-all-dots', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          new maplibregl.Popup({ closeButton: false, className: 'airport-popup' })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="font-medium">${props?.iata} - ${props?.name}</div>
              <div class="text-sm text-gray-400">${props?.city}, ${props?.country}</div>
            `)
            .addTo(mapInstance);
        }
      });

      // Cursor changes
      mapInstance.on('mouseenter', 'airports-major-dots', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseleave', 'airports-major-dots', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
      mapInstance.on('mouseenter', 'airports-all-dots', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseleave', 'airports-all-dots', () => {
        mapInstance.getCanvas().style.cursor = '';
      });

      console.log(`Loaded ${airports.length} airports on map`);
    } catch (error) {
      console.error('Error loading airports:', error);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Default to London at a reasonable zoom level for initial load optimization
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-0.1276, 51.5074], // London
      zoom: 5, // Reasonable zoom to see aircraft detail
      attributionControl: {},
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.current.on('load', async () => {
      const mapInstance = map.current!;

      await loadAircraftIcons(mapInstance);

      // Load airport layers (async, non-blocking)
      loadAirportLayers(mapInstance);

      mapInstance.addSource('flights', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      mapInstance.addLayer({
        id: 'flights-layer',
        type: 'symbol',
        source: 'flights',
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 0.55,
          'icon-rotate': ['get', 'heading'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 1,
        },
      });

      mapInstance.on('click', 'flights-layer', (e) => {
        if (e.features && e.features[0]) {
          const icao24 = e.features[0].properties?.icao24;
          if (icao24) {
            const flight = flightsRef.current.get(icao24);
            if (flight && onFlightClick) {
              onFlightClick(flight);
            }
          }
        }
      });

      mapInstance.on('mouseenter', 'flights-layer', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', 'flights-layer', () => {
        mapInstance.getCanvas().style.cursor = '';
      });

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [loadAircraftIcons, loadAirportLayers, onFlightClick]);

  // Update map when flights data changes - show real positions directly
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const features: GeoJSON.Feature[] = [];

    flights.forEach((flight) => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [flight.longitude, flight.latitude],
        },
        properties: {
          icao24: flight.icao24,
          callsign: flight.callsign,
          icon: getAircraftIconName(flight.aircraftType),
          heading: flight.heading ?? 0,
          altitude: flight.altitude,
          velocity: flight.velocity,
        },
      });
    });

    const source = map.current?.getSource('flights') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features,
      });
    }
  }, [flights, mapLoaded]);

  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: '100%' }}>
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      <div className="absolute bottom-4 left-4 bg-slate-900/80 text-white px-3 py-2 rounded-lg text-sm">
        <span className="text-gray-400">Flights: </span>
        <span className="font-bold">{flights.size.toLocaleString()}</span>
      </div>

      <div className="absolute top-4 left-4 bg-slate-900/80 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span>Live</span>
      </div>
    </div>
  );
});

export default FlightMap;
