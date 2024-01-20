import { useState, useEffect } from 'react';
import SerialPortsTable from './tableTemplate';
import './tableTemplate.css';

let port_list = [];

function requestSerialPorts(){
    window.ipcRenderer.send('exp-device-window:request-ports');
};

// function greetSerialDevice() {
//     console.log('greeting device');
//     window.ipcRenderer.send('greet-serial-device');
// }


/*window.ipcRenderer.on('serial:device-list', async (e, ports) =>{
    port_list = await ports;
    console.log(port_list);
});*/

// function sendSelectedDevice(serial_device_name){
//     window.ipcRenderer.send('exp-device-window:serial-device-name', serial_device_name);
// };


function ExploreDeviceWindow() {
    const [serialDevices, setSerialData] = useState(false);
    
    useEffect(() => {
        let ignore = false; // Fire the request serial devices when component first renders
        if(!ignore){
            requestSerialPorts();
        }

        function getSerialDevices(){
            window.ipcRenderer.on('serial:device-list', async (e, ports) =>{
                port_list = await ports;
                // console.log(port_list);
                setSerialData(port_list);
            });
        }
        getSerialDevices();
        return () => { ignore = true; } // Prevent recall of function when component re-renders
    }, [setSerialData]);
    
    return (
        <div className="Explore-devices">
            <h1>Welcome to device explorer</h1>
            <div>
                {serialDevices ? <SerialPortsTable array={serialDevices}/> : <div>...</div> }
                {/* <SerialPortsTable array={serialDevices}/> */}
            </div> 
            <div className="content-pointer-event-none">
                <button id="load-btn" onClick={requestSerialPorts}>Load devices</button>
            </div>
        </div>
    );
}

export default ExploreDeviceWindow;