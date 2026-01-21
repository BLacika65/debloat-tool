# 🗑️ PC Egyszeregy Debloat Tool

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-blue)

A lightweight, open-source **Electron** application designed to help users clean up Windows by removing pre-installed "bloatware" apps, freeing up disk space, and improving system privacy.

## 🚀 Features & Technical Details

### 📦 App Removal (Debloat)

The tool allows you to uninstall built-in Windows applications using PowerShell. It targets apps like:

- **Entertainment:** Groove Music, Films & TV, Microsoft Solitaire Collection
- **Gaming:** Xbox Game Bar, Xbox Gaming Services, Candy Crush games (Saga, Friends, Soda)
- **Social & Communication:** Skype, Your Phone
- **Creative Tools:** 3D Viewer, Paint 3D, Mixed Reality Portal
- **Other:** Microsoft News, Tips/Get Help

### 🛡️ Security & Reliability

- **Restore Point Access:** Integration to create a System Restore point before making changes
- **UAC Elevation:** Requests administrative privileges only when executing removal commands
- **Temporary Scripting:** Executes commands via temporary, isolated PowerShell scripts to prevent system conflicts
- **Safe by Default:** Pre-selects only safe-to-remove applications

### 🎨 User Experience

- **Dark/Light/System Theme:** Automatically adapts to Windows theme or allows manual selection
- **Portable & Installable:** Available as both portable .exe and installer
- **Space Savings Preview:** Shows estimated disk space that will be freed
- **Installation Check:** Verifies which apps are actually installed before removal

## 📥 Download

- **Portable version:** [Download DebloatTool-Portable.exe](https://github.com/BLacika65/debloat-tool/releases/latest)
- **Installable version:** Coming soon

### System Requirements

- Windows 10 (64-bit) or Windows 11
- Administrator privileges (only for app removal)
- ~70MB free disk space

### 🛡️ Windows SmartScreen Notice

On first run, Windows may show a SmartScreen warning. This is normal for new applications:

1. Click **"More info"**
2. Click **"Run anyway"**

The application all source code is available for review in this repository.

## 🖥️ How It Works

1. The app detects installed Windows packages via PowerShell
2. User selects apps to remove
3. Requests UAC elevation when "Delete Selected" is clicked
4. Generates a temporary `.ps1` script in the system temp folder
5. Executes via `Start-Process powershell -Verb RunAs` with admin rights
6. Cleans up temporary files after completion

**Technical Stack:**
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Electron 28.0.0, Node.js
- **System Integration:** PowerShell, Windows API

## 🔧 Installation for Developers

To run this project locally:

### 1. Clone the repository:
```bash
git clone https://github.com/BLacika65/debloat-tool.git
cd debloat-tool
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Run in development mode:
```bash
npm start
```

### 4. Build for production:
```bash
npm run build
```

The built executable will be in the `dist/` folder.

## 📦 Production & Releases

 [Releases](https://github.com/BLacika65/debloat-tool/releases) section once the process is complete.

### Build Configuration

- **Portable version:** No installation required, runs from any location
- **Installer version:** Coming soon

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

## 👨‍💻 Author

**PC Egyszeregy**
- Website: [pcegyszeregy.hu](https://pcegyszeregy.hu)

## ⚠️ Disclaimer

This tool is provided for educational and personal use. Always create a system restore point before making changes. The developer is not responsible for any system issues that may arise from improper use.

---

# Magyar leírás

## Mi ez?

Ez egy **nyílt forráskódú eszköz**, amellyel könnyedén eltávolíthatod a Windows előre telepített, felesleges alkalmazásait (pl. Xbox, Candy Crush, Groove Music, Skype). A program segít **tárhelyet felszabadítani** és **letiltani a kéretlen háttérfolyamatokat**.

## ✨ Főbb funkciók

- ✅ **15+ bloatware eltávolítása** egy kattintással
- ✅ **Visszaállítási pont kezelés** a biztonság érdekében
- ✅ **Sötét/világos/rendszer téma** automatikus váltással
- ✅ **Hely megtakarítás előnézete** (~3-4 GB)
- ✅ **Hordozható verzió** - nincs telepítés!

## 🚀 Használat

1. Töltsd le a **DebloatTool-Portable.exe** fájlt a [Releases](https://github.com/BLacika65/debloat-tool/releases) oldalról
2. Dupla kattintás az indításhoz (nincs telepítés!)
3. Válaszd ki a törölni kívánt alkalmazásokat
4. Kattints a **"Kijelöltek törlése"** gombra
5. Engedélyezd a rendszergazdai jogot (UAC ablak)
6. Kész! Az alkalmazások eltávolításra kerültek

## 🛡️ Biztonság

- **Rendszergazdai jog:** A program **csak a tényleges törlésnél** kér emelt szintű hozzáférést (UAC)
- **Visszaállítás:** Bármikor létrehozhatsz visszaállítási pontot a módosítások előtt
- **Átlátható:** Teljes forráskód elérhető ellenőrzésre
- **Vírusmentes:** VirusTotal eredmény: 0/64

## 📋 Eltávolítható alkalmazások

- Xbox Game Bar & Gaming Services
- Groove Zene
- Filmek és TV
- Microsoft Solitaire
- Candy Crush játékok (3 darab)
- Microsoft News
- Skype
- 3D Viewer & Paint 3D
- Mixed Reality Portal
- Your Phone
- Tips / Segítség

## ❓ Gyakori kérdések

**Q: Biztonságos törölni ezeket az appokat?**  
A: Igen! Ezek mind opcionális alkalmazások, amelyek eltávolítása nem befolyásolja a Windows működését.

**Q: Vissza tudom állítani a törölt appokat?**  
A: Igen! A legtöbb app újratelepíthető a Microsoft Store-ból, vagy visszaállítási pontból visszaállítható a rendszer.

**Q: Miért jelenik meg Windows SmartScreen figyelmeztetés?**  
A: Az alkalmazás jelenleg SignPath.io jóváhagyásra vár. Miután aláírásra került, ez a figyelmeztetés el fog tűnni.

---

❤️ Ha tetszik a projekt, adj egy ⭐ csillagot!

🐛 Ha hibát találsz, nyiss egy [Issue](https://github.com/BLacika65/debloat-tool/issues)-t!
