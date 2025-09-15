import Mapbox, { Camera, LocationPuck, MapView } from "@rnmapbox/maps";
import { requestForegroundPermissionsAsync } from "expo-location";
import { useEffect, useState } from "react";

const accessToken =
  "pk.eyJ1IjoiYm94a3Vib3giLCJhIjoiY21ldzk0cXp0MGo1ZzJrcjEzbWk2Z29yaSJ9.06cX9ffhjzSRbLpc3yKzWA";

Mapbox.setAccessToken(accessToken);

// Initialize Mapbox public access token (pk_...) at runtime so tiles can load.
// Prefer setting EXPO_PUBLIC_MAPBOX_TOKEN in your env.
// const MAPBOX_PUBLIC_TOKEN =
//   process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "pk.YOUR_PUBLIC_TOKEN_HERE";

// if (MAPBOX_PUBLIC_TOKEN?.startsWith("pk.")) {
//   Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);
// }

// Kampala coordinates
const KAMPALA_LONGITUDE = 32.5825;
const KAMPALA_LATITUDE = 0.3476;
const KAMPALA_CENTER: [number, number] = [KAMPALA_LONGITUDE, KAMPALA_LATITUDE];
// Higher zoom for street-level detail
const INITIAL_ZOOM = 15;

const MapScreen = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const { status } = await requestForegroundPermissionsAsync();
      if (!canceled) {
        setHasLocationPermission(status === "granted");
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12">
      <Camera
        defaultSettings={{
          centerCoordinate: KAMPALA_CENTER,
          zoomLevel: INITIAL_ZOOM,
        }}
        followUserLocation={hasLocationPermission}
        followZoomLevel={INITIAL_ZOOM}
      />
      <LocationPuck
        puckBearing="course"
        puckBearingEnabled
        visible={hasLocationPermission}
      />
    </MapView>
  );
};

export default MapScreen;
