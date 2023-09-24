import FileImporter from './file-importer.js';
import FileExporter from './file-exporter.js';

class SaveManager {
  constructor() {
    this.fileExporter = new FileExporter();
    this.FileImporter = new FileImporter();

    // セーブデータ一時領域
    this.saveData = null;
  }
}
