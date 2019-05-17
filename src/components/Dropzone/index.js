import React, { Component } from 'react';
import './dropzone.scss';

class Dropzone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlight: false,
      fileName: '',
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
  }

  render() {
    const { fileName, highlight } = this.state;
    const noFileName = fileName === '';
    return (
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
          <p>Drop file to upload</p>
        ) : (
          <p>{fileName}</p>
        )}
      </div>
    );
  }
}

export default Dropzone;
