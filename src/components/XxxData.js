import React, { useEffect, useState } from 'react';
import { getJson } from '../api/getJson';
import makeLetterColored from './makeLetterColored'
import { KanjiHTML } from './KanjiHTML';
import PinYinColorExplain from './PinYinColorExplain'

import IndexedDBClass, { CON_STATUS } from './IndexedDBClass'

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

function XxxData() {
  const { register, handleSubmit, setValue } = useForm();

  const [dict_main, setDictMain] = useState(null);
  const [dict_extra, setDictExtra] = useState(null);
  const [dict_jibo, setDictJibo] = useState(null);
  const [sounds, setSounds] = useState(null);
  const [sampleidx, setSampleidx] = useState(0);
  const [withNote, setWithNote] = useState(true);
  const [withPY, setWithPY] = useState(true);

  const [testText, setTestText] = useState('');

  const idbClassJB = new IndexedDBClass({
    db: { name: "chinesePingYinDic134", version: 2 },
    store: {
      name: "jibo",
      storeOptions: { keyPath: "JB", autoIncrement: false },
      indexes: []
    }
  });

  useEffect(
    () => {
      (async () => {
        const res = await getJson("./data/dict_main.json")
        if (res) { setDictMain(res) }
      })();
      (async () => {
        const res = await getJson("./data/dict_extra.json")
        if (res) { setDictExtra(res) }
      })();
      // (async () => {
      //   const res = await getJson("./data/jibo.json")
      //   if (res) { setDictJibo(res) }
      // })();
    }, []
  );

  const handleTestData = async () => {
    const key = '一'
    let dictResult = '';

    const con = await idbClassJB.connectIDB();
    switch (con) {
      case CON_STATUS.OK:
        console.log('辞書既成');
        dictResult = await idbClassJB.getOne(key)
        console.log('検索結果: ', dictResult)
        setTestText(JSON.stringify(dictResult))
        break;
      case CON_STATUS.NEW: //新規作成
        console.log('辞書新規/Verアップ開始');
        const fileName = "./data/jibo_array.json"
        const res = await getJson(fileName)
        if (!res) return null;  //FILE OPEN エラー

        setTestText('辞書再構成開始')
        //console.log('辞書新規/Verアップ');
        const result = await idbClassJB.addAll(res);  //全登録
        console.log(result)
        dictResult = await idbClassJB.getOne(key)
        console.log('検索結果: ', dictResult)
        setTestText(JSON.stringify(dictResult))
        break;
      default: //CON_STATUS.ERR
        console.log('Error');
        setTestText('Error')
        break;
    }
  }

  // TEST----------------------------------------------------
  // const handleTestData = async () => {
  //   const con = await idbClass.connectIDB()
  //   if (!con) return;

  //   const key = '一'
  //   const datavalue = await idbClass.getOne(key)
  //   console.log(datavalue)

  //   const dataAll = await idbClass.getAll()
  //   console.log(dataAll)
  //   setTestText(JSON.stringify(dataAll))
  // }
  // TEST----------------------------------------------------

  // 変換
  const handleChange = (data) => {
    let sentence = data.txtChinese;
    if (!sentence) return
    const res = makeLetterColored({ sentence, dict_main, dict_extra, idbClassJB })
    if (res) setSounds(res)
  }

  const handleExample = (dir) => {
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
            <ArrowBackIosIcon
              color="primary"
              onClick={() => { handleExample('prev') }}
              variant="Outlined"
            />
            <div className={style.textsamplettl}>サンプル</div>
            <ArrowForwardIosIcon
              color="primary"
              onClick={() => { handleExample('next') }}
              variant="Outlined"
            />
          </div>
        </div>

        <div className={style.body_tr}>
          <TextField
            type="text"
            {...register('txtChinese', { required: true })}
            defaultValue={sampleText[0]}
            className={style.inputfield}
          />
        </div>

        <div className={style.body_tr}>
          {/* <Button
            onClick={() => { handleSetData() }}
            className={style.inputbutton}
            variant="contained"
            color="secondary"
            style={{ 'marginRight': '10px' }}
          >データ</Button> */}
          <Button
            onClick={() => { handleTestData() }}
            className={style.inputbutton}
            variant="contained"
            color="secondary"
            style={{ 'marginRight': '10px' }}
          >Test</Button>

          <Button
            onClick={handleSubmit(handleChange)}
            className={style.inputbutton}
            variant="contained"
            color="primary"
            style={{ 'marginRight': '30px' }}
          >声調彩色</Button>

          <FormControlLabel
            label="拼音"
            control={
              <Checkbox
                checked={withPY}
                onChange={() => setWithPY(!withPY)}
                inputProps={{ 'aria-label': 'controlled' }}
                className={style.pycheck}
              />
            }
          />

          <FormControlLabel
            label="凡例"
            control={
              <Checkbox
                checked={withNote}
                onChange={() => setWithNote(!withNote)}
                inputProps={{ 'aria-label': 'controlled' }}
                className={style.pycheck}
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
        <div className={style.body_tr} style={{ fontSize: '20px' }}>{testText}</div>
      </div>
    </>
  )
}

export default XxxData;

// 每年七月十四的时候，父母就会提醒：“今晚记得回家吃饭哦！”。据民间传说七月十五是ghost门大开、百ghost夜行的日子，过了七月十四就是七月十五，所以吃完饭，父母还不忘提醒：“今晚没事不要出门！”

// 我家会在七月十四，把家里先人遗照、牌位请出来，进行祭拜。晚上的时候，在路边、在树下，时常有路人，点燃蜡烛、焚烧纸钱、摆上祭品，进行祭拜。

// 至于七月十四餐桌上的美食，自然少不了鸭子，在南宁鸭子的做法有很多：柠檬鸭、白切鸭、闷烧鸭、烧鸭等等。

// 为什么要在七月十四吃鸭子，民间的传说很多，大家有兴趣的，可以去搜索了解下。

// 当然最主要的原因是七月十四的时候，鸭子发育得正好，肉质肥嫩，入口即化，是吃鸭子的好季节。

// 在本地，我们都会选择好的鸭子品种来制作，比如土鸭、樱桃鸭、青头鸭，这些鸭子够土，肉质紧实。