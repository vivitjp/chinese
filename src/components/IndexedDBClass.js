// const idbClass = new IndexedDBClass({
//   db: { name: "chinesePingYinDic125", version: 1 },
//   store: {
//     name: "jibo",
//     // 1) storeOptions 必須
//     storeOptions: { keyPath: "idx", autoIncrement: true },
//     indexes: [  //main key 以外の検索用 index 作成
//       { idxName: "JB", unique: false },  
//     ]
//
//     2) storeOptions: { keyPath: "JB", autoIncrement: false },   <<--Firefox 必須!!!!
//     indexes: [  //これは main key 以外の
//       { idxName: "JB", unique: true },  
//     ]
//   }
// });

export const idbSTATUS = { OK: 1, NEW: 2, ERR: 0 }

class IndexedDBClass { // extends Promise
  constructor({ db, store, file }) {
    //console.log('IndexedDBClass', 'constructor called')
    this.dbObj = { ...db };
    this.storeObj = { ...store };
    this.status = idbSTATUS.ERR;

    this.file = file;
  }

  //===========================================
  //  DBの状態をチェックして Status を返す
  //  DBインデックス定義(onupgradeneeded)を行うのはここだけ
  //===========================================
  getStatus() {
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);

        //■ 既存の DB name が同じ
        request.onsuccess = (event) => {
          //event.target.result;
          //= IDBDatabase { name: "china4", version: 2, objectStoreNames: DOMStringList(1), onabort: null, onclose: null, onerror: null, onversionchange: null }
          console.log('IndexedDBClass', 'connectIDB', 'onsuccess')
          this.status = idbSTATUS.OK;
          //console.log('getStatus', 'request.onsuccess', this.dbObj.name)
          resolve(idbSTATUS.OK);
          const dbReqRes = request.result
          dbReqRes.close();
        }

        //■ 既存の DB name と異なる(バージョンの違いではトリガーされない？)
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          console.log('IndexedDBClass', 'onupgradeneeded(before): ', this.storeObj.name);

          if (!Array.from(db.objectStoreNames).includes(this.storeObj.name)) {
            //console.log('objectStoreNames', JSON.stringify(db.objectStoreNames))
            const objectStore = db.createObjectStore(this.storeObj.name, this.storeObj.storeOptions);

            //index のコピー
            if (!this.storeObj.indexes) return;
            //console.log(this.storeObj.indexes)
            for (const idx of this.storeObj.indexes) {
              objectStore.createIndex(idx.idxName, idx.idxName, { unique: idx.unique });
            }
            this.status = idbSTATUS.OK
            //console.log('getStatus', 'request.onupgradeneeded(1)', this.status)
            resolve(idbSTATUS.NEW);
          } else {
            this.status = idbSTATUS.OK
            //console.log('getStatus', 'request.onupgradeneeded(2)', this.status)
            resolve(idbSTATUS.OK);  //ここの処理不明
          }
          // const dbReqRes = request.result  エラー発生
          // dbReqRes.close();
        }

        //■ エラー
        request.onerror = (event) => { throw Error('辞書ステータス取得不可') }

      } catch (err) {
        console.error('IndexedDBClass', 'getStatus', err.message);
        resolve(idbSTATUS.ERR);
      }
    });
  }

  //==============================
  // 追加(put) 複数 (戻り値: Boolean; 最終保存終了後)
  //==============================
  addAll(data) {  //data=[{'KEY':VALUE,'TTL1':VALUE,...},{'KEY':VALUE,...}]
    if (!data) throw Error('no data')
    if (this.status === idbSTATUS.ERR) throw Error('status error')

    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(this.storeObj.name, "readwrite");
          const objStore = transaction.objectStore(this.storeObj.name);

          //objStore.addAll(data); //Chrome OK, Firefox NG(後日変更)
          // console.log(data.length)
          // console.log(data)

          for (const n of [...data]) { //console.log(n)
            objStore.put(n);           //PUT ここに micro treansaction 入れると fail
          }
          db.close();
          resolve(idbSTATUS.OK);

          //全挿入終了後
          transaction.oncomplete = function () {
            console.log('IndexedDBClass', "addAll Transaction is complete");
            resolve(idbSTATUS.OK);
            const db = request.result
            db.close();
          }
        }
      } catch (err) {
        console.error('IndexedDBClass', "addAll", "Error", err.messge);
        resolve(idbSTATUS.err)
      }
    });
  }

  //==============================
  // 追加(add) 1行追加(戻り値: id)
  //==============================
  add(data) {
    if (!data) throw Error('no data')
    if (this.status === idbSTATUS.ERR) throw Error('status error')
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
        request.onsuccess = (event) => {
          const db = event.target.result;
          //if (!this.db || !data) throw Error('DB or data empty')
          const transaction = db.transaction(this.storeObj.name, "readwrite");
          const objStore = transaction.objectStore(this.storeObj.name);
          //console.log(objectStore)
          //IDBObjectStore { name: "jibo", keyPath: "", indexNames: DOMStringList(1), transaction: IDBTransaction, autoIncrement: false }

          const storeReq = objStore.put(data);
          storeReq.onsuccess = (event) => resolve(event.target.result);
        }
      } catch (err) {
        console.log('IndexedDBClass: ', 'add():', err.message);
        resolve(idbSTATUS.err)
      }
    });
  }

  //==============================
  // 取得(１件)
  //==============================
  getOne(key) {
    if (!key) throw Error('no key')
    //console.log('IndexedDBClass: ', 'getOne():', this.status)

    if (this.status === idbSTATUS.ERR) throw Error('status error')

    return new Promise((resolve, reject) => {
      try {
        //console.log(11)
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
        //console.log(12)
        request.onsuccess = (event) => {
          //console.log(30)
          const db = event.target.result;
          const transaction = db.transaction(this.storeObj.name, "readonly");
          const objStore = transaction.objectStore(this.storeObj.name);
          const storeReq = objStore.get(key);
          storeReq.onsuccess = (event) => {
            //console.log(40, event.target.result)
            resolve(event.target.result || null);
          }
        }
      } catch (err) {
        //console.log(20)
        console.error('IndexedDBClass: ', 'getOne():', err.message);
        resolve()
      }
    });
  }

  //==============================
  // 取得(全件)
  //==============================
  getAll() {
    if (this.status === idbSTATUS.ERR) throw Error('status error')

    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(this.storeObj.name, "readonly");
          const objStore = transaction.objectStore(this.storeObj.name);
          const storeReq = objStore.getAll();
          storeReq.onsuccess = event => {
            resolve(event.target.result);
          }
        }
      } catch (err) {
        console.error('IndexedDBClass: ', 'getAll():', err.message);
        resolve(idbSTATUS.err)
      }
    });
  }

  //==============================
  // 削除(1行)
  //==============================
  delete(key) {
    //if (!key) throw Error('no key')
    //if (this.status === idbSTATUS.ERR) throw Error('status error')

    return new Promise((resolve, reject) => {
      //     try {
      //       const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
      //       request.onsuccess = (event) => {
      //         const db = event.target.result;

      //       }
      //     } catch (err) {
      //       console.log('IndexedDBClass: ', 'XXX():', err.message);
      //       resolve(idbSTATUS.err)
      //     }
      if (!this.db || !key) { console.log('delete Error', !!this.db, !!key); return null; }
      const transaction = this.db.transaction(this.storeObj.name, "readwrite");
      const objStore = transaction.objectStore(this.storeObj.name);
      const storeReq = objStore.delete(key);
      storeReq.onsuccess = event => {
        resolve(event.type); //event.type="success"
      };
    });
  }
}

export default IndexedDBClass;