import React, { useEffect, useState } from 'react';
import makeLetterColored from './makeLetterColored'
import { KanjiHTML } from './KanjiHTML';
import PinYinColorExplain from './PinYinColorExplain'

import IndexedDBClass from './IndexedDBClass'
import IndexedDB4Dict from './IndexedDB4Dict'


import style from './XxxData.module.css'

import { useForm } from 'react-hook-form'
import { FormControlLabel, Button, Checkbox, TextField } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

const colors = ['#AAA', '#666', 'DodgerBlue', 'SeaGreen', 'Tomato'];
const sampleText = [
  "当然最主要的行动原因银行行不行",
  "每年七月十四的时候，父母就会提醒：“今晚记得回家吃饭哦！”。据民间传说七月十五是ghost门大开、百ghost夜行的日子，过了七月十四就是七月十五，所以吃完饭，父母还不忘提醒：“今晚没事不要出门！",
  "我家会在七月十四，把家里先人遗照、牌位请出来，进行祭拜。晚上的时候，在路边、在树下，时常有路人，点燃蜡烛、焚烧纸钱、摆上祭品，进行祭拜。",
  "至于七月十四餐桌上的美食，自然少不了鸭子，在南宁鸭子的做法有很多：柠檬鸭、白切鸭、闷烧鸭、烧鸭等等。",
  "为什么要在七月十四吃鸭子，民间的传说很多，大家有兴趣的，可以去搜索了解下。",
  "当然最主要的原因是七月十四的时候，鸭子发育得正好，肉质肥嫩，入口即化，是吃鸭子的好季节。",
  "在本地，我们都会选择好的鸭子品种来制作，比如土鸭、樱桃鸭、青头鸭，这些鸭子够土，肉质紧实。",
];

const idbClassJB = new IndexedDBClass({
  db: { name: "dict_jibo", version: 1 },
  store: {
    name: "jibo",
    storeOptions: { keyPath: "JB", autoIncrement: false },
    indexes: []
  },
  file: "./data/jibo_array.json"
});

const idbClassExtra = new IndexedDBClass({
  db: { name: "dict_extra", version: 1 },
  store: {
    name: "extra",
    storeOptions: { keyPath: "W", autoIncrement: false },
    indexes: []
  },
  file: "./data/dict_extra_array.json"
});

const idbClassMain = new IndexedDBClass({
  db: { name: "dict_main", version: 1 },
  store: {
    name: "mains",
    storeOptions: { keyPath: "W", autoIncrement: false },
    indexes: []
  },
  file: "./data/dict_main_array.json"
});


function XxxData() {
  const { register, handleSubmit, setValue } = useForm();

  const [sounds, setSounds] = useState([]);
  const [sampleidx, setSampleidx] = useState(0);
  const [withNote, setWithNote] = useState(true);
  const [withPY, setWithPY] = useState(true);

  // const [isAllDictReady, setIsAllDictReady] = useState(false);
  // const [msgText, setMsgText] = useState('');

  useEffect(
    () => {
      (async () => { await IndexedDB4Dict({ idbClass: idbClassMain }) })();
    }, []
  );

  useEffect(
    () => {
      (async () => { await IndexedDB4Dict({ idbClass: idbClassExtra }) })();
    }, []
  );
  useEffect(
    () => {
      (async () => { await IndexedDB4Dict({ idbClass: idbClassJB }) })();
    }, []
  );

  // 変換
  const handleChange = (data) => {
    //console.log('handleChange');
    (async () => {
      let sentence = data.txtChinese;
      if (!sentence) return
      const res = await makeLetterColored({ sentence, idbClassMain, idbClassExtra, idbClassJB })
      //console.log(res);
      if (res) setSounds(res)
    })();
  }

  //サンプル文章取得
  const handleSample = (dir) => {
    console.log('handleSample Called')
    const sampleSize = sampleText.length;
    let newidx = null;
    if (dir === 'prev') { //前に
      newidx = (sampleidx === 0) ? sampleSize - 1 : sampleidx - 1
    } else { //後ろに
      newidx = (sampleidx === sampleSize - 1) ? 0 : sampleidx + 1
    }
    setSampleidx(newidx)
    setValue('txtChinese', sampleText[newidx])
  }

  return (
    <>
      <div className={style.transbody}>
        <div className={style.body_ttl}>
          <ruby className={style.color1}>声<rt className={style.pron}>Shēng</rt></ruby>
          <ruby className={style.color2}>即<rt className={style.pron}>Jí</rt></ruby>
          <ruby className={style.color3}>彩<rt className={style.pron}>Cǎi</rt></ruby>
          <ruby className={style.color4}>色<rt className={style.pron}>Sè</rt></ruby>
        </div>

        <div className={style.body_tr}>
          <div className={style.controlRow}>
            <ArrowBackIosIcon color="primary" variant="Outlined"
              onClick={() => { handleSample('prev') }}
            />
            <div className={style.textsamplettl}>サンプル</div>
            <ArrowForwardIosIcon color="primary" variant="Outlined"
              onClick={() => { handleSample('next') }}
            />
          </div>
        </div>

        <div className={style.body_tr}>
          <TextField type="text" className={style.inputfield}
            {...register('txtChinese', { required: true })}
            defaultValue={sampleText[0]}
          />
        </div>

        <div className={style.body_tr}>
          <Button color="primary" variant="contained" className={style.inputbutton}
            onClick={handleSubmit(handleChange)}
            style={{ 'marginRight': '30px' }}
          >声調彩色</Button>

          <FormControlLabel label="拼音"
            control={
              <Checkbox className={style.pycheck} checked={withPY}
                onChange={() => setWithPY(!withPY)}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
          />

          <FormControlLabel label="凡例"
            control={
              <Checkbox className={style.pycheck} checked={withNote}
                onChange={() => setWithNote(!withNote)}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
          />
        </div>

        <div className={style.body_tr}>
          {
            sounds && (
              <div className={style.output}>
                {sounds.map((n, i) => <KanjiHTML key={i} item={n} dispType={withPY ? 3 : 2} colors={colors} />)}
                {withNote && <PinYinColorExplain colors={colors} />}
              </div>
            )
          }
        </div>
        {/* <div className={style.body_tr} style={{ fontSize: '20px' }}>{testText}</div> */}
      </div>
    </>
  )
}

export default XxxData;