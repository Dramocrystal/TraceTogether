import React, { useState } from 'react';

const HostJoinPage = ({ onHost, onJoin }) => {
  const [joinCode, setJoinCode] = useState('');

  const handleHost = () => {
    console.log("Hosting a new session");
  };

  const handleJoin = () => {
    if (joinCode.trim() === '') {
      alert('Please enter a valid code.');
      return;
    }
    console.log("The join code is", joinCode);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome To TraceTogether</h1>
      <h3>Collaborate in real-time with others!</h3>

      {/* Hosting Section */}
      <div style={{ margin: '20px 0' }}>
        <button
          onClick={handleHost}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Host a New Session
        </button>
      </div>

      <hr style={{ width: '50%', margin: '30px auto' }} />

      {/* Joining Section */}
      <div style={{ margin: '20px 0' }}>
        <h2>Join an Existing Session</h2>
        <input
          type="text"
          placeholder="Enter Join Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '250px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
        <br />
        <button
          onClick={handleJoin}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Join Session
        </button>
      </div>
    </div>
  );
};

export default HostJoinPage;
