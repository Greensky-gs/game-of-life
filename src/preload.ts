import { contextBridge, ipcRenderer, dialog } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: {
		on: (channel: any, func: any) => ipcRenderer.on(channel, func),
		send: (channel: any, data: any) => ipcRenderer.send(channel, data),
	},
});
