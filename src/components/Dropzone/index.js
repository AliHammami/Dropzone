import React, { Component } from 'react';
import axios from 'axios';

import './dropzone.scss';

class Dropzone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlight: false,
      fileName: '',
      message: '',
      total: '',
      file: '',
    };
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  onDragOver(event) {
    // Prevent default behavior
    event.preventDefault();
    this.setState({ highlight: true });
  }

  onDragLeave() {
    this.setState({ highlight: false });
  }

  /* Asynchronous function to send the file when we drop it and then get the
  total of file available in the server
  */
  async onDrop(event) {
    event.preventDefault();
    // Loop that use DataTransfer interface to access the file and get the file name
    for (let i = 0; i < event.dataTransfer.files.length; i += 1) {
      const file = event.dataTransfer.files[i];
      const fileName = event.dataTransfer.files[i].name;
      // console.log("... file[" + i + "].name = " + file);
      this.setState({
        file,
        fileName,
        highlight: false,
      });
    }
    const file = this.state.file;
    // Create an empty formData object
    const formData = new FormData();
    // Create a key/value pair, the file that we send is the value
    formData.append('file', file);
    try {
      // First we send the file
      await axios({
        url: 'https://fhirtest.uhn.ca/baseDstu3/Binary',
        method: 'POST',
        data: formData,
      }).then(() => {
        this.setState({ message: 'File has been successfully uploaded' });
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
      </div>
    );
  }
}

export default Dropzone;
