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

try {

} catch (e) {
  console.error('', e.message)
  //return ????
}

export const idbSTATUS = { OK: 1, NEW: 2, ERR: 0 }

export const idbTYPE = {
  Add: 'Add',
  Update: 'Update',
  Delete: 'Delete',
  Clear: 'Clear',
  GetOne: 'GetOne',
  GetAll: 'GetAll',
}

class IndexedDBClass { // extends Promise
  constructor({ db, store, file }) {
    this.dbObj = { ...db };
    this.storeObj = { ...store };
    this.status = idbSTATUS.ERR;
  }

  //===========================================
  //  DBの状態をチェックして Status を返す
  //  DBインデックス定義(onupgradeneeded)を行うのはここだけ
  //===========================================
  initDB({ debug = false }) {

    const debug_pref = 'IndexedDBClass[' + this.dbObj.name + ']: initDB: '
    if (debug) console.log(debug_pref)

    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);

        //■ Open Request: 成功 (既存の DB name/version が同じ)
        request.onsuccess = (event) => {     //event.target.result;
          if (debug) console.log(debug_pref, 'onsuccess')

          this.status = idbSTATUS.OK; //DB Class 成功、Add/Upd/Delが使用可能
          resolve(idbSTATUS.OK);

          const db = request.result
          db.close();
        }

        //■ Open Request: 成功 (既存の DB name or version 異なる)
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (debug) console.log(debug_pref, 'onupgradeneeded')

          //名前が同じ -> バージョン更新: 以前の DB 削除
          if (Array.from(db.objectStoreNames).includes(this.storeObj.name)) {
            db.deleteObjectStore(this.storeObj.name);
            if (debug) console.log(debug_pref, '旧DB削除')
          }

          //■ 新規作成
          const objectStore = db.createObjectStore(this.storeObj.name, this.storeObj.storeOptions);

          //■ Set index(もしあれば)
          if (this.storeObj.indeces) {
            if (debug) console.log(debug_pref, 'Indeces再構成')
            for (const idx of this.storeObj.indeces) {
              if (idx.idxName && idx.idxName)
                objectStore.createIndex(idx.idxName, idx.idxName, { unique: idx.unique || false });
            }
          }
          this.status = idbSTATUS.OK; //DB Class 成功、Add/Upd/Delが使用可能
          if (debug) console.log(debug_pref, '新DB作成')

          resolve(idbSTATUS.NEW);

          // この後に request.onsuccess が再度呼ばれるが、resolve は再度返らない。
        }

        //■ Open Request: エラー
        request.onerror = (e) => { throw Error(e.message) }

      } catch (e) {
        console.error(debug_pref, 'Error ', e.message);
        resolve(idbSTATUS.ERR);
      }
    });
  }

  checkParam({ type, data, key, debug = false, debug_pref }) {
    try {
      switch (type) {
        case idbTYPE.Add:
          if (!data) return Error('no data')
          break;
        case idbTYPE.Update:
          if (!data) throw Error('no data')
          if (!key) throw Error('no key')
          break;
        case idbTYPE.Delete:
          if (!key) throw Error('no key')
          break;
        case idbTYPE.GetOne:
          if (!key) throw Error('no key')
          break;
        case idbTYPE.GetAll:
          break;
        default:
          throw Error('no Type')
      }
      return true
    } catch (e) {
      console.error(debug_pref, "Error ", e.messge);
      return false;
    }
  }


  //==============================
  // 追加(put) 複数 (戻り値: Boolean; 最終保存終了後)
  //
  //  objStore.addAll(data); //Chrome OK, Firefox NG(後日変更)
  //==============================
  exec({ type, data, key, debug = false }) {  //data=[{'KEY':VALUE,'TTL1':VALUE,...},{'KEY':VALUE,...}]
    if (this.status === idbSTATUS.ERR) throw Error('DB is not Ready')

    let debug_pref = 'IndexedDBClass[' + this.dbObj.name + ']: ' + type;
    if (!this.checkParam({ type, data, key, debug, debug_pref })) throw Error('Check Failed')
    if (debug) console.log(debug_pref, 'Started')

    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);

        //■ Open Request: 成功
        request.onsuccess = (event) => {
          if (debug) console.log(debug_pref, 'DB opened')

          const db = event.target.result;
          const transaction = db.transaction(this.storeObj.name, "readwrite");
          const objStore = transaction.objectStore(this.storeObj.name);

          let numSucess = 0;
          let numErrors = 0;
          let storeReq = null;

          if (type === idbTYPE.Add && Array.isArray(data)) {
            //■ 複数 DATA 挿入
            for (const n of [...data]) {       //add では Error が表示されない
              storeReq = objStore.put(n);    //PUT!!!
              numSucess++;
              // throw Error せずに、ログのみ残して、put() 継続する
              // eslint-disable-next-line no-loop-func
              storeReq.onerror = () => { numErrors++; }
              //storeReq.onsuccess = (e) => // e.target.result; 挿入Data ID
            }
            resolve(idbSTATUS.OK);
          } else {
            switch (type) {
              case idbTYPE.Add: storeReq = objStore.put(data); break; //■ 単数 DATA 挿入
              case idbTYPE.Update: storeReq = objStore.put(data, key); break; //■ 単数 DATA 更新
              case idbTYPE.Delete: storeReq = objStore.delete(key); break; //■ 単数 DATA 削除
              case idbTYPE.Clear: storeReq = objStore.clear(); break;//■ DATA 全削除
              case idbTYPE.GetOne: storeReq = objStore.get(key); break;//■ 単数 DATA 取得
              case idbTYPE.GetAll: storeReq = objStore.getAll(key || null); break;//■ 全 DATA 取得
              default:
            }
            storeReq.onsuccess = (e) => {
              //console.log(debug_pref, e.target.result)
              resolve(e.target.result || null);
            }
            storeReq.onerror = (e) => { numErrors++; throw Error(e.message); }
          }

          if (debug) console.log(debug_pref, 'Executed Record:' + numSucess)
          if (debug && numErrors) console.log(debug_pref, type, 'Failed Record:' + numErrors)
          if (debug) console.log(debug_pref, 'DB closed')

          //■ Transaction: 成功
          transaction.oncomplete = () => {
            if (debug) console.log(debug_pref, 'Transaction complete')
            const db = request.result
            db.close();
          }

          //■ Transaction: エラー
          transaction.onerror = (e) => {
            const db = request.result
            db.close();
            throw Error(e.messge);
          }
        }

        //■ Open Request: エラー
        request.onerror = (e) => { throw Error(e.message) }

      } catch (e) {
        console.error(debug_pref, "Error ", e.messge);
        reject(idbSTATUS.ERR)
      }
    });
  }
}

