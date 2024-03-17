import "./App.css";
import { useState } from "react";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  LoadScriptProps,
} from "@react-google-maps/api";

const googleMapsLibraries: LoadScriptProps["libraries"] = ["places"];

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const center: google.maps.LatLngLiteral = {
  lat: 7.2905715, // default latitude
  lng: 80.6337262, // default longitude
};

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBMid2MJczEm0Y_8P5HgCkSrw-iev-EtX0",
    libraries: googleMapsLibraries,
  });

  const [marker, setMarker] = useState<google.maps.LatLngLiteral | undefined>(
    undefined
  );

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng != null) {
      setMarker({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={2}
        center={center}
        onClick={onMapClick}
      >
        {marker ? (
          <Marker
            position={{
              lat: marker.lat,
              lng: marker.lng,
            }}
            icon={{
              // path: google.maps.SymbolPath.CIRCLE,
              url: require("./assets/Dragonball-1.ico"),
              fillColor: "#EB00FF",
              scale: 7,
            }}
          />
        ) : null}
      </GoogleMap>
    </div>
  );
}

export default App;
