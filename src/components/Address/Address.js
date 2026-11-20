import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaCheck,
} from "react-icons/fa";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./Address.css";


// ======================================================
// FIX LEAFLET DEFAULT MARKER ICON
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// ======================================================
// CHANGE MAP POSITION
// ======================================================

const ChangeMapView = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, {
        duration: 1.2,
      });
    }
  }, [position, map]);

  return null;
};


// ======================================================
// MAP CLICK HANDLER
// ======================================================

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      onLocationSelect([lat, lng]);
    },
  });

  return null;
};


// ======================================================
// MAIN COMPONENT
// ======================================================

const Addresses = () => {
  const navigate = useNavigate();

  // Default location - Delhi
  const defaultPosition = [28.6139, 77.2090];

  const [position, setPosition] = useState(defaultPosition);

  const [searchText, setSearchText] = useState("");

  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);

  const [savedAddress, setSavedAddress] = useState(null);


  // ======================================================
  // LOAD SAVED ADDRESS
  // ======================================================

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("selectedAddress")
    );

    if (saved) {
      setSavedAddress(saved);

      if (saved.latitude && saved.longitude) {
        setPosition([
          saved.latitude,
          saved.longitude,
        ]);
      }

      if (saved.address) {
        setAddress(saved.address);
      }
    }
  }, []);


  // ======================================================
  // SEARCH ADDRESS
  // ======================================================

  const handleSearch = async () => {
    if (!searchText.trim()) {
      alert("Please enter an address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          searchText
        )}`
      );

      const data = await response.json();

      if (data.length === 0) {
        alert("Location not found. Please try another address.");
        return;
      }

      const result = data[0];

      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      setPosition([lat, lon]);

      setAddress(result.display_name);

    } catch (error) {
      console.error(error);

      alert(
        "Unable to find this location. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // PRESS ENTER TO SEARCH
  // ======================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  // ======================================================
  // MAP LOCATION SELECT
  // ======================================================

  const handleLocationSelect = async (newPosition) => {
    setPosition(newPosition);

    try {
      const [lat, lng] = newPosition;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const data = await response.json();

      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error(error);
    }
  };


  // ======================================================
  // CURRENT LOCATION
  // ======================================================

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (location) => {
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;

        setPosition([lat, lng]);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          const data = await response.json();

          if (data.display_name) {
            setAddress(data.display_name);
            setSearchText(data.display_name);
          }
        } catch (error) {
          console.error(error);
        }

        setLocationLoading(false);
      },

      (error) => {
        console.error(error);

        setLocationLoading(false);

        alert(
          "Unable to get your location. Please allow location permission."
        );
      }
    );
  };


  // ======================================================
  // SAVE ADDRESS
  // ======================================================

  const handleSaveAddress = () => {
    if (!address) {
      alert("Please select a location first.");
      return;
    }

    const savedData = {
      address: address,
      latitude: position[0],
      longitude: position[1],
    };

    localStorage.setItem(
      "selectedAddress",
      JSON.stringify(savedData)
    );

    setSavedAddress(savedData);

    alert("Address saved successfully!");

    // Go back to account
    navigate("/account");
  };


  return (
    <div className="addresses-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="address-header">

        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>

        <h2>Choose Your Location</h2>

      </div>


      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="address-search">

        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search for area, street, city..."
          value={searchText}
          onChange={(e) =>
            setSearchText(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "..." : "Search"}
        </button>

      </div>


      {/* ==================================================
          CURRENT LOCATION
      ================================================== */}

      <button
        className="current-location-btn"
        onClick={handleCurrentLocation}
        disabled={locationLoading}
      >
        <FaLocationArrow />

        {locationLoading
          ? "Getting Location..."
          : "Use My Current Location"}
      </button>


      {/* ==================================================
          MAP
      ================================================== */}

      <div className="map-wrapper">

        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          className="map"
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          <ChangeMapView position={position} />


          <MapClickHandler
            onLocationSelect={
              handleLocationSelect
            }
          />


          <Marker position={position} />

        </MapContainer>

      </div>


      {/* ==================================================
          SELECTED LOCATION
      ================================================== */}

      <div className="selected-location">

        <div className="location-title">

          <FaMapMarkerAlt />

          <span>Selected Location</span>

        </div>


        <p>
          {address ||
            "Search for an address or tap on the map to select a location."}
        </p>

      </div>


      {/* ==================================================
          SAVE BUTTON
      ================================================== */}

      <button
        className="save-address-btn"
        onClick={handleSaveAddress}
      >

        <FaCheck />

        Save Address

      </button>


      {/* ==================================================
          SAVED ADDRESS
      ================================================== */}

      {savedAddress && (

        <div className="saved-address-card">

          <div className="saved-title">

            <FaCheck />

            Saved Address

          </div>

          <p>
            {savedAddress.address}
          </p>

          <small>
            Latitude: {savedAddress.latitude.toFixed(6)}
            <br />
            Longitude: {savedAddress.longitude.toFixed(6)}
          </small>

        </div>

      )}

    </div>
  );
};

export default Addresses;