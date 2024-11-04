import './App.css'; // Importing custom styles
import Sidebar from './components/Sidebar'; // Importing the Sidebar component
import Gallery from './components/Gallery'; // Importing the Gallery component
import SignUp from './components/SignUp'; // Importing the SignUp component
import SignIn from './components/SignIn'; // Importing the SignIn component
import 'leaflet/dist/leaflet.css'; // Leaflet CSS for map styling
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Importing map components from React-Leaflet
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importing Router components for navigation
import MarkerClusterGroup from 'react-leaflet-cluster'; // Component for clustering markers on the map
import React, { useEffect, useState, useRef } from 'react'; // Importing React core library for functional components and hooks
import L from 'leaflet'; // Leaflet library for map functionality

// Custom marker icon configuration using Leaflet
const customIcon = new L.Icon({
  iconUrl: require('./assets/location_icon.png'), // URL for the marker icon image
  iconSize: [15, 25], // Size of the icon in pixels
  iconAnchor: [12, 41], // Anchor position of the icon relative to its size
});

/**
 * Main application component that renders the map and sidebar.
 *
 * This component fetches data about positive cases and displays them on a Leaflet map,
 * with markers clustered for better visualization.
 */
const App = () => {
  // State variables to manage application data
  const [cases, setCases] = useState([]); // State to store fetched case data
  const [currentView, setCurrentView] = useState('home'); // Current view in the sidebar
  const [isMapLoaded, setIsMapLoaded] = useState(false); // State to check if the map is loaded
  const [autocomplete, setAutocomplete] = useState(null); // State to store the Autocomplete instance
  const [selectedCity, setSelectedCity] = useState(null); // State for selected city
  const [isSignUpVisible, setIsSignUpVisible] = useState(false);
  const [isSignInVisible, setIsSignInVisible] = useState(false);  
  const [username, setUsername] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false); // Boolean: if the user is signed in
  const [latLng, setLatLng] = useState(null); // State for latitude and longitude
  const [mapboxApiKey, setMapboxApiKey] = useState(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null);
  const inputRef = useRef(null); // Ref for the input element

  const handleSignIn = () => {
    setIsSignInVisible(true);
  }; 

  const handleCloseSignIn = () => {
    setIsSignInVisible(false);
  };

  const handleSignInSuccess = (data) => {  
    setIsSignedIn(true); // Update the signed-in state
    setUsername(data.username); // Set the username state
    setOrganization(data.organization); // Set the organization state
  
    // Close the sign-up modal if you're using one
    setIsSignInVisible(false);
  };

  // Function to show the sign-up modal
  const handleShowSignUp = () => {
    setIsSignUpVisible(true);
  };

  const handleCloseSignUp = () => {
    setIsSignUpVisible(false);
  };

  const handleSignUpSuccess = (data) => {
    setUsername(data.username); // Set the username state
    setIsSignedIn(true);
    setOrganization(data.organization); // Set the organization state

    // Close the sign-up modal if you're using one
    setIsSignUpVisible(false);
  };

  // useEffect to fetch API keys only once
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch('https://swine-fever-backend.azurewebsites.net/api/keys'); // API endpoint to fetch keys
        if (!response.ok) {
          const errorMsg = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorMsg}`);
        }
        const data = await response.json();
        setMapboxApiKey(data.mapboxApiKey); // Update state with Mapbox key
        setGoogleMapsApiKey(data.googleMapsApiKey); // Update state with Google Maps key
      } catch (error) {
        console.error('Error fetching keys:', error);
      }
    };
    fetchKeys();
  }, []); // Run only once on mount

  // Script loader function
  const loadGoogleMapsScript = async () => {
    return new Promise((resolve, reject) => {
      // Check if Google Maps and Places library are already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve(); // If already loaded, resolve the promise
        return;
      }
  
      // Check if a script is already added
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      
      if (existingScript) {
        // If script already exists, wait for it to load
        existingScript.onload = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            resolve();
          } else {
            reject(new Error("Google Maps Places library is not available."));
          }
        };
        return;
      }
  
      // If no existing script, create a new one
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&v=3.58`;
      script.async = true;
      script.defer = true;
  
      // Handle loading errors
      script.onerror = () => reject(new Error("Google Maps API could not load."));
      
      // Once the script loads, check for Places library
      script.onload = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
        } else {
          reject(new Error("Google Maps Places library is not available."));
        }
      };
  
      // Append the script to the document
      document.head.appendChild(script);
    });
  };

  // UseEffect for loading Google Maps API and initializing Autocomplete
  useEffect(() => {
    if (!isMapLoaded && googleMapsApiKey) {
      // Load Google Maps script
      loadGoogleMapsScript(googleMapsApiKey)
        .then(() => {
          console.log("Google Maps API loaded successfully");
          setIsMapLoaded(true); // Mark map as loaded

          // Initialize Autocomplete once the map is loaded and inputRef is available
          if (inputRef.current) {
            const input = inputRef.current;
            console.log("inputRef is initialized:", input);

            if (window.google && window.google.maps && window.google.maps.places) {
              try {
                // Create a new Autocomplete instance
                const autocomplete = new window.google.maps.places.Autocomplete(input);

                // Add listener for place selection
                autocomplete.addListener('place_changed', () => {
                  const place = autocomplete.getPlace();
                  console.log('Selected place:', place);

                  if (place.geometry) {
                    const location = place.geometry.location;
                    setLatLng({ lat: location.lat(), lng: location.lng() }); // Set lat/lng state
                    input.value = place.formatted_address || "Location selected";
                  } else {
                    input.value = "Undefined"; // Handle undefined case
                  }
                });

                setAutocomplete(autocomplete); // Store the autocomplete instance
              } catch (error) {
                console.error("Error initializing Autocomplete:", error);
              }
            } else {
              console.error("Google Maps API is not properly loaded.");
            }
          } else {
            console.warn("inputRef is not yet available.");
          }
        })
        .catch((error) => {
          console.error("Error loading Google Maps API:", error);
        });
    }
  }, [isMapLoaded, googleMapsApiKey, inputRef]); // Ensure all relevant dependencies are included

    // Separate useEffect for fetching cases
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('https://swine-fever-backend.azurewebsites.net/api/cases'); // API endpoint to fetch cases
        if (!response.ok) {
          const errorMsg = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorMsg}`);
        }
        const data = await response.json();
        setCases(data); // Update the state with fetched data
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };

    fetchCases(); // Initial fetch of case data
    const interval = setInterval(fetchCases, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []); // This effect runs only once on mount

  return (
    <Router>
      <div className="App" style={{ display: 'flex' }}>
        <Sidebar 
        isSignedIn={isSignedIn}
        organization={organization}
        username={username}
        onSignUpClick={handleShowSignUp} 
        onSignInClick={handleSignIn}
        isMapLoaded={isMapLoaded} 
        selectedCity={selectedCity} 
        setCurrentView={setCurrentView} /> {/* Pass function to Sidebar for view management */}

        <div style={{ flex: 1 }}> {/* Ensuring the main content takes available space */}
          <Routes>
            <Route path="/" element={
              <div className="content">
                <div className="header-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                  {isSignedIn ? (
                    <p style={{ fontSize: '20px', margin: 0}}>Hello, {username}!</p>
                  ) : (
                    <p style={{ fontSize: '20px', margin: 0}}>Please sign in</p>
                  )}
                  <h1 style={{ flex: 1, textAlign: 'center', margin: 20 }}>Welcome to the African Swine Fever Analysis App</h1>
                </div>
                <MapContainer center={[51.505, -0.09]} zoom={4} style={{ height: "100%", width: "100%" }}>
                  {/* MapContainer for rendering the map with specified center and zoom */}
                  <TileLayer
                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxApiKey}`}
                    attribution='&copy; <a href="https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css" rel="stylesheet"'
                  />
                  
                  <MarkerClusterGroup>
                    {/* Group markers to cluster them for better visibility */}
                    {cases.map((caseData, index) => (
                      <Marker key={index} position={[caseData.lat, caseData.lng]} icon={customIcon}>
                        {/* Marker for each case with position and custom icon */}
                        <Popup>
                          <div>
                            <h3>Case Details</h3>
                            <p>Positive Case</p>
                            <p>Probability: {caseData.prob}</p>
                            <p>Username: {caseData.user}</p>
                            <p>Organization: {caseData.org}</p>
                            <p>Date: {caseData.date}</p>
                            
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                </MapContainer>
              </div>
            } />
            <Route path="/gallery" element={<Gallery />} /> {/* Path to "/gallery" */}
          </Routes>
        </div>
        {isSignUpVisible && (
          <div className="signup-backdrop" onClick={handleCloseSignUp}>
            <div className="signup-modal" onClick={(e) => e.stopPropagation()}>
              <SignUp onSignUpSuccess={handleSignUpSuccess} onClose={handleCloseSignUp} />
            </div>
          </div>
        )}
        {isSignInVisible && (
          <div className="signup-backdrop" onClick={handleCloseSignIn}>
            <div className="signup-modal" onClick={(e) => e.stopPropagation()}>
              <SignIn onSignInSuccess={handleSignInSuccess} onClose={handleCloseSignIn} />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;