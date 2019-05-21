const { app, BrowserWindow } = require('electron');
const fs = require('fs');


function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    width: 1000,
    height: 600,
  });
  win.webContents.openDevTools();

  win.loadURL('http://localhost:8080');
}

app.on('ready', createWindow);

function StartWatcher(path) {
  const chokidar = require("chokidar");

  const watcher = chokidar.watch(path, {
    ignored: /[\/\\]\./,
    persistent: true,
  });

  function onWatcherReady() {
    console.info('From here can you check for real changes, the initial scan has been completed.');
  }
  watcher
    .on('add', (path) => {
      const data = fs.readFileSync(path, (err) => {
        if (err) {
          alert("An error ocurred reading the file :" + err.message);
        }
      });

      const extension = path.substr((path.lastIndexOf('.') + 1));
      if (!/(pdf)$/ig.test(extension)) {
        console.log('Please send a PDF file.');
      }
      else if (fs.statSync(path).size >= 2000000) {
        console.log('The file is too big, it should be under 2mo');
      }
      else {
        win.webContents.send('fileupload', data);
        console.log('File has been successfully uploaded');
      }
    })
    .on('error', (error) => {
      console.log('Error happened', error);
    })
    .on('ready', onWatcherReady);
}


StartWatcher('./FHIR');
