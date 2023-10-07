import { FileImporter } from './file-importer.js';
import { FileExporter } from './file-exporter.js';

/**
 * zip
 * ゲームのzipDataWorkerを使用して動作する
 */
async function zipData(data) {
  return new Promise((resolve) => {
    tWgm.tGameSave.zipDataWorker(data, resolve);
  });
}

/**
 * unzip
 * ゲームのunzipDataWorkerを使用して動作する
 */
async function unzipData(zippedData) {
  return new Promise((resolve) => {
    tWgm.tGameSave.unzipDataWorker(zippedData, resolve);
  });
}

/**
 * バイナリからBase64エンコードされた文字列への変換
 */
async function convertUint8ArrayToBase64(data) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([data], { type: 'application/gzip' });
    const fr = new FileReader();
    fr.addEventListener('load', (e) => {
      resolve(e.target.result.substr(29));
    });
    fr.addEventListener('error', reject);
    fr.readAsDataURL(blob);
  });
}

/**
 * データをゲームセーブのmainに使われている形式の文字列へ変換
 */
async function toSaveMainFormat(data) {
  const zipped = await zipData(data);
  const b64encoded = await convertUint8ArrayToBase64(zipped);
  return b64encoded;
}

/**
 * ゲームセーブのmainに使われている形式の文字列からデータを復元
 */
async function fromSaveMainFormat(saveStr) {
  const b64decoded = tWgm.tGameSave.convertBase64ToUint8Array(saveStr);
  const unzipped = await unzipData(b64decoded);

  return unzipped;
}

async function editSaveStr(saveStr, editFn) {
  const { header, main, suspended, suspendedBackupHeader } =
    tWgm.tGameSave.splitSaveData(saveStr);
  const headerData = JSON.parse(header);
  const mainData = await fromSaveMainFormat(main);
  const [newHeaderData, newMainData] = editFn(headerData, mainData);
  const newMain = await toSaveMainFormat(newMainData);
  const newHeader = JSON.stringify(newHeaderData);

  const newSaveStr = tWgm.tGameSave.convertSaveData({
    header: newHeader,
    main: newMain,
    suspended,
    suspendedBackupHeader,
  });

  return newSaveStr;
}

/**
 * セーブデータ管理クラス
 */
export class SaveManager {
  constructor() {
    this.fileExporter = new FileExporter();
    this.fileImporter = new FileImporter();

    // セーブデータ一時領域
    this.saveData = null;
  }
  async importFromGame(saveNo) {
    const saveKey = tWgm.tGameSave.getSaveKey(saveNo);
    const saveStr = localStorage[saveKey];
    if (saveStr === undefined)
      throw new Error(`指定された番号のセーブデータはありません：${saveNo}`);
    await this._import(saveStr);
  }

  async exportToGame(saveNo) {
    const saveKey = tWgm.tGameSave.getSaveKey(saveNo);
    const saveStr = await this._export();
    localStorage[saveKey] = saveStr;
  }

  /**
   * 文字列から一時領域へセーブデータをインポート
   * @param {string} saveStr セーブデータ文字列
   */
  async _import(saveStr) {
    const { header, main, suspended, suspendedBackupHeader } =
      tWgm.tGameSave.splitSaveData(saveStr);
    this.saveData = {
      header: JSON.parse(header),
      main: await fromSaveMainFormat(main),
      suspendedBackupHeader: JSON.parse(suspendedBackupHeader),
      suspended: await fromSaveMainFormat(suspended),
    };
  }

  /**
   * 一時領域のセーブデータを文字列へエクスポート
   * @returns {string} セーブデータ文字列
   */
  async _export() {
    if (this.saveData === null)
      throw new Error('セーブデータが一時領域に読み込まれていません');
    const saveStr = tWgm.tGameSave.convertSaveData({
      header: JSON.stringify(this.saveData.header),
      main: await toSaveMainFormat(this.saveData.main),
      suspendedBackupHeader: JSON.stringify(
        this.saveData.suspendedBackupHeader
      ),
      suspended: await toSaveMainFormat(this.saveData.suspended),
    });

    return saveStr;
  }

  /**
   * ファイルからセーブデータをインポート
   */
  async importFromFile() {
    const imported = await this.fileImporter.import_();
    this._import(imported);
  }

  /**
   * ファイルへセーブデータをエクスポート
   */
  async exportToFile() {
    const saveStr = await this._export();
    this.fileExporter.export(saveStr, 'tbrg_save_x.tbrgsv');
  }
}
