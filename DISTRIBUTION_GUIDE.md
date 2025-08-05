# 🚀 Eyercall Inventory - Distribution Guide

This guide will help you create a distributable executable file that can be shared with clients without any database or dependency issues.

## 📋 Prerequisites

Before building the executable, ensure you have:

1. **Node.js** (version 16 or higher) - Download from [nodejs.org](https://nodejs.org/)
2. **Git** (optional, for version control)
3. **Windows 10/11** (for Windows builds)

## 🛠️ Building the Executable

### Method 1: Using the Batch File (Recommended)

1. **Double-click** `build-exe.bat` in your project folder
2. The script will automatically:
   - Check for Node.js installation
   - Install all dependencies
   - Build the frontend
   - Create the executable
   - Verify the build

### Method 2: Using Command Line

```bash
# Run the production build script
node build-production.js
```

### Method 3: Using npm Scripts

```bash
# Install all dependencies first
npm run install:all

# Build the executable
npm run dist:final
```

## 📁 Build Output

After successful build, you'll find:

- **`dist/`** folder containing:
  - `Eyercall Inventory Setup.exe` - The installer
  - `build-info.json` - Build information
  - Other build artifacts

## 🔧 What's Included in the Executable

The built executable includes:

✅ **Complete Application**
- Frontend React app (built and optimized)
- Backend Express server
- All necessary dependencies
- Database initialization scripts

✅ **Database Management**
- SQLite database (automatically created in user's AppData)
- User authentication system
- All tables and initial data

✅ **No External Dependencies**
- Everything is bundled inside the executable
- No need for Node.js on client machines
- No need for separate database installation

## 📦 Distribution

### For Clients

1. **Share the installer**: `Eyercall Inventory Setup.exe`
2. **Client installation**:
   - Double-click the installer
   - Choose installation directory
   - Desktop and Start Menu shortcuts will be created

### Installation Locations

- **Application**: `C:\Program Files\Eyercall Inventory\`
- **User Data**: `%APPDATA%\EyercallData\`
- **Database**: `%APPDATA%\EyercallData\database.sqlite`

## 🔍 Troubleshooting

### Build Issues

**Error: "electron-builder not found"**
```bash
npm install -g electron-builder
```

**Error: "Frontend build failed"**
```bash
cd frontend
npm install
npm run build
```

**Error: "Backend dependencies missing"**
```bash
cd backend
npm install
```

### Runtime Issues

**Database not found**: The database will be automatically created in the user's AppData folder on first run.

**Port already in use**: The application uses port 4000. Ensure no other application is using this port.

**Permission denied**: Run the installer as administrator if needed.

## 📊 Build Information

The build process creates a `build-info.json` file with:

```json
{
  "buildDate": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "executable": "Eyercall Inventory Setup.exe",
  "size": "150.25",
  "platform": "win32",
  "architecture": "x64"
}
```

## 🎯 Production Features

✅ **Self-contained**: No external dependencies required
✅ **Database isolation**: Each user gets their own database
✅ **Auto-updates**: Database schema updates automatically
✅ **Error handling**: Comprehensive error logging
✅ **Security**: JWT authentication and data validation
✅ **Backup**: Database backup functionality included

## 📞 Support

If you encounter any issues:

1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure sufficient disk space (at least 2GB free)
4. Check Windows Defender/firewall settings

## 🔄 Updates

To create an updated version:

1. Make your code changes
2. Update the version in `package.json`
3. Run the build process again
4. Distribute the new executable

---

**Note**: The executable is optimized for Windows x64 systems. For other platforms, modify the build configuration in `package.json`. 