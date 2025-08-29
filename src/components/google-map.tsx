// Simple interactive Google Map embed for the first task (Celetná 597, 110 00 Staré Město)
import React from "react";

interface GoogleMapProps {
  lat: number;
  lng: number;
}

export default function GoogleMap({ lat, lng }: GoogleMapProps) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
  return (
    <iframe
      title="Google Map"
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="w-full h-full rounded-xl"
    />
  );
}
