const apps = [
    { id: 'xbox-gamebar', name: 'Xbox Game Bar', package: 'Microsoft.XboxGamingOverlay', safe: false, size: '450MB' },
    { id: 'xbox-services', name: 'Xbox Gaming Services', package: 'Microsoft.GamingServices', safe: false, size: '320MB' },
    { id: 'groove', name: 'Groove Zene', package: 'Microsoft.ZuneMusic', safe: false, size: '180MB' },
    { id: 'films-tv', name: 'Filmek és TV', package: 'Microsoft.ZuneVideo', safe: false, size: '210MB' },
    { id: 'solitaire', name: 'Microsoft Solitaire', package: 'Microsoft.MicrosoftSolitaireCollection', safe: true, size: '150MB' },
    { id: 'candy1', name: 'Candy Crush Saga', package: 'king.com.CandyCrushSaga', safe: true, size: '280MB' },
    { id: 'candy2', name: 'Candy Crush Friends', package: 'king.com.CandyCrushFriends', safe: true, size: '250MB' },
    { id: 'candy3', name: 'Candy Crush Soda', package: 'king.com.CandyCrushSoda', safe: true, size: '260MB' },
    { id: 'news', name: 'Microsoft News', package: 'Microsoft.BingNews', safe: false, size: '120MB' },
    { id: 'skype', name: 'Skype', package: 'Microsoft.SkypeApp', safe: false, size: '190MB' },
    { id: '3dviewer', name: '3D Viewer', package: 'Microsoft.Microsoft3DViewer', safe: false, size: '140MB' },
    { id: 'paint3d', name: 'Paint 3D', package: 'Microsoft.MSPaint', safe: false, size: '220MB' },
    { id: 'mixedreality', name: 'Mixed Reality Portal', package: 'Microsoft.MixedReality.Portal', safe: false, size: '310MB' },
    { id: 'yourphone', name: 'Your Phone', package: 'Microsoft.YourPhone', safe: false, size: '170MB' },
    { id: 'tips', name: 'Tips / Segítség', package: 'Microsoft.GetHelp', safe: false, size: '90MB' }
];

async function changeTheme(value) {
    const isDark = await window.api.setTheme(value);
    updateThemeClass(isDark);
}

function updateThemeClass(isDark) {
    if (isDark) document.body.classList.remove('light-theme');
    else document.body.classList.add('light-theme');
}

document.addEventListener('DOMContentLoaded', async () => {
    const currentIsDark = await window.api.getCurrentTheme();
    updateThemeClass(currentIsDark);
    window.api.onThemeChanged(isDark => updateThemeClass(isDark));

    const isAdmin = await window.api.checkAdmin();
    if (!isAdmin) updateStatus('✅ Normál felhasználói módban', 'success');
    else updateStatus('⚠️ Rendszergazdai módban fut', 'warning');
    
    loadApps();
});

function loadApps() {
    const container = document.getElementById('appsGrid');
    container.innerHTML = '';
    apps.forEach(app => {
        const div = document.createElement('div');
        div.className = 'app-item';
        div.innerHTML = `
            <input type="checkbox" id="${app.id}" ${app.safe ? 'checked' : ''}>
            <span class="app-name">${app.name}</span>
            <span class="app-size">${app.size}</span>
        `;
        container.appendChild(div);
        div.querySelector('input').addEventListener('change', updateStats);
    });
    updateStats();
}

async function createRestorePoint() {
    updateStatus('🔄 Rendszertulajdonságok megnyitása...');
    await window.api.execCommand('SystemPropertiesProtection.exe');
}

async function restoreSystem() {
    await window.api.execCommand('rstrui.exe');
}

function updateStatus(message) {
    document.getElementById('statusText').textContent = message;
}

function selectSafe() {
    apps.forEach(app => {
        const cb = document.getElementById(app.id);
        if (cb) cb.checked = app.safe && !cb.disabled;
    });
    updateStats();
}

function selectAll() {
    document.querySelectorAll('#appsGrid input[type="checkbox"]').forEach(cb => {
        if (!cb.disabled) cb.checked = true;
    });
    updateStats();
}

function deselectAll() {
    document.querySelectorAll('#appsGrid input[type="checkbox"]').forEach(cb => cb.checked = false);
    updateStats();
}

function updateStats() {
    const checked = document.querySelectorAll('#appsGrid input[type="checkbox"]:checked');
    document.getElementById('selectedCount').textContent = checked.length;
    let size = 0;
    checked.forEach(cb => {
        const app = apps.find(a => a.id === cb.id);
        if (app) size += parseInt(app.size) || 0;
    });
    document.getElementById('spaceSaving').textContent = `~${size} MB`;
}

async function checkInstalledApps() {
    updateStatus('🔍 Telepített alkalmazások ellenőrzése...');
    
    // Megerősítés kérése
    const confirmed = await window.api.confirmElevated(
        'Az alkalmazások listájának lekéréséhez rendszergazdai jog szükséges.'
    );
    
    if (!confirmed) {
        updateStatus('❌ Művelet megszakítva.');
        return;
    }
    
    try {
        // Elevated parancs futtatása
        const res = await window.api.execElevated('Get-AppxPackage | Select-Object -ExpandProperty Name');
        const installed = res.stdout.toLowerCase();
        
        apps.forEach(app => {
            const cb = document.getElementById(app.id);
            if (cb) {
                const isPresent = installed.includes(app.package.toLowerCase());
                cb.disabled = !isPresent;
                cb.parentElement.style.opacity = isPresent ? '1' : '0.3';
                if (!isPresent) cb.checked = false;
            }
        });
        
        updateStatus('✅ Ellenőrzés kész.');
        updateStats();
    } catch (e) {
        updateStatus('❌ Hiba történt az ellenőrzés során.');
        console.error(e);
    }
}

async function startRemoval() {
    const checked = document.querySelectorAll('#appsGrid input[type="checkbox"]:checked');
    
    if (checked.length === 0) {
        alert('⚠️ Nincs kiválasztva alkalmazás!');
        return;
    }
    
    if (!confirm(`🗑️ Biztosan törlöd a kiválasztott ${checked.length} alkalmazást?`)) {
        return;
    }
    
    // Megerősítés kérése admin joghoz
    const confirmed = await window.api.confirmElevated(
        `${checked.length} alkalmazás törléséhez rendszergazdai jog szükséges.`
    );
    
    if (!confirmed) {
        updateStatus('❌ Törlés megszakítva.');
        return;
    }
    
    updateStatus('🔄 Alkalmazások törlése folyamatban...');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const cb of checked) {
        const app = apps.find(a => a.id === cb.id);
        
        try {
            updateStatus(`🔄 ${app.name} törlése...`);
            
            // Teljes csomagnév lekérése
            const find = await window.api.execElevated(`Get-AppxPackage *${app.package}* | Select-Object -ExpandProperty PackageFullName`);
            const fullName = find.stdout.trim();
            
            if (fullName) {
                // Csomag törlése
                await window.api.execElevated(`Remove-AppxPackage -Package '${fullName}'`);
                
                cb.disabled = true;
                cb.checked = false;
                cb.parentElement.style.opacity = '0.3';
                successCount++;
            }
        } catch (e) {
            console.error(`Hiba ${app.name} törlése közben:`, e);
            failCount++;
        }
    }
    
    updateStatus(`✅ Kész! Sikeres: ${successCount}, Sikertelen: ${failCount}`);
    updateStats();
}

function openPowerShellToolbox() {
    window.api.openExternal('https://pcegyszeregy.hu/powershelltoolbox/powershell-toolbox.html');
}