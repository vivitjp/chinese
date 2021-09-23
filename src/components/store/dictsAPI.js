import IndexedDBDictClass from './IndexedDBDictClass'

export const dictNames = {
  jibo: { name: "jibo", num: 1, version: 1 },
  main: { name: "main", num: 2, version: 1 },
  pron: { name: "pron", num: 3, version: 1 },
  extra: { name: "extra", num: 4, version: 1 },
}

const dicts = {}

for (const [key, val] of Object.entries(dictNames)) {
  dicts[key] = {
    db: { name: `dict_${val.num}_${key}`, version: val.version },
    store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
    //indeces: [{idxName: "JB", unique: false },]
    file: `./data/dict_${val.num}_${key}.json`,
  }
}

const dictObj = {}

for (const n of Object.keys(dictNames)) {
  dictObj[n] = new IndexedDBDictClass({ ...dicts[n], });
}

//=====================================
// API: getDicts(): set all Dicts
//=====================================
export const getDicts = async () => {

  await Promise.all([
    ...Object.keys(dictObj).map(n => dictObj[n].setDict({ debug: false }))
  ]);

  //Serialize 可能な形でreturn
  return { status: true }
}

//=====================================
// API: execDicts(): each Dict
//=====================================
export const execDicts = async ({ dict, param }) => {
  // console.log('execDicts  ', dict, dictObj[dict])
  return await dictObj[dict].exec({ ...param });
}
