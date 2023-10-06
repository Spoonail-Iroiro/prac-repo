/**
 * ブラウザ環境でのファイルのインポートクラス
 */
class FileImporter {
  constructor() {
    this.rootElement = document.createElement('div');
    this.rootElement.className = 'none';
    document.body.appendChild(this.rootElement);
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'file';
    this.inputElement.name = 'import';
    this.inputElement.setAttribute('accept', '*');
    this.rootElement.appendChild(this.inputElement);
    $(this.inputElement).click((e) => (e.target.value = ''));
    this.isLocked = false;
    // this.currentCallback = null;
  }

  /**
   * テキストファイルインポート
   * ファイル選択ダイアログを開き、そこで選択したテキストファイルの内容を読み込んで返す
   */
  async import_() {
    // すでにファイルが読み込み中かを入力前と後にチェック
    // 前チェック…ファイルを選択する前にエラー終了のほうが手間がないため
    // 後チェック…import_()を2回以上連続で呼んだ場合にその中の1つだけ成功させるため
    if (this.isLocked) throw new Error('ファイルを読み込み中です');
    $(this.inputElement).trigger('click');
    const e = await this.input();
    if (this.isLocked) throw new Error('ファイルを読み込み中です');
    this.isLocked = true;
    try {
      const files = e.target.files;
      if (files.length === 0) throw new Error('No file selected');
      const content = await this.fileRead(files[0]);
      return content;
    } finally {
      this.isLocked = false;
    }
  }

  async input() {
    return new Promise((resolve, reject) => {
      $(this.inputElement)
        .off('change')
        .on('change', (e) => {
          resolve(e);
        })
        .off('error')
        .on('error', (e) => {
          reject(e);
        });
    });
  }

  async fileRead(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = (e) => resolve(e.target.result);
      fr.onerror = (e) => reject(e);
      fr.readAsText(file);
    });
  }
}
