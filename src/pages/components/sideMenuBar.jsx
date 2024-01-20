import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SerialPortsTable from './serialTableTemplate'
import './sideMenuBar.css'

let port_list;
let showDevExp = false;
let prevShowDevExp = false;

function requestSerialPorts(){
    window.ipcRenderer.send('exp-device-window:request-ports'); 
}

function openSerialExp(){
    document.getElementById("device-explorer-tab").style.width = "250px";
    document.getElementById("sideMenuBar").style.pointerEvents = "none";
    requestSerialPorts();
    prevShowDevExp = showDevExp;
    showDevExp = !showDevExp;
    if(!showDevExp && prevShowDevExp) window.ipcRenderer.send('collapse-no-dev-check')
    else if(showDevExp) window.ipcRenderer.send('collapse-clear-toast');
}

function closeSerialExp(){
    document.getElementById("device-explorer-tab").style.width = "0";
    document.getElementById("sideMenuBar").style.pointerEvents = "auto";
    prevShowDevExp = showDevExp;
    showDevExp = !showDevExp;
    if(!showDevExp && prevShowDevExp) window.ipcRenderer.send('collapse-no-dev-check')
    else if(showDevExp) window.ipcRenderer.send('collapse-clear-toast');
}

window.ipcRenderer.on('block-interactive-content', () => {
    document.querySelector('.reload-btn').style.pointerEvents = 'none';
    document.querySelector('.close-btn').style.pointerEvents = 'none';
    document.querySelector('.buttonWrapper').style.pointerEvents = 'none';
});

window.ipcRenderer.on('open-serial-dev', (e) => {
    openSerialExp();
});

window.ipcRenderer.on('exp-dev:success-close', (e) => {
    closeSerialExp();
});

export default function SideMenuBar(){
    const [serialDevices, setSerialData] = useState(false);
    useEffect(() => {
        function getSerialDevices(){
          window.ipcRenderer.on('serial:device-list', async (e, ports) =>{
            port_list = await ports;
            setSerialData(port_list);
          });
        }
    
        getSerialDevices();
      }, [setSerialData]);
    return(
        <div>
            <div id="sideMenuBar" className="sidenav">
                <div id='home'>
                    <Link to='/home'>
                        <svg height="25px" width="100%">
                            <circle cx="12" cy="12" r="5" style={{fill: 'white', stroke: 'white'}}/>
                        </svg>
                    </Link>
                </div>
                <div id='device-connect'>
                    <button className='openButton' onClick={openSerialExp}/>
                </div>
                <div id='about'>
                    <Link to='/deviceExplorer'>
                        <button className='aboutButton'>About</button>
                    </Link>
                </div>
                <div id='repository'>
                    <Link to='/deviceExplorer'>
                        <button className='aboutButton'>Repository</button>
                    </Link>
                </div>
            </div>
            <div id='device-explorer-tab'>
                <div className='reload-btn-wrapper'><button className='reload-btn' onClick={requestSerialPorts}>Reload</button></div>
                <div className='close-btn-wrapper'><button className='close-btn' onClick={closeSerialExp}>&times;</button></div>
                <div>
                    {serialDevices ? <SerialPortsTable array={serialDevices}/> : <div/>}
                </div>
            </div>
        </div>
    )
}