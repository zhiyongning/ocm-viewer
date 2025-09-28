# OCM Viewer

**OCM Viewer** is a web application designed for downlading and visualizing HERE Optimized Client Map (OCM) data.
It provides an intuitive way to **download and explore OCM map layers** directly in the browser.

## Key Features:
1. Download OCM data by specifying a **coordinate point** or selecting a **bounding box**.
2. Apply **custom search conditions** to filter and refine the visualized map data.
3. Quickly **visualize and explore with GeoJSON-based OCM datasets** in the browser.


## Deployment Guide
### 1. Environment Preparation
   1) Install Node.js (v18 or later recommended)
   2) Verify by running the following 2 commands
       ```bash
       node -v
       npm -v
       ```
### 2. Get Source Codes
   1) Click to download:
      - https://github.com/zhiyongning/ocm-viewer/archive/refs/heads/main.zip

      Or clone the repository
      ```
      git clone https://github.com/zhiyongning/ocm-viewer.git
      ```
   2) Project structure (ocm-viewer as the root folder)
      ```bash
        ocm-viewer
        ├── README.md
        ├── geodata
        ├── package.json
        └── server
            ├── ocm-loader
            ├── server.js
            └── views
                └── index.ejs
      ```          
### 3. Install Dependencies
   Run in the **project root** 
   ```bash
   npm install
   ```
   ｜ this will create **node_modules** folder with all required dependencies
### 4. Configure Credentials
   1) The application read credentials from:
   ```
  HOME/.here/credentials.properties
   ```
   2) Add your HERE API key to this file for accessing the HERE Raster Tile API (base map):
   ```
   here.api.key=your_api_key_here
   ```

### 5. Start application
   Run in the **project root**
   ```bash
   npm start
   ```
### 6. Access the Web App
   Open your browser at:
   
   http://localhost:8000
   


## 📝 Notes
1. Make sure your HERE credentials are valid.
2. The **geodata** folder can be used to store downloaded datasets.




