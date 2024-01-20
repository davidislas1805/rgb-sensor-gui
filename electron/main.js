const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const {SerialPort} = require('serialport');
const { DelimiterParser } = require("@serialport/parser-delimiter");
const serialFunctions = require('./serial_functions');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let serial_port;
let notify_no_dev_interval_id;
let serial_devices_list;
let serial_timeout_id;

let in_main_page = true;

let serial_options = {
    path: '',
    baudRate: 0,
};

async function getSerialPorts(){
    return await SerialPort.list();
}

function serialWrite(string){
    serial_port.write(string+'\n', (error) => {return});
}

function sendRGBValues(rgb_values){
    mainWindow.webContents.send('serial:rgb-values', rgb_values);
}

function sendBlackValues(black_values){
    mainWindow.webContents.send('serial:black-values', black_values);
}

function sendWhiteValues(white_values){
    mainWindow.webContents.send('serial:white-values', white_values);
}

function notifySerialCom(com_msg) {
    mainWindow.webContents.send('serial:com', com_msg);
}

function notifySerialError(){
    mainWindow.webContents.send('serial:serial-error');   
}

function notifySerialGreetSuccess(greet_success_msg){
    mainWindow.webContents.send('main:serial-greet-success', greet_success_msg);
    clearInterval(serial_timeout_id);
}

function notifySerialGreetError(){
    mainWindow.webContents.send('main:serial-greet-error');
    serial_port.close();
    serial_options.path = '';
    // mainWindow.webContents.send('main:activate-interactive-content');
}

function notifyNoDev(){
    mainWindow.webContents.send('main:no-device');
    // setTimeout(notifyNoDev, 6000);
}

function openSerialConnection(serial_path, baudRate = 115200){
    console.log('openning connection', serial_path);  // Notify of openning connection
    
    serial_options.path = serial_path;  // Pass the selected device and adjust de baudrate
    serial_options.baudRate = baudRate;
    
    serial_port = new SerialPort({
        path: serial_options.path,
        baudRate: serial_options.baudRate,
    });
    
    parser = serial_port.pipe(new DelimiterParser({delimiter: '\n'}));

    /*serial_port.write('1805\n', function(err) {
        if (err) {
            notifySerialGreetError();
            return console.log('Error on write: ', err.message);
        }
        serial_timeout_id = setTimeout(notifySerialGreetError, 6000);
    });
    
    parser.on('data', (data) => {
        serial_string = serialFunctions.deconcatSerialString(data.toString());
        (serial_string.id === 'avg readings') ? sendRGBValues(serial_string.msg) : (serial_string.id === 'black_values') ? sendBlackValues(serial_string.msg) : (serial_string.id === 'avg readings') ? sendWhiteValues(serial_string.msg) : (serial_string.id === 'serial com') ? notifyGreetDev(serial_string.msg) : notifySerialError();
        console.log(serial_string.msg);
        // console.log(data.toString());
    });*/
};

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: isDev ? 1000 : 1000,
        height: 550,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, './preload.js')
        }
    })

    mainWindow.loadURL('http://localhost:3000#/home');
    // mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
    // if(isDev) mainWindow.webContents.toggleDevTools();
};

app.whenReady().then(() => {
    createMainWindow();
    if(serial_options.path === '' || in_main_page){
        notify_no_dev_interval_id = setInterval(notifyNoDev, 6000);
    }
});

app.on('window-all-closed', async (e) => {
    mainWindow = null;  // Handle garbage collection
    serialWrite('serial close');
    await e.sender.send('close-connection');
    app.quit();
});

ipcMain.on('exp-dev:loading-toast', (e) => {
    e.sender.send('main:loading-toast');
});

ipcMain.on('mainWindow:success-close-dev-exp', (e) => {
    e.sender.send('exp-dev:success-close');
})

ipcMain.on('exp-device-window:request-ports', async (e) =>{
    serial_devices_list = await getSerialPorts();  // Waiting for the port list
    e.sender.send('serial:device-list', serial_devices_list.map((element) => {  // Sending the discovered devices path to renderer
        return element.path;
    }));
});

ipcMain.on('collapse-clear-toast', (e) => {
    clearInterval(notify_no_dev_interval_id);
    e.sender.send('collapse-mainBridge:dismiss-no-dev');
});

ipcMain.on('nav:in-exp-dev-win', (e) => {
    clearInterval(notify_no_dev_interval_id);
    e.sender.send('open-serial-dev');
});

ipcMain.on('collapse-no-dev-check', (e) => {
    console.log('collapse check')
    if(serial_options.path === ''){
        notify_no_dev_interval_id = setInterval(notifyNoDev, 6000);
    }
})

ipcMain.on('exp-device-window:serial-device-name', (e, selected_port) => {
    console.log(selected_port);
    openSerialConnection(selected_port);

    serial_port.write('1805\n', function(err) {  // Write test message to identify if correct device was selected
        if (err) {
            notifySerialGreetError();  // Notify and close if serial write throws an error
            return console.log('Error on write: ', err.message);
        }
        serial_timeout_id = setTimeout(notifySerialGreetError, 6000); // Notify and close if an answer is not recieved within 6 seconds
    });

    parser.on('data', (data) => {
        serial_string = serialFunctions.deconcatSerialString(data.toString());
        (serial_string.id === 'avg readings') ? sendRGBValues(serial_string.msg) : (serial_string.id === 'black values') ? sendBlackValues(serial_string.msg) : (serial_string.id === 'white values') ? sendWhiteValues(serial_string.msg) : (serial_string.id === 'successful greet') ? notifySerialGreetSuccess(serial_string.msg[0]) : (serial_string.id === 'serial com') ? notifySerialCom(serial_string.msg[0]) : notifySerialError();
        console.log(serial_string.msg);
        // console.log(data.toString());
    });

});

ipcMain.on('exp-device:block-interactive-content', (e) => {
    e.sender.send('block-interactive-content');
});

ipcMain.on('main:serial-set-black-values', (e) => {
    if (serial_options.path === ''){
        e.sender.send('main:no-serial-device');
        return
    };
    serialWrite('set black');
});

ipcMain.on('main:serial-set-white-values', (e) => {
    if (serial_options.path === ''){
        e.sender.send('main:no-serial-device');
        return
    };
    serialWrite('set white');
});

ipcMain.on('close-connection', async (e) => {
    console.log('closing connection');
    parser = null;
    await serial_port.close();
    serial_options.path = '';
});

/*ipcMain.on('greet-serial-device', (e) => {
    serial_port.write('1805\n', function(err) {
        if (err) {
          return console.log('Error on write: ', err.message)
        }
    })
});*/