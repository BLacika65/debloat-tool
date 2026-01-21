const { contextBridge, ipcRenderer } = require('electron');

console.log("Preload script betöltve!");

contextBridge.exposeInMainWorld('api', {
    // Ablakkezelés
    minimize: () => {
        console.log("Minimize küldése...");
        ipcRenderer.send('window-minimize');
    },
    maximize: () => {
        console.log("Maximize küldése...");
        ipcRenderer.send('window-maximize');
    },
    close: () => {
        console.log("Close küldése...");
        ipcRenderer.send('window-close');
    },
    
    // Téma kezelés
    setTheme: (theme) => ipcRenderer.invoke('dark-mode:set', theme),
    getCurrentTheme: () => ipcRenderer.invoke('dark-mode:current'),
    onThemeChanged: (callback) => ipcRenderer.on('theme-changed', (event, isDark) => callback(isDark)),
    
    // PowerShell és külső linkek
    runPowerShell: (command) => ipcRenderer.invoke('run-powershell', command),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    
    // Admin jog ellenőrzés
    checkAdmin: () => ipcRenderer.invoke('check-admin'),
    
    // Normál parancs végrehajtás
    execCommand: (command, options) => ipcRenderer.invoke('exec-command', command, options),
    
    // ÚJ: Elevated (admin jogú) parancs végrehajtás
    execElevated: (command, options) => ipcRenderer.invoke('exec-elevated', command, options),
    
    // ÚJ: Megerősítő dialógus elevated művelethez
    confirmElevated: (message) => ipcRenderer.invoke('confirm-elevated', message)
});