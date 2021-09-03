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
  "时候，父母就会提醒：“今晚记得回家吃饭哦！”。",
  "当然Keeth,最主要的行动原因银行行不行",
  "每年七月十四的时候，父母就会提醒：“今晚记得回家吃饭哦！”。",
  "据民间传说七月十五是ghost门大开、百ghost夜行的日子",
  "过了七月十四就是七月十五，所以吃完饭，父母还不忘提醒：“今晚没事不要出门！",
  "我家会在七月十四，把家里先人遗照、牌位请出来，进行祭拜。",
  "晚上的时候，在路边、在树下，时常有路人，点燃蜡烛、焚烧纸钱、摆上祭品，进行祭拜。",
];

const idbJibo = new IndexedDBClass({
  db: { name: "dict_1_jibo", version: 1 },
  store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
  file: "./data/dict_1_jibo.json"
});

const idbMain = new IndexedDBClass({
  db: { name: "dict_2_main", version: 1 },
  store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
  file: "./data/dict_2_main.json"
});

const idbPron = new IndexedDBClass({
  db: { name: "dict_3_pron", version: 1 },
  store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
  file: "./data/dict_3_pron.json"
});

const idbExtra = new IndexedDBClass({
  db: { name: "dict_4_extra1", version: 1 },
  store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
  file: "./data/dict_4_extra.json"
});

function XxxData() {
  const { register, handleSubmit, setValue, getValues } = useForm();

  const [sounds, setSounds] = useState([]);
  const [sampleidx, setSampleidx] = useState(0);
  const [withNote, setWithNote] = useState(true);
  const [withPY, setWithPY] = useState(true);
  const [withColor, setWithColor] = useState(true);

  // const [isAllDictReady, setIsAllDictReady] = useState(false);
  // const [msgText, setMsgText] = useState('');

  useEffect(
    () => { (async () => { await IndexedDB4Dict({ idbClass: idbJibo }) })() }, []
  );
  useEffect(
    () => { (async () => { await IndexedDB4Dict({ idbClass: idbMain }) })() }, []
  );
  useEffect(
    () => { (async () => { await IndexedDB4Dict({ idbClass: idbPron }) })() }, []
  );
  useEffect(
    () => { (async () => { await IndexedDB4Dict({ idbClass: idbExtra }) })() }, []
  );

  // [■HANDLER] 変換
  const handleChange = () => {  //console.log('handleChange'); 
    (async () => {
      let sentence = getValues('txtChinese')
      //let sentence = data.txtChinese;  //引数: data
      if (!sentence) return
      const res = await makeLetterColored({
        sentence, idbMain, idbExtra, idbJibo, idbPron
      })  //console.log(res);
      if (res) setSounds(res)
    })();
  }

  // [■HANDLER]  クリア
  const handleClear = () => {
    setSounds(null)
    setSampleidx(0)
    setValue('txtChinese', '')
  }

  // [■HANDLER] サンプル文章取得
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
    handleChange()
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
            onKeyPress={e => {
              if (e.key === 'Enter') {
                console.log('KEY PRESSED ENTER!!!!')
                handleChange()
              }
            }}
          />
          <Button color="secondary" variant="contained"
            className={style.clearbutton}
            onClick={handleSubmit(handleClear)}
            style={{ 'marginLeft': '20px' }}
          >消</Button>
        </div>

        <div className={style.body_tr}>
          <Button color="primary" variant="contained"
            className={style.inputbutton}
            onClick={handleSubmit(handleChange)}
            style={{ 'marginRight': '20px' }}
          >実行</Button>

          <FormControlLabel label="色"
            control={
              <Checkbox className={style.pycheck} checked={withColor}
                onChange={() => setWithColor(!withColor)}
              />
            }
          />

          <FormControlLabel label="拼音"
            control={
              <Checkbox className={style.pycheck} checked={withPY}
                onChange={() => setWithPY(!withPY)}
              />
            }
          />

          <FormControlLabel label="凡例"
            control={
              <Checkbox className={style.pycheck} checked={withNote}
                onChange={() => setWithNote(!withNote)}
              />
            }
          />
        </div>

        <div className={style.body_tr}>
          {
            sounds && (
              <div className={style.output}>
                {/* {console.log('SOUNDS CALLED')} */}
                {sounds.map(item =>
                  <KanjiHTML key={item.idx}
                    item={item}
                    withPY={withPY}
                    withColor={withColor}
                    colors={colors}
                  />
                )}
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