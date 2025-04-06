import React from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Coordinates, Store } from "@/lib/types";

interface RouteMapProps {
  origin: Coordinates;
  stores: Store[];
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function RouteMap({ origin, stores }: RouteMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);

  React.useEffect(() => {
    if (!isLoaded || stores.length === 0) return;

    // Filter out any stores missing lat/lng
    const validStores = stores.filter(
      (store): store is Store & { lat: number; lng: number } =>
        typeof store.lat === "number" && typeof store.lng === "number"
    );

    if (validStores.length === 0) return;

    const waypoints = validStores.slice(0, -1).map((store) => ({
      location: { lat: store.lat, lng: store.lng } as google.maps.LatLngLiteral,
      stopover: true,
    }));

    const destination = validStores[validStores.length - 1];

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination: {
          lat: destination.lat,
          lng: destination.lng,
        } as google.maps.LatLngLiteral,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        } else {
          console.warn("Directions error:", status);
        }
      }
    );
  }, [isLoaded, origin, stores]);

  if (!isLoaded) return <p className="p-4">Loading map...</p>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={origin} zoom={12}>
      <Marker position={origin} label="You" />
      {stores.map((store, index) =>
        typeof store.lat === "number" && typeof store.lng === "number" ? (
          <Marker
            key={store.id}
            position={{ lat: store.lat, lng: store.lng }}
            label={`${index + 1}`}
          />
        ) : null
      )}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
