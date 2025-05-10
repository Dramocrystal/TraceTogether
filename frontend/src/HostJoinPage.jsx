import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationContainer from './notification';
import { useWebSocket } from './WebSocketContext';
import './SlidingForm.css';

const HostJoinPage = () => {
  const [isHostMode, setIsHostMode] = useState(true);
  const [username, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();
  const notificationRef = useRef();
  const { sendMessage, addMessageListener } = useWebSocket();

  useEffect(() => {
    const handleMessage = (event) => {
      const response = JSON.parse(event.data);

      if (response.type === 'hosted') {
        const roomCode = response.code;
        notificationRef.current.addNotification(
          `Room hosted successfully! Your room code is ${roomCode}`,
          'success',
          3000
        );
        navigate('/canvas', { state: { mode: 'host', roomCode, username } });
      } else if (response.type === 'joined') {
        notificationRef.current.addNotification(
          `Successfully joined room ${response.code}`,
          'success',
          3000
        );
        navigate('/canvas', { state: { mode: 'join', roomCode: joinCode, username } });
      } else if (response.type === 'error') {
        notificationRef.current.addNotification(
          `Error: ${response.message}`,
          'error'
        );
      }
    };

    const cleanup = addMessageListener(handleMessage);
    return cleanup;
  }, [navigate, username, joinCode]);

  const handleHost = () => {
    if (!username.trim()) {
      notificationRef.current.addNotification(
        'Please enter your name to host a session.',
        'warning'
      );
      return;
    }

    sendMessage({ type: 'host', name: username });
    notificationRef.current.addNotification(
      'Connecting to server...',
      'other',
      2000
    );
  };

  const handleJoin = () => {
    if (!username.trim() || !joinCode.trim()) {
      notificationRef.current.addNotification(
        'Please enter both your name and the room code to join.',
        'warning'
      );
      return;
    }

    sendMessage({ type: 'join', name: username, code: joinCode });
    notificationRef.current.addNotification(
      'Connecting to session...',
      'other',
      2000
    );
  };

  return (
    <div>
      <NotificationContainer ref={notificationRef} />
      <header className="welcome-header">
        <h1>Welcome to Trace Together!!!</h1>
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