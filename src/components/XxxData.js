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
import CircularProgress from '@material-ui/core/CircularProgress'

const colors = ['#AAA', '#666', 'DodgerBlue', 'SeaGreen', 'Tomato'];

const idbJibo = new IndexedDBClass({
  db: { name: "dict_1_jibo", version: 1 },
  store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
  //indexes: [{idxName: "JB", unique: false },]
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
  db: { name: "dict_4_extra", version: 1 },
  store: { name: "dict", storeOptions: { keyPath: "W", autoIncrement: false }, },
  file: "./data/dict_4_extra.json"
});

const idbSample = new IndexedDBClass({
  db: { name: "dict_5_sample", version: 1 },
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
  const [sampleReady, setSampleReady] = useState(false);

  const [withNote, setWithNote] = useState(false);
  const [withPY, setWithPY] = useState(true);
  const [withColor, setWithColor] = useState(true);

  const [allDicReady, setAllDicReady] = useState(false);

  // const [isAllDictReady, setIsAllDictReady] = useState(false);
  // const [msgText, setMsgText] = useState('');

  useEffect(
    () => {
      (async () => {
        await Promise.all([
          IndexedDB4Dict({ idbClass: idbJibo }),
          IndexedDB4Dict({ idbClass: idbMain }),
          IndexedDB4Dict({ idbClass: idbPron }),
          IndexedDB4Dict({ idbClass: idbExtra }),
        ]);
        const res = await getJson(idbSample.file);
        if (res) { setSample(res); }

        //以下はデバグ用タイマー
        setTimeout(() => { setAllDicReady(true); setSampleReady(true); }, 5000);
      })()
    }, []
  )

  // useEffect(
  //   () => {
  //     (async () => {
  //       const res = await getJson(idbSample.file);
  //       if (res) setSample(res);
  //     })()
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

  // [■HANDLER] サンプル文章取得
  const handleSample = (dir) => {
    console.log('handleSample Called allDicReady:', allDicReady)

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
          <ArrowBackIosIcon variant="Outlined" style={stylePrevBtn}
            color={sampleReady ? "secondary" : "disabled"}
            onClick={() => { if (sampleReady) handleSample('prev') }}
          />
          <ArrowForwardIosIcon variant="Outlined" style={styleNextBtn}
            color={sampleReady ? "secondary" : "disabled"}
            onClick={() => { if (sampleReady) handleSample('next') }}
          />
        </div>
        <div className={style.controlbarRight}>
          {sampleReady && <div className={style.textsamplettl}>小紅帽</div>}
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
          //defaultValue="一般一半一个人一生不是不买不卖不一样"
          />
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
            disabled={!allDicReady}
          >実行</Button>
        </div>

        {
          !allDicReady && (
            <div className={style.body_tr}>
              <CircularProgress color="secondary" />
            </div>
          )
        }

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