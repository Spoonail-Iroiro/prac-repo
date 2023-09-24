class FileExporter {
  constructor() {
    this.downloadLink = document.createElement('a');
    this.downloadLink.href = 'javascript:void(0)';
    this.downloadLink.download = 'temp.txt';
    document.body.appendChild(this.downloadLink);
  }

  export(data, name) {
    this.downloadLink.download = name;
    const blob = new Blob([data], { type: 'text/plain' });
    window.navigator.msSaveBlob
      ? window.navigator.msSaveBlob(blob, name)
      : (this.downloadLink.href = window.URL.createObjectURL(blob));
    this.downloadLink.click();
  }
}
