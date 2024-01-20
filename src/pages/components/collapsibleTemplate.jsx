import { useCollapse } from 'react-collapsed'
import { useState, useEffect } from 'react';
import SerialPortsTable from './serialTableTemplate'
import './collapsibleTemplate.css'

let port_list;
let collapse = false;
let prevCollapse = false;

function requestSerialPorts(){
  window.ipcRenderer.send('exp-device-window:request-ports');
};

export default function CollapsibleTemplate() {
  const [isCollapseBtnEnabled, setCollapseBtnEnabled] = useState(false);
  const [serialDevices, setSerialData] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

  useEffect(() => {
    let ignore = false; // Fire the request serial devices when component first renders
    if(!ignore){
      requestSerialPorts();
    }

    function getSerialDevices(){
      window.ipcRenderer.on('serial:device-list', async (e, ports) =>{
        port_list = await ports;
        setSerialData(port_list);
      });
    }

    function toggleSerialDev(){
      window.ipcRenderer.on('open-serial-dev', (e) => {
        setExpanded(true);
      });
      window.ipcRenderer.on('exp-dev:success-collapse', (e) => {
        setExpanded(false);
        setCollapseBtnEnabled(true);
      })
    }
    
    toggleSerialDev();
    getSerialDevices();
    return () => { ignore = true; } // Prevent recall of function when component re-renders
  }, [setSerialData, setExpanded, setCollapseBtnEnabled]);
    return (
    <div>
      <button className='openButton' {...getToggleProps(
        {
          onClick: () => {
            setExpanded((prevExpanded) => !prevExpanded);
            prevCollapse = collapse;
            collapse = !collapse;
            if(!collapse && prevCollapse) window.ipcRenderer.send('collapse-no-dev-check')
            else if(collapse) window.ipcRenderer.send('collapse-clear-toast');
          }}
      )} disabled={isCollapseBtnEnabled}></button>
      <div className='container'>
        <section {...getCollapseProps()}>
          {isExpanded ? 
            <div className='divCollapseWrapper'>
              <div>
                <div>
                  <SerialPortsTable array={serialDevices}/>
                </div> 
                <div className='reloadButtonWrapper'>
                  <button onClick={requestSerialPorts}>Reload</button>
                </div>
              </div>
            </div> 
            : <div></div>}
        </section>
      </div>
    </div>
)};