// import IndexedDBDictClass from './store/IndexedDBDictClass'

// export const idbJibo = new IndexedDBDictClass({
//   db: { name: "dict_1_jibo", version: 1 },
//   store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
//   //indeces: [{idxName: "JB", unique: false },]
//   file: "./data/dict_1_jibo.json"
// });

// export const idbMain = new IndexedDBDictClass({
//   db: { name: "dict_2_main", version: 1 },
//   store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
//   file: "./data/dict_2_main.json"
// });

// export const idbPron = new IndexedDBDictClass({
//   db: { name: "dict_3_pron", version: 1 },
//   store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
//   file: "./data/dict_3_pron.json"
// });

// export const idbExtra = new IndexedDBDictClass({
//   db: { name: "dict_4_extra", version: 1 },
//   store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
//   file: "./data/dict_4_extra.json"
// });

export const sample_base_path = "./data/"
export const sample_map = new Map([
  ['hong', { TTL: '紅小帽', FILE: 'sentence_akazukin.json' }],
  ['holday', { TTL: '休暇', FILE: 'sentence_holiday.json' }],
]);
