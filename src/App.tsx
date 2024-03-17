import "./App.css";
import { useState } from "react";

import {
  GoogleMap,
  DistanceMatrixService,
  useLoadScript,
  Marker,
  LoadScriptProps,
} from "@react-google-maps/api";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import { AppBar, Toolbar } from "@mui/material";
import { setDefaults, fromLatLng, OutputFormat } from "react-geocode";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
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
const maxTries = 100;
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

  const [command, setCommand] = useState(
    "Click on the land to place your first Dragonball"
  );
  const [message, setMessage] = useState("");
  const [totalDistance, setTotalDistance] = useState(0);

  const [open, setOpen] = useState(false);

  const boundingBox = {
    southwest: { lat: -90, lng: -180 },
    northeast: { lat: 90, lng: 180 },
  };

  const getMarker = async (lat: number, lng: number, addMessage: boolean) => {
    const marker = await fromLatLng(lat, lng).then(
      ({ results }) => {
        const lastResponse = results[results.length - 1];

        if (
          lastResponse.types.includes("country") ||
          lastResponse.types.includes("political")
        ) {
          const country = lastResponse.formatted_address;
          const message = `Placed dragonball at latitude: ${lat} and longitude: ${lng}, which is somewhere in ${country}`;
          if (addMessage) {
            setMessage(message);
            setOpen(true);
          } else {
            console.log(message);
          }
          return {
            lat: lat,
            lng: lng,
          };
        } else {
          if (addMessage) {
            setMessage("Place your dragonball on land and not in the sea!");
            setOpen(true);
          } else {
            console.warn("failed to add random land point");
          }
          return null;
        }
      },
      (error) => {
        if (addMessage) {
          setMessage(
            "Failed to reverse geocode the position on the map you have clicked on!"
          );
          setOpen(true);
        }
        console.error(error);
        return null;
      }
    );

    return marker;
  };

  const addRandomMarker = async () => {
    const randomLat =
      boundingBox.southwest.lat +
      Math.random() * (boundingBox.northeast.lat - boundingBox.southwest.lat);
    const randomLng =
      boundingBox.southwest.lng +
      Math.random() * (boundingBox.northeast.lng - boundingBox.southwest.lng);

    return await getMarker(randomLat, randomLng, false);
  };

  const addRandomMarkers = async () => {
    const randomMarkers: google.maps.LatLngLiteral[] = [];
    let tries = 0;
    while (randomMarkers.length < otherBallsCount && tries < maxTries) {
      const randomMarker = await addRandomMarker();
      if (randomMarker != null) {
        randomMarkers.push(randomMarker);
      }
      tries++;
      console.log("trying to add random point " + tries);
    }

    if (randomMarkers.length < otherBallsCount) {
      setMessage("Failed to randomly place 6 other Dragonballs");
      setOpen(true);
    }
    return randomMarkers;
  };

  function haversine(
    coord1: google.maps.LatLngLiteral,
    coord2: google.maps.LatLngLiteral
  ) {
    const toRadians = (degrees: number) => {
      return degrees * (Math.PI / 180);
    };

    const earthRadiusKm = 6371;

    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLon = toRadians(coord2.lng - coord1.lng);

    const lat1 = toRadians(coord1.lat);
    const lat2 = toRadians(coord2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusKm * c;
    return distance;
  }

  const calculateDistance = (markers: google.maps.LatLngLiteral[]): number => {
    let distance = 0;
    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        distance += haversine(markers[i], markers[j]);
      }
    }
    return distance;
  };

  const optimizeMarkers = async () => {
    if (markers != null) {
      let newMarkers = markers;
      for (let i = 1; i < newMarkers.length; i++) {
        for (let j = 0; j < maxMoves; j++) {
          const randomMarker = await addRandomMarker();
          if (randomMarker) {
            const oldMarker = newMarkers[i];
            newMarkers[i] = randomMarker;
            const newDistance = calculateDistance(newMarkers);
            console.info("new distance " + newDistance);
            if (newDistance > totalDistance) {
              setMarkers(newMarkers);
              setTotalDistance(newDistance);
              setCommand(
                `Current overall distance between all placed Dragonballs is ${newDistance.toFixed(
                  2
                )} km`
              );
            } else {
              newMarkers[i] = oldMarker;
            }
          }
        }
      }
    }
  };

  const onMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng != null) {
      const marker = await getMarker(e.latLng.lat(), e.latLng.lng(), true);
      if (marker != null) {
        const randomMarkers = await addRandomMarkers();

        const markers = [marker, ...randomMarkers];
        const distance = calculateDistance(markers);
        setCommand(
          `Current overall distance between all placed Dragonballs is ${distance.toFixed(
            2
          )} km`
        );
        setTotalDistance(distance);
        setMarkers(markers);
      }
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
          <Button variant="outlined">Outlined</Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {command}
          </Typography>
          {markers != null ? (
            <Button color="inherit" onClick={optimizeMarkers}>
              Optimize placement
            </Button>
          ) : null}
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
          {markers != null
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
