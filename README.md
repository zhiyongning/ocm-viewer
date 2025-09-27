# ocm-viewer
HERE Optimized Client Map data downloader and virtualizer

OCM Viewer is a web application designed for visualizing HERE Optimized Client Map (OCM) data.
It provides an intuitive way to download and explore OCM map layers by selecting specific layer groups.

Key features:
	•	Download OCM data by either specifying a coordinate point or selecting a bounding box.
	•	Apply custom search conditions to filter and refine the visualized map data.
	•	Quickly visualize and interact with GeoJSON-based OCM datasets in the browser.


Deployment Guide
1. Environment Preparation
   1) Install Node.js (v18 or later recommended)
   2) Verify by running the following 2 commands
       node -v
       npm -v
2. Get source codes from github
   1) Download link: https://github.com/zhiyongning/ocm-geojson-viewer/archive/refs/heads/main.zip
   2) Project structure
        OCM-GeoJSON-Viewer
        ├── README.md
        ├── geodata
        ├── package.json
        └── server
            ├── ocm-loader
            ├── server.js
            └── views
                └── index.ejs
3. Install dependencies in root folder
   npm install
   Note: this command will generate node_modules folder including all dependencies
4. Start application
   npm start
5. Afer service started, you can access the following URL in browser:
   http://localhost:8000




