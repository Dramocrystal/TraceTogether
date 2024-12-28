import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import DrawingCanvas from './DrawingCanvas';
import HostJoinPage from './HostJoinPage';

function App() {
  return (
    <div>
      {/* <DrawingCanvas /> */}
      <HostJoinPage />
    </div>
  );
};

export default App
