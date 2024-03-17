import "./App.css";

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
const center = {
  lat: 7.2905715, // default latitude
  lng: 80.6337262, // default longitude
};

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBMid2MJczEm0Y_8P5HgCkSrw-iev-EtX0",
    libraries: googleMapsLibraries,
  });

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
        zoom={10}
        center={center}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}

export default App;
