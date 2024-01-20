import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HashRouter, Route, Routes, Link } from "react-router-dom";
import SideMenuBar from './pages/components/sideMenuBar';
import MainWindow from './pages/mainWindow/mainWindow';
import AboutWindow from './pages/about/aboutWindow';
import ExploreDeviceWindow from './pages/exploreDevices/exploreDevices';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/home" element={ <MainWindow /> } />
        <Route path='/deviceExplorer' element = { <AboutWindow />}/>
      </Routes>
      <SideMenuBar />
      
      {/* <Link to='/deviceExplorer'>
        <button>explore dev</button>
      </Link>
      <Link to='/home'>
        <button>home</button>
      </Link> */}
    </HashRouter>
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
// window.ipcRenderer.send('test-btn', 'hello')