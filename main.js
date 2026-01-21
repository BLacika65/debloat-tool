const { app, BrowserWindow, ipcMain, shell, Menu, nativeTheme, dialog } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

let mainWindow;

// Admin jog ellenőrzése
function checkAdminRights() {
    return new Promise((resolve) => {
        exec('net session', (error) => {
            resolve(!error);
        });
    });
}

// ELEVATED (admin jogú) parancs végrehajtása - natív megoldás
function executeElevated(command) {
    return new Promise((resolve, reject) => {
        // Ideiglenes PowerShell script készítése
        const tempScriptPath = path.join(app.getPath('temp'), `debloat-elevated-${Date.now()}.ps1`);
        
        // PowerShell script tartalma
        const scriptContent = `
try {
    ${command}
    exit 0
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
`;
        
        // Script fájl írása
        fs.writeFileSync(tempScriptPath, scriptContent, 'utf8');
        
        // PowerShell futtatása emelt jogokkal
        const psCommand = `Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "${tempScriptPath}"' -Verb RunAs -Wait -WindowStyle Hidden`;
        
        exec(`powershell -Command "${psCommand}"`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            // Temp fájl törlése
            try {
                if (fs.existsSync(tempScriptPath)) {
                    fs.unlinkSync(tempScriptPath);
                }
            } catch (e) {
                console.error('Temp file cleanup error:', e);
            }
            
            if (error) {
                reject({ error: error.message, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

// ELEVATED parancs kimenettel (stdout visszaadása)
function executeElevatedWithOutput(command) {
    return new Promise((resolve, reject) => {
        const tempScriptPath = path.join(app.getPath('temp'), `debloat-elevated-${Date.now()}.ps1`);
        const tempOutputPath = path.join(app.getPath('temp'), `debloat-output-${Date.now()}.txt`);
        
        // PowerShell script - kimenet fájlba írása
        const scriptContent = `
try {
    $output = ${command}
    $output | Out-File -FilePath "${tempOutputPath.replace(/\\/g, '\\\\')}" -Encoding UTF8
    exit 0
} catch {
    $_.Exception.Message | Out-File -FilePath "${tempOutputPath.replace(/\\/g, '\\\\')}" -Encoding UTF8
    exit 1
}
`;
        
        fs.writeFileSync(tempScriptPath, scriptContent, 'utf8');
        
        const psCommand = `Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "${tempScriptPath}"' -Verb RunAs -Wait -WindowStyle Hidden`;
        
        exec(`powershell -Command "${psCommand}"`, (error) => {
            // Kimenet olvasása
            let stdout = '';
            let stderr = '';
            
            try {
                if (fs.existsSync(tempOutputPath)) {
                    stdout = fs.readFileSync(tempOutputPath, 'utf8');
                }
            } catch (e) {
                stderr = e.message;
            }
            
            // Temp fájlok törlése
            try {
                if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
                if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
            } catch (e) {
                console.error('Temp file cleanup error:', e);
            }
            
            if (error && !stdout) {
                reject({ error: error.message, stderr: stderr || 'UAC was cancelled or command failed' });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

function createWindow() {
    Menu.setApplicationMenu(null);
    
    const isDarkAtStart = nativeTheme.shouldUseDarkColors;
    mainWindow = new BrowserWindow({
        width: 1079,
        height: 509,
        frame: false,
        resizable: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: isDarkAtStart ? '#1e1e1e' : '#f3f3f3',
            symbolColor: isDarkAtStart ? '#ffffff' : '#000000',
            height: 30
        },
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.ico'),
        autoHideMenuBar: true
    });

    mainWindow.on('will-resize', (event) => {
        event.preventDefault();
    });

    mainWindow.loadFile('index.html');

    nativeTheme.on('updated', () => {
        const isDark = nativeTheme.shouldUseDarkColors;
        mainWindow.setTitleBarOverlay({
            color: isDark ? '#1e1e1e' : '#f3f3f3',
            symbolColor: isDark ? '#ffffff' : '#000000',
            height: 30
        });
        mainWindow.webContents.send('theme-changed', isDark);
    });
}

// Ablakkezelő gombok
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});

// Téma kezelés
ipcMain.handle('dark-mode:set', (event, themeSource) => {
    nativeTheme.themeSource = themeSource;
    return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle('dark-mode:current', () => {
    return nativeTheme.shouldUseDarkColors;
});

// PowerShell futtatás (normál jogokkal)
ipcMain.handle('run-powershell', async (event, command) => {
    return new Promise((resolve, reject) => {
        exec(`powershell -Command "${command}"`, (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout);
        });
    });
});

// Külső link megnyitása
ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
    return true;
});

// Admin jog ellenőrzése
ipcMain.handle('check-admin', async () => {
    return await checkAdminRights();
});

// Normál parancs végrehajtás
ipcMain.handle('exec-command', async (event, command, options) => {
    return new Promise((resolve, reject) => {
        const opts = options || { maxBuffer: 1024 * 1024 * 10 };
        exec(command, opts, (error, stdout, stderr) => {
            if (error) reject({ error: error.message, stderr });
            else resolve({ stdout, stderr });
        });
    });
});

// ÚJ: Elevated parancs végrehajtás (UAC-val) - kimenettel
ipcMain.handle('exec-elevated', async (event, command, needsOutput = true) => {
    try {
        if (needsOutput) {
            return await executeElevatedWithOutput(command);
        } else {
            return await executeElevated(command);
        }
    } catch (error) {
        throw error;
    }
});

// ÚJ: Megerősítő dialógus elevated művelethez
ipcMain.handle('confirm-elevated', async (event, message) => {
    const result = await dialog.showMessageBox(mainWindow, {
        type: 'warning',
        buttons: ['Igen', 'Nem'],
        defaultId: 0,
        cancelId: 1,
        title: 'Rendszergazdai jog szükséges',
        message: message,
        detail: 'Ez a művelet rendszergazdai jogokat igényel. UAC megerősítés szükséges.'
    });
    
    return result.response === 0;
});

// App indítása
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});