import React, { useEffect, useRef } from 'react';

const CitySearch = ({ onCitySelected }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const loadAutocomplete = () => {
      if (!window.google) return; // Ensure Google API is loaded

      // Initialize the Autocomplete object with options
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'], // Restrict search to cities
        fields: ['geometry', 'name'], // Only request name and geometry
      });

      // Handle the city selection event
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const cityData = {
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          onCitySelected(cityData); // Pass selected city data to parent
        }
      });
    };

    if (window.google) {
      loadAutocomplete();
    } else {
      window.initAutocomplete = loadAutocomplete; // Setup a global function to be called when the API loads
    }
  }, [onCitySelected]);

  return (
    <div>
      <input
        type="text"
        ref={inputRef}
        placeholder="Enter a city"
        style={{ width: '90%', padding: '10px', marginTop: '45px' }}
      />
    </div>
  );
};

export default CitySearch;
