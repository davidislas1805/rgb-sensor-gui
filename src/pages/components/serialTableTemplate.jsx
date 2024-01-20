import Table from 'react-bootstrap/Table';
import './serialTableTemplate.css';

function sendSelectedDevice(path) {
  window.ipcRenderer.send('exp-dev:loading-toast');
  window.ipcRenderer.send('exp-device-window:serial-device-name', path);
  window.ipcRenderer.send('exp-device:block-interactive-content');
  document.querySelector('.content-pointer-event-none').style.pointerEvents = 'none';
};

function SerialPortsTable({array}) {
  return (
    <div className="content-pointer-event-none">
      <Table striped bordered hover variant="dark">
        <tbody>
          {array.map((item) => {
            return (
              <tr key={ item } onClick={(e) => {
                sendSelectedDevice(item);
                }}>
                <td>{ item }</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
)};
export default SerialPortsTable;