export default IndexedDBClass;


//   //==============================
//   // 追加(put) 複数 (戻り値: Boolean; 最終保存終了後)
//   //
//   //  objStore.addAll(data); //Chrome OK, Firefox NG(後日変更)
//   //==============================
//   addAll({ data, debug = false }) {  //data=[{'KEY':VALUE,'TTL1':VALUE,...},{'KEY':VALUE,...}]
//     if (!data) throw Error('no data')
//     if (this.status === idbSTATUS.ERR) throw Error('status error')

//     const debug_pref = 'IndexedDBClass[' + this.dbObj.name + ']: addAll: '
//     if (debug) console.log(debug_pref)

//     return new Promise((resolve, reject) => {
//       try {
//         const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);

//         //■ Open Request: 成功
//         request.onsuccess = (event) => {
//           if (debug) console.log(debug_pref, 'DB opened')

//           const db = event.target.result;
//           const transaction = db.transaction(this.storeObj.name, "readwrite");
//           const objStore = transaction.objectStore(this.storeObj.name);

//           let counter = 0;
//           for (const n of [...data]) {       //add では Error が表示されない
//             let storeReq = objStore.put(n);    //PUT!!!
//             counter++;
//             //throw Error せずに、ログのみ残して、put() 継続する
//             storeReq.onerror = (e) => console.log('Error', e.messge)
//           }
//           objStore.close();

//           if (debug) console.log(debug_pref, 'Added Record:' + counter)
//           if (debug) console.log(debug_pref, 'DB closed')

//           resolve(idbSTATUS.OK);

//           //■ Transaction: 成功
//           transaction.oncomplete = () => {
//             if (debug) console.log(debug_pref, 'Transaction complete')
//             const db = request.result
//             db.close();
//           }

//           //■ Transaction: エラー
//           transaction.onerror = (e) => {
//             const db = request.result
//             db.close();
//             throw Error(e.messge);
//           }
//         }

//         //■ Open Request: エラー
//         request.onerror = (e) => { throw Error(e.message) }

//       } catch (e) {
//         console.error(debug_pref, "Error ", e.messge);
//         reject(idbSTATUS.ERR)
//       }
//     });
//   }

//   //==============================
//   // 追加(add) 1行追加(戻り値: id)
//   //==============================
//   add({ data, debug = false }) {
//     if (!data) throw Error('no data')
//     if (this.status === idbSTATUS.ERR) throw Error('status error')

//     const debug_pref = 'IndexedDBClass[' + this.dbObj.name + ']: add: '
//     if (debug) console.log(debug_pref)

//     return new Promise((resolve, reject) => {
//       try {
//         const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
//         request.onsuccess = (event) => {
//           if (debug) console.log(debug_pref, 'DB opened')

//           const db = event.target.result;
//           const transaction = db.transaction(this.storeObj.name, "readwrite");
//           const objStore = transaction.objectStore(this.storeObj.name);
//           const storeReq = objStore.put(data);

//           storeReq.onsuccess = (e) => resolve(e.target.result);
//           storeReq.onerror = (e) => { throw Error(e.message) }

