import React, { useEffect, useRef } from 'react';

interface InteractiveMapProps {
  target: { lat: number; lng: number };
  height?: string;
}

// Loads Google Maps JS API script
function loadGoogleMapsScript(apiKey: string, callback: () => void) {
  if (typeof window === 'undefined') return;
  if ((window as any).google && (window as any).google.maps) {
    callback();
    return;
  }
  const existingScript = document.getElementById('google-maps-script');
  if (existingScript) {
    existingScript.addEventListener('load', callback);
    return;
  }
  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.onload = callback;
  document.body.appendChild(script);
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const InteractiveMap: React.FC<InteractiveMapProps> = ({ target, height = '300px' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsRendererRef = useRef<any>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    let map: any;
    let directionsService: any;
    let directionsRenderer: any;
    let userMarker: any;
    let targetMarker: any;
    let watchId: number;

    function initMap() {
      if (!mapRef.current) return;
      const gmaps = (window as any).google?.maps;
      if (!gmaps) return;
      map = new gmaps.Map(mapRef.current, {
        center: target,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      directionsService = new gmaps.DirectionsService();
  directionsRenderer = new gmaps.DirectionsRenderer({ suppressMarkers: true, preserveViewport: true });
      directionsRenderer.setMap(map);
      directionsRendererRef.current = directionsRenderer;
      targetMarker = new gmaps.Marker({
        position: target,
        map,
        label: '🎯',
        title: 'Cieľ',
      });
      if (navigator.geolocation) {
        let firstUpdate = true;
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const userPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            if (!userMarker) {
              userMarker = new gmaps.Marker({
                position: userPos,
                map,
                label: '🧑',
                title: 'Vy',
              });
            } else {
              userMarker.setPosition(userPos);
            }
            if (firstUpdate) {
              map.setCenter(userPos);
              firstUpdate = false;
            }
            directionsService.route(
              {
                origin: userPos,
                destination: target,
                travelMode: gmaps.TravelMode.WALKING,
              },
              (result: any, status: any) => {
                if (status === 'OK' && result) {
                  directionsRenderer.setDirections(result);
                }
              }
            );
          },
          undefined,
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      }
    }
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY, initMap);
    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [target]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height, borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px #0001' }}
      aria-label="Mapa s navigáciou k cieľu"
    />
  );
};

export default InteractiveMap;
