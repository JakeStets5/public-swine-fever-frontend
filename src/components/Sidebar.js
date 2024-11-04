import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CitySearch from './CitySearch.js';

/**
 * Sidebar component for all user operations about submitting and viewing information about cases.
 * It fetches and displays the count of positive and negative cases from the backend.
 * It displays statistics about reported cases. 
 *
 * @param {Object} props - React props
 * @param {Function} props.setCurrentView - Function to set the current view in the app
 */
const Sidebar = ({ onSignInClick, isSignedIn, onSignUpClick, username, organization }) => {
  const navigate = useNavigate(); // Use the navigate hook for routing

  // State variables for managing counts, user info, image handling, and loading states
  const [positiveCount, setPositiveCount] = useState(0); // State for positive case count
  const [negativeCount, setNegativeCount] = useState(0); // State for negative case count
  const [selectedFile, setSelectedFile] = useState(null); // State for the selected image file
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [loading, setLoading] = useState(false); // State for loading status during API calls
  const [prediction, setPrediction] = useState(null); // State for prediction result
  const [probability, setProbability] = useState(null); // State for prediction probability
  const [error, setError] = useState(null); // State for error messages
  const [selectedCity, setSelectedCity] = useState(null); // State for the selected city

  /**
   * Handles changes in the file input and sets the selected image.
   * Displays a preview of the selected image.
   *
   * @param {Event} event - The file input change event
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handles the prediction request when the user submits an image.
   * Validates user input and sends the image to the backend for analysis.
   */
  const handlePredict = async () => {
    const formData = new FormData();
    setPrediction(null); // Reset prediction state

    // Validate selected file
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }
    else{
      formData.append('image', selectedFile); // Append the selected image to the form data
    }

    // Validate user sign-in
    if (!isSignedIn) {
      alert('Please sign in before submitting.');
      return;
    }
    else{
      formData.append('user', username);
      formData.append('org', organization);
    }

    // Include the latitude and longitude from your selected location
    if (selectedCity) {
      formData.append('lat', selectedCity.lat);
      formData.append('lng', selectedCity.lng); 
    } else {
        alert("Please select a city first.");
        return;
    }

    setLoading(true); // Set loading state to true
    setError(null); // Clear any previous errors

    try {
      const response = await fetch('https://swine-fever-backend.azurewebsites.net/predict', {
        method: 'POST',
        body: formData, // Send the form data in the request body
      });
      // Handle response
      if (!response.ok) {
        throw new Error('Error in prediction request');
      }

      const result = await response.json(); // Parse JSON response
      const prediction = result.tagName; // Get the prediction from the response
      const probability = result.probability; // Get the prediction probability

      if(prediction === 'non-image'){
        throw new Error('No swine fever test detected. Ensure your swine fever test is the subject of your image.');
      }

      setPrediction(prediction); // Update state with the prediction result
      setProbability(probability); // Update state with the prediction probability
      console.log("Prediction Result:", result); // Log the prediction result for debugging

    } catch (err) {
      setError(err.message); // Handle errors
      console.error('Prediction Error:', err);

    } finally {
      setLoading(false); // Reset loading state
    }
  };

  /**
   * Handles city selection and updates the selected city state.
   *
   * @param {Object} cityName - The selected city object
   */
  const handleCitySearch = async (cityName) => {
    try {      
      if (cityName) {
        setSelectedCity({
          name: cityName.name,
          lat: cityName.lat,
          lng: cityName.lng,
        });

      } else {
        throw new Error("City not found");
      }
    } catch (err) {
      console.error("Error fetching location data:", err);
      setError("Could not find location. Please try again.");
    }
  };

  /**
   * Handles the event when a city is selected from the search.
   *
   * @param {Object} city - The selected city object
   */
  const handleCitySelected = (city) => {
    handleCitySearch(city); // Fetch location when a city is selected
  };
  
  /**
   * Removes the image preview and resets the selected file.
   */
  const removePreview = () => {
    setImagePreview(null); // Clear the image preview
    setSelectedFile(null); // Reset the selected file
    setPrediction(null);
  };

  /**
   * Fetches the counts of positive and negative cases from the API.
   * Updates the state with the fetched counts.
   */
  const fetchCounts = async () => {
    try {
      // Fetch the count of positive cases
      const positiveResponse = await fetch('https://swine-fever-backend.azurewebsites.net/api/positive-count');
      const positiveData = await positiveResponse.json(); // Parse the JSON response
      setPositiveCount(positiveData.positiveCount); // Update the state with the positive count
  
      // Fetch the count of negative cases
      const negativeResponse = await fetch('https://swine-fever-backend.azurewebsites.net/api/negative-count');
      if (!negativeResponse.ok) { // Check if the response is not OK
        const errorText = await negativeResponse.text();
        throw new Error(`Failed to fetch negative cases count: ${errorText}`);
      }
      const negativeData = await negativeResponse.json(); // Parse the JSON response
      setNegativeCount(negativeData.negativeCount); // Update the state with the negative count
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  // useEffect hook to fetch counts when the component mounts
  useEffect(() => {
    fetchCounts(); // Call fetchCounts to get the initial counts
  }, []); // Empty dependency array ensures this runs only on mount

  return (
    <div className="sidebar"> {/* Sidebar container */}
      <div className='nav-button-container'>
        <button className="nav-button" onClick={() => navigate('/gallery')}>
          View Image Gallery 
        </button>
        <button className="nav-button" onClick={() => navigate('/')}>
          View Map
        </button>
      </div>
      <button style={{marginTop: '33px'}} className="button" onClick={onSignUpClick}>Sign Up</button>
      <button className="button" onClick={onSignInClick}>Sign In</button>

      {/* CitySearch Component */}
      <CitySearch onCitySelected={handleCitySelected} />

      {/* File input for image selection */}
      <input style={{marginBottom: '45px'}}
        className="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      {/* Preview of the selected image */}
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Selected" style={{ width: 'auto', height: '300px' }} />
        </div>
      )}
      {/* Submit for Analysis Button */}
      <button className="button" onClick={handlePredict} disabled={loading && isSignedIn}>
        {loading ? 'Loading...' : 'Submit for Analysis'}
      </button>
      {prediction && (
        <div style={{paddingBottom: '15px'}} className="prediction-result">
          <h3>Prediction Result:</h3>
          <p>Result: {prediction}</p> {/* Display prediction result */}
          <p>Probability: {probability}</p>
        </div>
      )}
      <button className="button" onClick={removePreview}>
        Cancel
      </button>
      <button style={{marginTop: '45px', marginBottom: '-5px'}} className="button" onClick={fetchCounts}>Refresh Statistics</button>
      <div>
        <h3>Number of Reported Positive Cases: {positiveCount}</h3>
        <h3>Number of Reported Negative Cases: {negativeCount}</h3>
      </div>
      {error && <p className="error-message">{error}</p>} {/* Display error message */}
      
    </div>
  );
};

export default Sidebar;
