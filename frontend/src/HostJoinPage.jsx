import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HostJoinPage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [username, setName] = useState('');
  const navigate = useNavigate();

  const handleHost = () => {
    if (!username.trim()) {
      alert('Please enter your name to host a session.');
      return;
    }

    const ws = new WebSocket('ws://localhost:5000/socket/');

    ws.onopen = () => {
      const message = {type : 'host', name: username};
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (e) => {
      const response = JSON.parse(e.data);

      if (response.type === 'hosted') {
        const roomCode = response.code;
        alert(`Room hosted successfully! Your room code is ${roomCode}`);
        navigate('/canvas', { state: { mode: 'host', roomCode, username: username } });
      } else if (response.type === 'error') {
        alert(`Error: ${response.message}`);
      }
    };

  };

  const handleJoin = () => {
    if (!username.trim() || !joinCode.trim()) {
      alert('Please enter both your name and the room code to join.');
      return;
    }

    const ws = new WebSocket('ws://localhost:5000/socket/');
    
    
    ws.onopen = () => {
      const message = {type : 'join', name: username, code: joinCode};
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (e) => {
      const response = JSON.parse(e.data);

      if (response.type === 'joined') {
        alert(`Joined room ${response.code}`);
        navigate('/canvas', { state: { mode: 'join', roomCode: joinCode, username: username } });
      } else if (response.type === 'error') {
          alert(`Error: ${response.message}`);
      } else if (response.type === 'notification') {
          console.log(response.message);
      }
    };
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome To TraceTogether</h1>
      <h3>Collaborate in real-time with others!</h3>

      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={username}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '250px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
      </div>

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