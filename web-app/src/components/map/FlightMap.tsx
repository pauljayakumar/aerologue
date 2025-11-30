'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFlightStore } from '@/store/useFlightStore';
import { getAircraftIconName } from '@/lib/aircraftIcons';
import type { FlightPosition } from '@/types';

interface FlightMapProps {
  className?: string;
  onFlightClick?: (flight: FlightPosition) => void;
}

// Convert knots to degrees per second
// 1 knot = 1.852 km/h = 0.0005144 km/s
// 1 degree latitude ≈ 111 km
// So: knots * 0.0005144 / 111 = degrees/second
const KNOTS_TO_DEG_PER_SEC = 0.0005144 / 111;

export default function FlightMap({ className = '', onFlightClick }: FlightMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const flightsRef = useRef<Map<string, FlightPosition>>(new Map());

  // For interpolation
  const positionsRef = useRef<Map<string, { lat: number; lon: number }>>(new Map());
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(performance.now());

  const { flights } = useFlightStore();

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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      map.current?.remove();
      map.current = null;
    };
  }, [loadAircraftIcons, onFlightClick]);

  // When flights update from API, reset base positions
  useEffect(() => {
    flights.forEach((flight, icao24) => {
      // Initialize or update position tracking
      if (!positionsRef.current.has(icao24)) {
        positionsRef.current.set(icao24, {
          lat: flight.latitude,
          lon: flight.longitude,
        });
      }
      // Note: We don't reset existing positions here to allow smooth interpolation
    });

    // Remove stale entries
    positionsRef.current.forEach((_, icao24) => {
      if (!flights.has(icao24)) {
        positionsRef.current.delete(icao24);
      }
    });

    lastUpdateRef.current = performance.now();
  }, [flights]);

  // Animation loop for smooth movement
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    let lastFrameTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const deltaSeconds = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      // Cap delta to avoid huge jumps if tab was inactive
      const cappedDelta = Math.min(deltaSeconds, 0.1);

      // Build GeoJSON features with interpolated positions
      const features: GeoJSON.Feature[] = [];

      flightsRef.current.forEach((flight, icao24) => {
        let pos = positionsRef.current.get(icao24);

        if (!pos) {
          pos = { lat: flight.latitude, lon: flight.longitude };
          positionsRef.current.set(icao24, pos);
        }

        // Only interpolate if aircraft is moving (speed > 30 knots and has heading)
        if (flight.velocity && flight.velocity > 30 && flight.heading !== null) {
          const heading = flight.heading;
          const speed = flight.velocity;

          // Calculate movement based on actual elapsed time
          const headingRad = (heading * Math.PI) / 180;
          const distanceDeg = speed * KNOTS_TO_DEG_PER_SEC * cappedDelta;

          // Move in heading direction
          pos.lat += distanceDeg * Math.cos(headingRad);
          pos.lon += (distanceDeg * Math.sin(headingRad)) / Math.max(0.1, Math.cos((pos.lat * Math.PI) / 180));

          // Gradually correct towards actual position (scaled by delta time)
          // ~3% correction per frame at 60fps = ~180% per second
          const correctionFactor = Math.min(1, 3 * cappedDelta);
          pos.lat += (flight.latitude - pos.lat) * correctionFactor;
          pos.lon += (flight.longitude - pos.lon) * correctionFactor;
        } else {
          // Stationary or slow - lerp to actual position faster
          const lerpFactor = Math.min(1, 6 * cappedDelta);
          pos.lat += (flight.latitude - pos.lat) * lerpFactor;
          pos.lon += (flight.longitude - pos.lon) * lerpFactor;
        }

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [pos.lon, pos.lat],
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

      // Update map source
      const source = map.current?.getSource('flights') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features,
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mapLoaded]);

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
}
