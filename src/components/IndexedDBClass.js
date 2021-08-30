// const idbClass = new IndexedDBClass({
//   db: { name: "chinesePingYinDic125", version: 1 },
//   store: {
//     name: "jibo",
//     //storeOptions: { keyPath: "idx", autoIncrement: true },  <<--Firefox 必須!!!!
//     storeOptions: { keyPath: "", autoIncrement: false },
//     indexes: [
//       { idxName: "JB", unique: true },
//     ]
//   }
// });
export const CON_STATUS = { OK: 1, NEW: 2, ERR: 0 }

class IndexedDBClass { // extends Promise
  constructor({ db, store }) {
    this.dbObj = { ...db };
    this.storeObj = { ...store };
    this.db = null;
  }

  connectIDB() {
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);

        //既存の DB name が同じ
        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(CON_STATUS.OK);
        }

        //既存の DB name と異なる
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          console.log('onupgradeneeded: ', typeof db.objectStoreNames);

          if (!Array.from(db.objectStoreNames).includes(this.storeObj.name)) {
            console.log('onupgradeneeded: ', this.storeObj.name, this.storeObj.storeOptions);
            const objectStore = db.createObjectStore(this.storeObj.name, this.storeObj.storeOptions);

            if (!this.storeObj.indexes) return;
            console.log(this.storeObj.indexes)
            for (const idx of this.storeObj.indexes) {
              objectStore.createIndex(idx.idxName, idx.idxName, { unique: idx.unique });
            }
            resolve(CON_STATUS.NEW);
          }
        }

        //何かのエラー
        request.onerror = (event) => { throw Error() }
      } catch (err) {
        console.log('IndexedDBClass: ', err);
        resolve(CON_STATUS.ERR);
      }
    });
  }

  //==============================
  // 追加(add) 1行追加(戻り値: id)
  //==============================
  add(data) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db || !data) throw Error('DB or data empty')
        const transaction = this.db.transaction(this.storeObj.name, "readwrite");
        const objectStore = transaction.objectStore(this.storeObj.name);
        console.log(objectStore)
        //IDBObjectStore { name: "jibo", keyPath: "", indexNames: DOMStringList(1), transaction: IDBTransaction, autoIncrement: false }

        const request = objectStore.put(data);
        request.onsuccess = event => resolve(event.target.result);
      } catch (err) {
        console.log('IndexedDBClass: ', 'add():', err.message);
        reject('IndexedDBClass: ' + err.message);
      }
    });
  }

  //==============================
  // 追加(put) 複数 (戻り値: Boolean; 最終保存終了後)
  //==============================
  addAll(data) {  //data=[{'KEY':VALUE,'TTL1':VALUE,...},{'KEY':VALUE,...}]
    if (!this.db || !data) { console.log('addAll Error', !!this.db, !!data); return null; }

    return new Promise((resolve, reject) => {
      //console.log('this.storeObj.name', this.storeObj.name)

      const transaction = this.db.transaction(this.storeObj.name, "readwrite");
      const objectStore = transaction.objectStore(this.storeObj.name);

      //objectStore.addAll(data); //Chrome OK, Firefox NG(後日変更)

      for (const n of [...data]) {
        objectStore.add(n);
        //console.log(n)
      }

      //全挿入終了後
      transaction.oncomplete = function () {
        //console.log("addAll Transaction is complete");
        resolve(true);
      }
    });
  }

  //==============================
  // 取得(１件)
  //==============================
  getOne(key) {
    if (!this.db) { console.log('getAll Error', 'this.db 不正'); return null; }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeObj.name, "readonly");
      const objectStore = transaction.objectStore(this.storeObj.name);
      const request = objectStore.get(key);
      request.onsuccess = event => {
        resolve(event.target.result);
      }
    });
  }

  //==============================
  // 取得(全件)
  //==============================
  getAll() {
    if (!this.db) { console.log('getAll Error', 'this.db 不正'); return null; }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeObj.name, "readonly");
      const objectStore = transaction.objectStore(this.storeObj.name);
      const request = objectStore.getAll();
      request.onsuccess = event => {
        resolve(event.target.result);
      }
    });
  }

  //==============================
  // 削除(1行)
  //==============================
  delete(key) {
    return new Promise((resolve, reject) => {
      if (!this.db || !key) { console.log('delete Error', !!this.db, !!key); return null; }
      const transaction = this.db.transaction(this.storeObj.name, "readwrite");
      const objectStore = transaction.objectStore(this.storeObj.name);
      const request = objectStore.delete(key);
      request.onsuccess = event => {
        resolve(event.type); //event.type="success"
      };
    });
  }
}

export default IndexedDBClass;