import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Gallery() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(''); // State for error messages

  useEffect(() => {
    fetchImages(); // Fetch images when the component mounts
  }, []);

  const fetchImages = async () => {
    try {
        const imageResponse = await axios.get('https://swine-fever-backend.azurewebsites.net/retrieve-images');
        setImages(imageResponse.data);
    } catch (error) {
        console.error('Error fetching images:', error);
        setError('Error fetching images. Please try again.'); // Set error message
    }
  };

  return (
    <div className="gallery">
      <h2>Image Gallery</h2>
      <div className="image-grid">
        {images.map((image) => (
          <div className="image-item" key={image._id}>
            <img className="gallery-image" src={image.url} alt={`ID: ${image._id}`} />
            <div className="image-details">
              <p>Result: {image.metadata.result}</p>
              <p>Probability: {image.metadata.probability}%</p>
              <p>Username: {image.metadata.user}</p>
              <p>Organization: {image.metadata.org}</p>
              <p>Date: {image.metadata.date}</p>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Gallery;
