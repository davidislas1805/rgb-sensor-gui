import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './mainWindow.css'
import Stream from '../components/Stream';
import ReactSlider from "react-slider";
import { Link } from 'react-router-dom';

let serial_rgb_values = [0,0,0];
let no_device_toast_id = null;
let connect_success_id = null;

function dismissNoDevToast(){
    toast.dismiss(no_device_toast_id);
    window.ipcRenderer.send('nav:in-exp-dev-win');
};

function setBlack(){
    window.ipcRenderer.send('main:serial-set-black-values');
};

function setWhite(){
    window.ipcRenderer.send('main:serial-set-white-values');
};

window.ipcRenderer.on('main:loading-toast', (e) => {
  connect_success_id = toast.loading("Connecting with serial device. Please wait...", {position: 'top-left', theme: 'dark'});
});

window.ipcRenderer.on('main:serial-greet-error', (e) => {
  toast.update(connect_success_id, {render: 'Error when connecting, please check that you have selected the correct device', type: "error", isLoading: false, autoClose: 5000});
  toast.onChange(v => {
    if(v.type === 'error' && v.status === 'removed'){
      document.querySelector('.content-pointer-event-none').style.pointerEvents = 'auto';
      document.querySelector('.reload-btn').style.pointerEvents = 'auto';
      document.querySelector('.close-btn').style.pointerEvents = 'auto';
      document.querySelector('.buttonWrapper').style.pointerEvents = 'auto';
    }
  });
});

window.ipcRenderer.on('main:serial-greet-success', (e, greet_success_msg) => {
    toast.update(connect_success_id, {render: 'Succesful connection, ESP32 says: ' + greet_success_msg, type: "success", isLoading: false, autoClose: 3000});
    
    toast.onChange(v => {
      if(v.type === 'success' && v.status === 'removed'){
        // window.history.back(); // Mover el toast container al main y mandar mensaje cuando se haga click
        e.sender.send('mainWindow:success-close-dev-exp');
        document.querySelector('.buttonWrapper').style.pointerEvents = 'auto';
      }
    });
});

window.ipcRenderer.on('main:no-serial-device', (e) => {
    toast.warn('You cannot set Black/White values because there is no device connected...', {position: 'bottom-right', theme: 'dark', type: 'warning', isLoading: false, autoClose: 3000});
});

window.ipcRenderer.on('main:no-device', (e) => {
    no_device_toast_id = toast.warn(
        <div>
            {/* <Link to={'/deviceExplorer'} onClick={dismissNoDevToast} style={{ textDecoration: 'none', color: '#808080'}}>Warning no serial device is connected!</Link> */}
            <Link onClick={dismissNoDevToast} style={{ textDecoration: 'none', color: '#808080'}}>Warning no serial device is connected!</Link>
        </div>, {
            toastId: 'no-device-warn-toast',
            position: "bottom-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
    });
});

window.ipcRenderer.on('serial:com', (e, greet_msg) => {
    toast.info(greet_msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });
});

window.ipcRenderer.on('collapse-mainBridge:dismiss-no-dev', () => {
    toast.dismiss(no_device_toast_id);
});

window.ipcRenderer.on('serial:serial-error', () => {
    console.log('serial error');
});

