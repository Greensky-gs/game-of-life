import { app, BrowserWindow, IpcRenderer, ipcMain, dialog } from 'electron';

const path = require('path');
const { version } = require('../package.json');


const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 880,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
		roundedCorners: true,
		autoHideMenuBar: true,
		enableLargerThanScreen: true,
		show: false,
		icon: path.join(__dirname, 'assets/icon.ico'),
	});
	if (process.argv.includes('--dev')) {
		mainWindow.webContents.openDevTools({
			mode: "detach"
		});
	}

	mainWindow.setMinimumSize(1200, 880);
	mainWindow.show();
	mainWindow.setTitle(`Game of Life v${version}`);
	mainWindow.setFullScreen(true)
	mainWindow.loadFile(path.join(__dirname, 'pages/index.html'));
};

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

declare global {
	interface Window {
		electron: {
			ipcRenderer: IpcRenderer;
		};
	}
}
