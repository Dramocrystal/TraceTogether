import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SlidingForm.css';

const HostJoinPage = () => {
  const [isHostMode, setIsHostMode] = useState(true);
  const [username, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const handleHost = () => {
    if (!username.trim()) {
      alert('Please enter your name to host a session.');
      return;
    }

    const ws = new WebSocket('ws://localhost:5000/socket/');

    ws.onopen = () => {
      const message = { type: 'host', name: username };
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (e) => {
      const response = JSON.parse(e.data);

      if (response.type === 'hosted') {
        const roomCode = response.code;
        alert(`Room hosted successfully! Your room code is ${roomCode}`);
        navigate('/canvas', { state: { mode: 'host', roomCode, username } });
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
      const message = { type: 'join', name: username, code: joinCode };
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (e) => {
      const response = JSON.parse(e.data);

      if (response.type === 'joined') {
        alert(`Joined room ${response.code}`);
        navigate('/canvas', { state: { mode: 'join', roomCode: joinCode, username } });
      } else if (response.type === 'error') {
        alert(`Error: ${response.message}`);
      }
    };
  };

  return (
    <div>
      <header className="welcome-header">
        <h1>Welcome to Trace Together</h1>
        <p>Your collaborative canvas platform for teamwork and creativity.</p>
      </header>
    <div className={`container ${isHostMode ? '' : 'active'}`} id="container">
      {/* Host Form */}
      <div className="form-container sign-up">
        <form>
          <h1>Host a Session</h1>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={username}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="button" onClick={handleHost}>
            Host Session
          </button>
        </form>
      </div>

      {/* Join Form */}
      <div className="form-container sign-in">
        <form>
          <h1>Join a Session</h1>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={username}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Join Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="button" onClick={handleJoin}>
            Join Session
          </button>
        </form>
      </div>

      {/* Toggle Panels */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Got a Room Code?</h1>
            <p>Join an existing session and collaborate with your team instantly.</p>
            <button
              type="button"
              className="hidden"
              id="login"
              onClick={() => setIsHostMode(true)}
            >
              Join Session
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Ready to Host?</h1>
            <p>Create a session and invite your team to collaborate in real-time.</p>
            <button
              type="button"
              className="hidden"
              id="register"
              onClick={() => setIsHostMode(false)}
            >
              Host Session
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default HostJoinPage;
