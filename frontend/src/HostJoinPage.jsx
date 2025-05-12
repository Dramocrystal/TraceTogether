import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  

  const symbols = ['✿', '✦', '❖', '♥', '✧', '♡', '♪', '♫', '✏️'];
  const floatingSymbols = useMemo(() => {
  return Array.from({ length: 100 }).map((_, i) => {
    const style = {
      position: 'absolute',
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      fontSize: `${Math.random() * 2 + 1}rem`,
      animation: `floatSymbols ${20 + Math.random() * 10}s linear infinite`,
      animationDelay: `-${Math.random() * 30}s`, // negative value = start midway
    };

    return (
      <span
        key={i}
        className={`pattern-symbol gold-shimmer`}
        style={style}
      >
        {symbols[i % symbols.length]}
      </span>
    );
  });
}, []);



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
      <div className="louis-pattern-bg">{floatingSymbols}</div>
      <h2>Trace Together</h2>
      <div className={`container ${isHostMode ? '' : 'active'}`} id="container">
        {/* Host Form */}
        <div className="form-container sign-up">
         <form onSubmit={(e) => {
            e.preventDefault();
            handleHost();
          }}>
            <h1>Host a Session</h1>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={username}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit">Host Session</button>
</form>

        </div>

        {/* Join Form */}
        <div className="form-container sign-in">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleJoin();
          }}>
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
            <button type="submit">Join Session</button>
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