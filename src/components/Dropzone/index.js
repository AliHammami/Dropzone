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
    };
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  onDragOver(event) {
    event.preventDefault();
    this.setState({ highlight: true });
  }

  onDragLeave() {
    this.setState({ highlight: false });
  }

  onDrop(event) {
    event.preventDefault();
    for (let i = 0; i < event.dataTransfer.files.length; i += 1) {
      const file = event.dataTransfer.files[i].name;
      // console.log("... file[" + i + "].name = " + file);
      this.setState({
        fileName: file,
        highlight: false,
      });
    }
    const file = this.state.file;
    const formData = new FormData();

    formData.append('file', file);
    axios({
      url: 'https://fhirtest.uhn.ca/baseDstu3/Binary',
      method: 'POST',
      data: formData,
    }).then((res) => {
      console.log(res);
      this.setState({ message: 'File has been successfully uploaded' });
    }).catch((err) => {
      console.log(err.response);
    });
  }

  render() {
    const { fileName, highlight, message } = this.state;
    const noFileName = fileName === '';
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
          {noFileName ? (
            <p className="uploadFile">Drop file to upload</p>
          ) : (
            <p className="uploadFile">{fileName}</p>
          )}
        </div>
        <div>
          {message ? (
            <p className="uploadSuccess">{message}</p>
          ) : ''
          }
        </div>
      </div>
    );
  }
}

export default Dropzone;
