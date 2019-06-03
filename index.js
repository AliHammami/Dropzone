const { app, BrowserWindow } = require('electron');
const chokidar = require('chokidar');
const fs = require('fs');
const fetch = require('electron-fetch').default;


const createWindow = () => {
  // create the window
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js',
    },
    width: 1000,
    height: 600,
  });

  // Allow to have the devtools open
  win.webContents.openDevTools();

  win.loadURL('http://localhost:8080');
};

// launch the app
app.on('ready', createWindow);

const StartWatcher = (path) => {
  // chokidar to watch file
  const watcher = chokidar.watch(path, {
    // One-liner for current directory, ignores .dotfiles
    ignored: /[\/\\]\./,
    // Indicates whether the process should continue to run as long as files are being watched.
    persistent: true,
  });

  const onWatcherReady = () => {
    console.info('From here can you check for real changes, the initial scan has been completed.');
  };

  // event listener
  watcher
    // watch when we had a file to the directory
    .on('add', (path) => {
      // fs.readFileSync get the content(the file) of the path
      const file = fs.readFileSync(path, (err) => {
        if (err) {
          alert("An error ocurred reading the file :" + err.message);
        }
      });

      const extension = path.substr((path.lastIndexOf('.') + 1));
      const fileName = path.substr((path.lastIndexOf('/') + 1));
      if (!/(pdf)$/ig.test(extension)) {
        // send an error extension to the render process
        win.webContents.send('errorExtension');
        console.log('Please send a PDF file.');
      }
      else if (fs.statSync(path).size >= 2000000) {
        // send an error file size to the render process
        win.webContents.send('errorSize');
        console.log('The file is too big, it should be under 2mo');
      }
      else {
        /* Asynchronous function that send the file when we drop it the directory and then get the
        total of file available in the server
        */
        const requests = async () => {
          await fetch('https://fhirtest.uhn.ca/baseDstu3/Binary', {
            method: 'POST',
            body: file,
          }).then(() => {
            // send the file uploaded and the file name to the render process
            win.webContents.send('fileUpload', file, fileName);
            console.log('File has been successfully uploaded');
          }).catch((err) => {
            console.log(err.response);
          });
          await fetch('http://hapi.fhir.org/baseDstu3/Binary?_summary=count', {
          }).then((response) => {
            response.json()
              .then((value) => {
                // send the total value in the server to the render process
                win.webContents.send('getTotal', value.total);
                console.log('The number of files currently in the server is: ' + value.total);
              });
          }).catch((err) => {
            console.log(err.response);
          });
        };
        requests();
      }
    })
    .on('error', (error) => {
      console.log('Error happened', error);
    })
    .on('ready', onWatcherReady);
};


StartWatcher('./FHIR');