function MainWindow() {
    const [serialData, setSerialData] = useState(false);
    const [sliderMark, setSliderMark] = useState(250);
    const [blackValues, setBlackValues] = useState(['-', '-', '-']);
    const [whiteValues, setWhiteValues] = useState(['-', '-', '-']);
    useEffect(() => {
        function getRGBData(){
            window.ipcRenderer.on('serial:rgb-values', (e, rgb_values) => {
                console.log(rgb_values);
                serial_rgb_values = rgb_values;
                setSerialData(serial_rgb_values);
            });
        }
        function getBlackValues(){
            window.ipcRenderer.on('serial:black-values', (e, black_values) => {
                setBlackValues(black_values);
            });
        }
        function getWhiteValues(){
            window.ipcRenderer.on('serial:white-values', (e, white_values) => {
                setWhiteValues(white_values);
            });
        }

        getRGBData();
        getBlackValues();
        getWhiteValues();
    }, [setSerialData, setBlackValues, setWhiteValues]);
    return (
        <div className="MainWindow" style={{width: '100%', height: '100%'}}>
            <div className='right-Panel'>
                <Stream serial_data={serialData}/>
            </div>
            <div className='left-Panel'>
                <div className='divBorderLine'>
                    <svg className='svgBorderLine' viewBox='0 0 5 522'>
                        <line x1="0" y1="0" x2="0" y2="100%" stroke="#ddd"/>
                    </svg>
                </div>
                <div className='divContainer'>
                    <div className='divWrapper'>
                        <div className='divSubWrapper'>
                            <div>
                                <svg className='svgRectWrapper' viewBox='0 0 85 85'>
                                    <rect className='rgbResultBox' x={0} y={0} rx={15} ry={15} style={{fill: `rgb(${serialData[0]},${serialData[1]},${serialData[2]})`}}/>
                                </svg>
                            </div>
                            <div>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{serialData ? `${serialData[0]}` : 0 }</text>
                                    </svg>
                                </span>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{serialData ? `${serialData[1]}` : 0 }</text>
                                    </svg>
                                </span>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{serialData ? `${serialData[2]}` : 0 }</text>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='divWrapperTitle'>
                        <span className='spanWrapperTitle'>Thresholds</span>
                    </div>
                </div>
                <div className='divContainer' style={{height: '80px'}}>
                    <div className='divWrapper' style={{height: '80px', width: '290px'}}>
                        <div className='divSubWrapper2'>
                            <div>
                                <span className='keyText'>Black Threshold</span>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{`${blackValues[0]}`}</text>
                                    </svg>
                                </span>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{`${blackValues[1]}`}</text>
                                    </svg>
                                </span>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{`${blackValues[2]}`}</text>
                                    </svg>
                                </span>
                            </div>
                            <div>
                                <span className='keyText'>White Threshold</span>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{`${whiteValues[0]}`}</text>
                                    </svg>
                                </span>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{`${whiteValues[0]}`}</text>
                                    </svg>
                                </span>
                                <span className='spanWrapper'>
                                    <svg className='svgSerialBox'>
                                        <rect className='rectBox' x={0} y={0} rx={5} ry={5}/>
                                        <text className='rectBoxText' x={'50%'} y={'50%'} dominantBaseline={'middle'} textAnchor='middle'>{`${whiteValues[0]}`}</text>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <p></p>
                <div>
                    <div className='divWrapperTitle'>
                        <span className='spanWrapperTitle'>LED On Time</span>
                    </div>
                </div>
                <div className='sliderContainer'>
                    <div className='sliderWrapper'>
                        <div className='sliderSubWrapper'>
                            <ReactSlider className="customSlider" trackClassName="customSlider-track" thumbClassName="customSlider-thumb" min={250} max={1000} onChange={(value) => setSliderMark(value)} /*renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}*//>
                        </div>
                    </div>
                </div>
                <p></p>
                <div className='buttonContainer'>
                    <div className='buttonWrapper'>
                        <div className='divSubWrapper2'>
                            <button id='set-black' onClick={setBlack}>Set Black</button>
                            <button id='set-black' onClick={setWhite}>Set White</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div><Stream serial_data={serialData}/></div> */}
            {/* <div className='interactions'>
                <button id='Test' onClick={reactDoneNotify}>Test</button>
                <button id='notify' onClick={reactNotify}>Toast</button>
            </div> */}
            {/* <div className='interactions'>
                <button id='serial-greeting' onClick={greetSerialDevice}>Greet</button>
            </div> */}
            <ToastContainer />
        </div>
    );
}

export default MainWindow;