import "./App.css";
import { SetStateAction, useState } from "react";

import {
  GoogleMap,
  useLoadScript,
  InfoWindow,
  Marker,
  LoadScriptProps,
} from "@react-google-maps/api";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import { AppBar, Toolbar } from "@mui/material";
import { setDefaults, fromLatLng, OutputFormat } from "react-geocode";

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

const API_KEY = "AIzaSyBMid2MJczEm0Y_8P5HgCkSrw-iev-EtX0";

setDefaults({
  key: "AIzaSyBMid2MJczEm0Y_8P5HgCkSrw-iev-EtX0",
  language: "en",
  region: "en",
  outputFormat: OutputFormat.JSON,
  enable_address_descriptor: true,
});

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: googleMapsLibraries,
  });

  const [markers, setMarkers] = useState<
    google.maps.LatLngLiteral[] | undefined
  >(undefined);

  const [message, setMessage] = useState("");

  const [open, setOpen] = useState(false);

  const boundingBox = {
    southwest: { lat: -90, lng: -180 },
    northeast: { lat: 90, lng: 180 },
  };

  const addRandomMarker = (newMarkers: google.maps.LatLngLiteral[]) => {
    const randomLat =
      boundingBox.southwest.lat +
      Math.random() * (boundingBox.northeast.lat - boundingBox.southwest.lat);
    const randomLng =
      boundingBox.southwest.lng +
      Math.random() * (boundingBox.northeast.lng - boundingBox.southwest.lng);
    const randomPoint = { lat: randomLat, lng: randomLng };
    newMarkers.push(randomPoint);
  };

  const addRandomMarkers = (newMarkers: google.maps.LatLngLiteral[]) => {
    for (let i = 0; i < otherBallsCount; i++) {
      addRandomMarker(newMarkers);
    }
  };

  // const moveMarkers = () => {};

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng != null) {
      let newMarkers: google.maps.LatLngLiteral[] = [];
      let lat = e.latLng.lat();
      let lng = e.latLng.lng();
      let newMarker = {
        lat: lat,
        lng: lng,
      };

      fromLatLng(lat, lng).then(
        ({ results }) => {
          const lastResponse = results[results.length - 1];

          if (
            lastResponse.types.includes("country") ||
            lastResponse.types.includes("political")
          ) {
            const country = lastResponse.formatted_address;

            newMarkers.push(newMarker);

            addRandomMarkers(newMarkers);

            setMarkers(newMarkers);
            setMessage(
              `Placed dragonball at latitude: ${lat} and longitude: ${lng}, which is somewhere in ${country}`
            );
          } else {
            setMessage("Place your dragonball on land and not in the sea!");
          }
          setOpen(true);
        },
        (error) => {
          setMessage(
            "Failed to reverse geocode the position on the map you have clicked on!"
          );
          setOpen(true);
          console.error(error);
        }
      );
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
                    url: require(`./assets/Dragonball-${index + 1}.ico`),
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
