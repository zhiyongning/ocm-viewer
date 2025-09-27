// server.js
const { spawn } = require('child_process');
const path = require("path");
const cppExePathLoadRoad = path.join(__dirname, 'load-road');
const cppExePathLoadIsa = path.join(__dirname, 'load-isa');
const cppExePathOcmLoader = path.join(__dirname, 'ocm-loader');
const express = require("express");
const os = require('os');
const fs = require("fs");
const WebSocket = require("ws");

const app = express();
const PORT = 8000;

app.use(express.json());
// 静态目录: 当前目录（提供 index.html, js, css 等前端资源）
//app.use(express.static(path.join(__dirname)));

// 静态目录: geodata/ (提供 geojson 数据)
app.use("/geodata", express.static(path.join(__dirname, "..", "geodata")));



// 读取 map_api_key.txt 文件
function getMapApiKey() {
  const filePath = path.join(process.env.HOME || process.env.USERPROFILE, '.here', 'credentials.properties');
  if (!fs.existsSync(filePath)) {
    console.error('credentials.properties文件不存在！');
    return '';
  }
  // 假设文件是 key=value 格式
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (line && line.includes('=')) {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key === 'here.api.key') return value;
    }
  }
  return '';
}
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

function getMapApiKeyTest() {
  return 'YOUR_API_KEY_xxx';
}

// 首页路由
app.get('/', (req, res) => {
  const apiKey = getMapApiKey();
  console.log("apikey in server.js = " + apiKey);
  res.render('index', { apiKey });
});

app.use(express.static(path.join(__dirname, "public")));



app.post('/api/loadOcmData', (req, res) => {
  const { area, selectedLayer, swlon, swlat, nelon, nelat, longitude, latitude, filters } = req.body;

   console.log("server.js -> loadOcmData:", longitude, latitude, selectedLayer, filters);
  let args = [];
  let child; 
  let filterArg = "";

  // 把 filters 转成字符串，方便 C++ 程序解析
if (filters) {
  const andFilters = (filters.and || []).map(f => `${f.key}${f.op}${f.value}`);
  const orFilters = (filters.or || []).map(f => `${f.key}${f.op}${f.value}`);
  
  if (andFilters.length > 0) {
    filterArg += "AND(" + andFilters.join(",") + ")";
  }
  if (orFilters.length > 0) {
    if (filterArg.length > 0) filterArg += ";";
    filterArg += "OR(" + orFilters.join(",") + ")";
  }
}

console.log("Generated filterArg:", filterArg);

  if (longitude !== undefined && longitude !== null && longitude !== '' &&
      latitude !== undefined && latitude !== null && latitude !== '') {
    // 单点请求


    args = [
      selectedLayer, // layerGroupName
      `point:${longitude},${latitude}` // area
    ];
    if (filterArg) args.push(`filter:${filterArg}`);
     console.log("server.js -> c++ args:",  filterArg);

    child = spawn(cppExePathOcmLoader, args);
    res.json({ type: "point", args });
  } else if (swlon !== undefined && swlat !== undefined && nelon !== undefined && nelat !== undefined) {
    // 区域请求
    console.log("处理区域请求:", swlon, swlat, nelon, nelat, selectedLayer);

    args = [
      selectedLayer, // layerGroupName
      `bbox:${swlon},${swlat},${nelon},${nelat}` // area
    ];
    if (filterArg) args.push(`filter:${filterArg}`);

    child = spawn(cppExePathOcmLoader, args);
    res.json({ type: "area", args });
  } else {
    // 参数不完整
    return res.status(400).json({ error: "Invalid parameters" });
  }

  child.stdout.on('data', (data) => {
    console.log(`C++ 输出：${data.toString()}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`C++ log：${data.toString()}`);
  });

  return res;
});


app.post('/api/trafficgeodata', (req, res) => {
  const { southwest, northeast} = req.body;

 
  if (southwest && northeast) {
    return res.json({ success: true, token: 'fake-token-123' });
  }
  // 默认返回错误
  res.status(400).json({ success: false, message: '请求参数错误' });
});

// 启动 HTTP 服务
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});








// 启动 WebSocket 服务
const wss = new WebSocket.Server({ server });

// 广播工具
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

// WebSocket 连接处理
wss.on("connection", (ws) => {
  console.log("WS client connected");
  ws.send(JSON.stringify({ type: "connected" }));
});

const GEOJSON_FILE = path.join(__dirname, "..", "geodata", "data.geojson");

// 初始化文件内容
try {
  if (fs.existsSync(GEOJSON_FILE)) {
    lastFileContent = fs.readFileSync(GEOJSON_FILE, "utf8");
  } else {
    console.warn("⚠️ data.geojson 初始不存在，将等待文件生成...");
  }
} catch (e) {
  console.warn("⚠️ 初始化读取 data.geojson 失败:", e.message);
}




const DEBOUNCE_DELAY = 300; // ms
const filesToWatch = [
  "geodata/data.geojson",
  "geodata/isa.geojson",
];



// 监控 geojson 文件


const lastFileContents = new Map();
const debounceTimers = new Map();

filesToWatch.forEach((filePath) => {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);

  fs.watch(dir, (eventType, filename) => {
    if (filename !== base) return;

    // 清除已有定时器
    if (debounceTimers.has(filePath)) clearTimeout(debounceTimers.get(filePath));

    debounceTimers.set(
      filePath,
      setTimeout(async () => {
        try {
          const content = await fs.promises.readFile(filePath, "utf8");

          if (!lastFileContents.has(filePath)) {
            lastFileContents.set(filePath, content);
            console.log(`📂 ${base} 新生成，通知客户端...`);
            broadcast({ type: "geojson-updated", file: base });
            return;
          }

          if (lastFileContents.get(filePath) !== content) {
            lastFileContents.set(filePath, content);
            console.log(`♻️ ${base} 内容变更，通知客户端...`);
            broadcast({ type: "geojson-updated", file: base });
          }
        } catch (err) {
          // 文件可能被删除
          if (lastFileContents.has(filePath)) {
            console.warn(`⚠️ ${base} 被删除`);
            lastFileContents.delete(filePath);
          }
        }
      }, DEBOUNCE_DELAY)
    );
  });
});