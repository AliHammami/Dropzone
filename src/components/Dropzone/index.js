import React, { Component } from 'react';
import axios from 'axios';
import isElectron from 'is-electron';

import './dropzone.scss';

// const { ipcRenderer } = window.require('electron');

class Dropzone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlight: false,
      fileName: '',
      message: '',
      total: '',
      file: '',
      errorMessage: '',
    };
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  componentDidMount() {
    // check if electron is running
    if (isElectron()) {
      // ipcRenderer is an event that allow you to listen a channel
      window.ipcRenderer.on('pong', () => {
        this.setState({ ipc: true });
      });
      // listening the errorExtention channel
      window.ipcRenderer.on('errorExtension', () => {
        this.setState({
          file: null,
          fileName: null,
          errorMessage: 'Please send PDF a file.',
        });
      });
      // listening the errorSize channel
      window.ipcRenderer.on('errorSize', () => {
        this.setState({
          file: null,
          fileName: null,
          errorMessage: 'The file is too big, it should be under 2mo.',
        });
      });
      // listening the fileUpload channel to get the file uploaded and the fileName
      window.ipcRenderer.on('fileUpload', (event, file, fileName) => {
        this.setState({
          message: 'File has been successfully uploaded',
          file,
          fileName,
          errorMessage: null,
        });
      });
      // listening the getTotal channel to get the total of files in the server
      window.ipcRenderer.on('getTotal', (event, total) => {
        this.setState({ total });
      });
    }
  }

  // When we drag the file on the dropzone, the backgroundcolor of the dropzone change
  onDragOver(event) {
    // Prevent default behavior
    event.preventDefault();
    this.setState({ highlight: true });
  }

  // When we leave, the backgroundcolor of the dropzone back to normal
  onDragLeave() {
    this.setState({ highlight: false });
  }

  /* Asynchronous function that send the file when we drop it and then get the
  total of file available in the server
  */
  async onDrop(event) {
    event.preventDefault();
    // Loop that use DataTransfer interface to access the file and get the file name
    for (let i = 0; i < event.dataTransfer.files.length; i += 1) {
      const file = event.dataTransfer.files[i];
      const fileName = event.dataTransfer.files[i].name;
      const extension = fileName.substr((fileName.lastIndexOf('.') + 1));
      // If the file extension is not pdf an error message appear
      if (!/(pdf)$/ig.test(extension)) {
        this.setState({
          file: null,
          fileName: null,
          errorMessage: 'Please send PDF a file.',
        });
        return;
      }
      // if the file size is bigger thant 2mo an error message appear
      if (file.size >= 2000000) {
        this.setState({
          file: null,
          fileName: null,
          errorMessage: 'The file is too big, it should be under 2mo.',
        });
        return;
      }
      this.setState({
        file,
        fileName,
        highlight: false,
      });
    }
    const file = this.state.file;      
    // Create an empty formData object
    const formData = new FormData();
    // Create a key/value pair. The file that we send is the value
    formData.append('file', file);
    try {
      // First we send the file
      await axios({
        url: 'https://fhirtest.uhn.ca/baseDstu3/Binary',
        method: 'POST',
        data: formData,
      }).then(() => {
        this.setState({
          message: 'File has been successfully uploaded',
          errorMessage: null,
        });
      }).catch((err) => {
        console.log(err.response);
      });
      // And then we check the total number of file available in the server
      await axios({
        url: 'http://hapi.fhir.org/baseDstu3/Binary?_summary=count',
        method: 'GET',
      }).then((res) => {
        this.setState({ total: res.data.total });
      });
    }
    catch (error) {
      console.log(error);
    }
  }


  render() {
    const {
      fileName,
      highlight,
      message,
      total,
      errorMessage,
    } = this.state;

    const empty = '';
    return (
      <div>
        <div
          className={`dropzone ${highlight ? 'highlight' : ''}`}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
        >
          <input
            ref={this.fileInputRef}
            className="fileInput"
            type="file"
          />
          {!fileName ? (
            <p className="uploadFile">Drop file to upload</p>
          ) : (
            <p className="uploadFile">{fileName}</p>
          )}
        </div>
        <div>
          {message ? (
            <p className="uploadSuccess">{message}</p>
          ) : empty
          }
          {total ? (
            <p className="filesTotal">The number of files currently in the server is {total}</p>
          ) : empty
          }
        </div>
        <div>
          {errorMessage ? (
            <p className="errorMessage">{errorMessage}</p>
          ) : empty
          }
        </div>
      </div>
    );
  }
}

export default Dropzone;
