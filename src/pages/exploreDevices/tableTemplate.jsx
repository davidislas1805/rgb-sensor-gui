// import { useNavigate } from 'react-router-dom';
// import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import './tableTemplate.css';

let connect_success_id;

function sendSelectedDevice(path) {
  connect_success_id = toast.loading("Connecting with serial device. Please wait...");
  window.ipcRenderer.send('exp-device-window:serial-device-name', path);
  document.querySelector('.content-pointer-event-none').style.pointerEvents = 'none';
};

window.ipcRenderer.on('main:serial-greet-success', (e, greet_success_msg) => {
  toast.update(connect_success_id, {render: 'Succesful connection, ESP32 says: ' + greet_success_msg, type: "success", isLoading: false, autoClose: 3000});
  console.log('succesful connection');
  
  toast.onChange(v => {
    if(v.type === 'success' && v.status === 'removed'){
      window.history.back();
    }
  });
  // setTimeout(() => {window.history.back()}, 3000);
});

window.ipcRenderer.on('main:serial-greet-error', (e) => {
  toast.update(connect_success_id, {render: 'Error when connecting, please check that you have selected the correct device', type: "error", isLoading: false, autoClose: 5000});
  console.log('error in connection');
  toast.onChange(v => {
    if(v.type === 'error' && v.status === 'removed'){
      document.querySelector('.content-pointer-event-none').style.pointerEvents = 'auto';
    }
  });
});


function SerialPortsTable({array}) {
  // const navigate = useNavigate();
  // const [pointerEvent, setPointerEvent] = useState(false);

  return (
    <div className="content-pointer-event-none">
      <table className="table table-striped">
        <tbody>
          {array.map((item) => {
            return (
              <tr key={ item } onClick={(e) => {
                sendSelectedDevice(item);
                // navigate(-1);
                }}>
                <td>{ item }</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ToastContainer />
    </div>
)};
export default SerialPortsTable;