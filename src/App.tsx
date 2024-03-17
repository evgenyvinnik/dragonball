import "./App.css";
import { useState } from "react";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  LoadScriptProps,
} from "@react-google-maps/api";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import { AppBar, Toolbar } from "@mui/material";

const googleMapsLibraries: LoadScriptProps["libraries"] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};
const center: google.maps.LatLngLiteral = {
  lat: 7.2905715, // default latitude
  lng: 80.6337262, // default longitude
};

const otherBallsCount = 6;
const maxTries = 10;
const maxMoves = 30;

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBMid2MJczEm0Y_8P5HgCkSrw-iev-EtX0",
    libraries: googleMapsLibraries,
  });

  // const [marker, setMarker] = useState<google.maps.LatLngLiteral | undefined>(
  //   undefined
  // );

  const [markers, setMarkers] = useState<
    google.maps.LatLngLiteral[] | undefined
  >(undefined);

  const [message, setMessage] = useState("");

  const [open, setOpen] = useState(false);

  const addRandomMarkers = () => {
    for (let i = 0; i < otherBallsCount; i++) {}
  };

  const moveMarkers = () => {};

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng != null) {
      let newMarkers: google.maps.LatLngLiteral[] = [];
      let newMarker = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      newMarkers.push(newMarker);
      setMarkers(newMarkers);
      setMessage(
        `Set marker at latitude: ${e.latLng.lat()} and longitude: ${e.latLng.lng()} `
      );
      setOpen(true);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <div className="App">
      <AppBar position="sticky">
        <Toolbar>
          Dragonball placement tool: click on the land to place your first
          Dragonball
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          bgcolor: "#cfe8fc",
          height: "100%",
        }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={2}
          center={center}
          onClick={onMapClick}
        >
          {markers
            ? markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={{
                    lat: marker.lat,
                    lng: marker.lng,
                  }}
                  icon={{
                    url: require("./assets/Dragonball-1.ico"),
                    fillColor: "#EB00FF",
                    scale: 7,
                  }}
                />
              ))
            : null}
        </GoogleMap>
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        message={message}
      />
    </div>
  );
}

export default App;
