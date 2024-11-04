import React, { useState } from 'react';

const SignIn = ({ onSignInSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('https://swine-fever-backend.azurewebsites.net/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Send credentials in the body
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Call the parent function to handle successful sign-in
        onSignInSuccess(data);
      } else {
        // Handle error from server
        setError(data.error || 'Invalid username or password. Please try again.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div>
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>* Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>* Password:</label>
          <input
            type="password"
            value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <p style={{ fontSize: '0.9em' }}>
        * indicates required field</p>
      <button type="submit" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  </div>
  );
};

export default SignIn;
