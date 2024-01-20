const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
    on: (channel, data) => ipcRenderer.on(channel, data),
    send: (channel, data) => ipcRenderer.send(channel, data),
});