//           if (debug) console.log(debug_pref, 'DB closed')
//         }
//       } catch (e) {
//         console.log('IndexedDBClass: ', 'add():', e.message);
//         reject(idbSTATUS.ERR)
//       }
//     });
//   }


//   //==============================
//   // 更新1行(戻り値: boolean)
//   //==============================
//   update({ key, data, debug = false }) {
//     if (!data) throw Error('no data')
//     if (this.status === idbSTATUS.ERR) throw Error('status error')
//     return new Promise((resolve, reject) => {
//       try {
//         const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
//         request.onsuccess = (event) => {
//           const db = event.target.result;
//           //if (!this.db || !data) throw Error('DB or data empty')
//           const transaction = db.transaction(this.storeObj.name, "readwrite");
//           const objStore = transaction.objectStore(this.storeObj.name);

//           const storeReq = objStore.put(data, key);
//           storeReq.onsuccess = (event) => resolve(event.target.result);
//         }
//       } catch (e) {
//         console.log('IndexedDBClass: ', 'update():', e.message);
//         reject(idbSTATUS.ERR)
//       }
//     });
//   }

//   //==============================
//   // 取得(１件)
//   //==============================
//   getOne({ key, debug = false }) {
//     if (!key) throw Error('no key')
//     //console.log('IndexedDBClass: ', 'getOne():', this.status)

//     if (this.status === idbSTATUS.ERR) throw Error('status error')

//     return new Promise((resolve, reject) => {
//       try {
//         //console.log(11)
//         const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
//         //console.log(12)
//         request.onsuccess = (event) => {
//           //console.log(30)
//           const db = event.target.result;
//           const transaction = db.transaction(this.storeObj.name, "readonly");
//           const objStore = transaction.objectStore(this.storeObj.name);
//           const storeReq = objStore.get(key);
//           storeReq.onsuccess = (event) => {
//             //console.log(40, event.target.result)
//             resolve(event.target.result || null);
//           }
//         }
//       } catch (e) {
//         //console.log(20)
//         console.error('IndexedDBClass: ', 'getOne():', e.message);
//         reject(idbSTATUS.ERR)
//       }
//     });
//   }

//   //==============================
//   // 取得(全件)
//   //==============================
//   getAll({ debug = false }) {
//     if (this.status === idbSTATUS.ERR) throw Error('status error')

//     return new Promise((resolve, reject) => {
//       try {
//         const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
//         request.onsuccess = (event) => {
//           const db = event.target.result;
//           const transaction = db.transaction(this.storeObj.name, "readonly");
//           const objStore = transaction.objectStore(this.storeObj.name);
//           const storeReq = objStore.getAll();
//           storeReq.onsuccess = event => {
//             resolve(event.target.result);
//           }
//         }
//       } catch (e) {
//         console.error('IndexedDBClass: ', 'getAll():', e.message);
//         reject(idbSTATUS.ERR)
//       }
//     });
//   }

//   //==============================
//   // 削除(ALL)
//   //==============================
//   deleteAll({ debug = false }) {
//     if (this.status === idbSTATUS.ERR) throw Error('status error')

//     return new Promise((resolve, reject) => {
//       //     try {
//       //       const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
//       //       request.onsuccess = (event) => {
//       //         const db = event.target.result;

//       //       }
//       //     } catch (e) {
//       //       console.log('IndexedDBClass: ', 'XXX():', e.message);
//       //       reject(idbSTATUS.ERR)
//       //     }
//       // if (!this.db || !key) { console.log('delete Error', !!this.db, !!key); return null; }
//       // const transaction = this.db.transaction(this.storeObj.name, "readwrite");
//       // const objStore = transaction.objectStore(this.storeObj.name);
//       // const storeReq = objStore.delete(key);
//       // storeReq.onsuccess = event => {
//       //   resolve(event.type); //event.type="success"
//       // };
//     });
//   }

//   //==============================
//   // 削除(1行)
//   //==============================
//   delete({ key, debug = false }) {
//     //if (!key) throw Error('no key')
//     //if (this.status === idbSTATUS.ERR) throw Error('status error')

//     return new Promise((resolve, reject) => {
//       //     try {
//       //       const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);
//       //       request.onsuccess = (event) => {
//       //         const db = event.target.result;

//       //       }
//       //     } catch (e) {
//       //       console.log('IndexedDBClass: ', 'XXX():', e.message);
//       //       reject(idbSTATUS.ERR)
//       //     }
//       if (!this.db || !key) { console.log('delete Error', !!this.db, !!key); return null; }
//       const transaction = this.db.transaction(this.storeObj.name, "readwrite");
//       const objStore = transaction.objectStore(this.storeObj.name);
//       const storeReq = objStore.delete(key);
//       storeReq.onsuccess = event => {
//         resolve(event.type); //event.type="success"
//       };
//     });
//   }
// }
