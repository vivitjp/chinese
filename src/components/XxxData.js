import React, { useEffect, useState } from 'react';
import { getJson } from '../api/getJson';
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
// const sampleText = [
//   "时候，父母就会提醒：“今晚记得回家吃饭哦！”。",
//   "当然Keeth,最主要的行动原因银行行不行",
//   "每年七月十四的时候，父母就会提醒：“今晚记得回家吃饭哦！”。",
//   "据民间传说七月十五是ghost门大开、百ghost夜行的日子",
//   "过了七月十四就是七月十五，所以吃完饭，父母还不忘提醒：“今晚没事不要出门！",
//   "我家会在七月十四，把家里先人遗照、牌位请出来，进行祭拜。",
//   "晚上的时候，在路边、在树下，时常有路人，点燃蜡烛、焚烧纸钱、摆上祭品，进行祭拜。",
// ];

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

const idbSample = new IndexedDBClass({
  db: { name: "dict_5_sample1", version: 1 },
  store: { name: "sampl", storeOptions: { keyPath: "idx", autoIncrement: true }, },
  file: "./data/sentence_akazukin.json"
});
//[{"C": "从前有个可爱的小姑娘，", "J": "昔、かわいい小さな女の子がいました。"},


function XxxData() {
  const { register, handleSubmit, setValue, getValues } = useForm();

  const [sounds, setSounds] = useState([]);
  const [sample, setSample] = useState(null);
  const [sampleidx, setSampleidx] = useState(-1);
  const [sampleJP, setSampleJP] = useState(null);

  const [withNote, setWithNote] = useState(false);
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
  useEffect(
    () => {
      (async () => {
        const res = await getJson(idbSample.file);
        if (res) setSample(res);
      })()
    }, []
  );
  // useEffect(
  //   () => {
  //     if (sample) {
  //       setValue('txtChinese', sample[0]["C"])
  //       setSampleJP(sample[0]["J"])
  //       handleChange()
  //     }
  //   }, []
  // );

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
  // const handleClear = () => {
  //   setSounds(null)
  //   setSampleidx(0)
  //   setValue('txtChinese', '')
  // }

  // [■HANDLER] サンプル文章取得
  const handleSample = (dir) => {
    console.log('handleSample Called')
    const sampleSize = sample.length;    //sampleText
    let newidx = null;
    switch (dir) {
      case 'prev': newidx = (sampleidx <= 0) ? sampleSize - 1 : sampleidx - 1
        break;
      case 'next': newidx = (sampleidx === sampleSize - 1) ? 0 : sampleidx + 1
        break;
      default: newidx = 0
    }
    setSampleidx(newidx)
    setValue('txtChinese', sample[newidx]["C"])
    setSampleJP(sample[newidx]["J"])
    handleChange()
  }

  const stylePrevBtn = {
    backgroundColor: "rgba(100,100,100,0.2)",
    borderRadius: "25px",
    padding: "5px",
    cursor: "pointer",
    fontSize: "30px",
  }

  const styleNextBtn = {
    backgroundColor: "rgba(100,100,100,0.2)",
    borderRadius: "40px",
    padding: "5px",
    cursor: "pointer",
    fontSize: "60px",
  }

  return (
    <>
      <div className={style.controlbar}>
        <div className={style.controlbarLeft}>
          <ArrowBackIosIcon color="secondary" variant="Outlined" style={stylePrevBtn}
            onClick={() => { handleSample('prev') }}
          />
          <ArrowForwardIosIcon color="secondary" variant="Outlined" style={styleNextBtn}
            onClick={() => { handleSample('next') }}
          />
        </div>
        <div className={style.controlbarRight}>
          <div className={style.textsamplettl}>小紅帽</div>
        </div>
      </div>
      <div className={style.transbody}>
        <div className={style.body_ttl}>
          <ruby className={style.color1}>声<rt className={style.pron}>Shēng</rt></ruby>
          <ruby className={style.color2}>即<rt className={style.pron}>Jí</rt></ruby>
          <ruby className={style.color3}>彩<rt className={style.pron}>Cǎi</rt></ruby>
          <ruby className={style.color4}>色<rt className={style.pron}>Sè</rt></ruby>
        </div>

        <div className={style.body_tr}>
          <TextField type="text" className={style.inputfield}
            {...register('txtChinese', { required: true })}
            onKeyPress={e => {
              if (e.key === 'Enter') { handleChange() }
            }}
            placeholder="中国語入力後、実行ボタンを押す..."
          />
          {/* <Button color="secondary" variant="contained"
            className={style.clearbutton}
            onClick={handleSubmit(handleClear)}
            style={{ 'marginLeft': '20px' }}
          >消</Button> */}
        </div>

        <div className={style.body_tr}>
          <FormControlLabel label="色"
            control={<Checkbox className={style.pycheck} checked={withColor}
              onChange={() => setWithColor(!withColor)} />} />

          <FormControlLabel label="拼音"
            control={<Checkbox className={style.pycheck} checked={withPY}
              onChange={() => setWithPY(!withPY)} />} />

          <FormControlLabel label="凡例"
            control={<Checkbox className={style.pycheck} checked={withNote}
              onChange={() => setWithNote(!withNote)} />} />

          <Button color="secondary" variant="contained"
            className={style.inputbutton}
            onClick={handleSubmit(handleChange)}
            style={{ 'marginRight': '20px' }}
          >実行</Button>
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
        <div className={style.body_tr}>
          {sampleJP && (<div className={style.sampleJP}>{sampleJP}</div>)}
        </div>
        {/* <div className={style.body_tr} style={{ fontSize: '20px' }}>{testText}</div> */}
      </div>
    </>
  )
}

export default XxxData;