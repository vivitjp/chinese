import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDicts, fetchDicts } from './store/dictsSlice'
//import { selectInfo, infoInitDB, infoGetOne, infoGetAll, infoAdd, infoUpdate, infoDelete, infoClear } from './store/infoSlice'

import { getJson } from '../api/getJson';

import makeLetterColored from './makeLetterColored'
import { KanjiHTML } from './KanjiHTML';
import PinYinColorExplain from './PinYinColorExplain'

//import { idbTYPE, idbStatus } from '../lib/IndexedDBClass'
import style from './XxxData.module.css'

import { useForm } from 'react-hook-form'
import { FormControlLabel, Button, Checkbox, TextField } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CircularProgress from '@material-ui/core/CircularProgress'
import ListOutlinedIcon from '@material-ui/icons/ListOutlined';

//■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□
//  DICTIONARY
//■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□

//import { idbJibo, idbMain, idbPron, idbExtra, sample_base_path, sample_map } from './dicts'
import { sample_base_path, sample_map } from './dicts'

const colors = ['#AAA', '#666', 'DodgerBlue', 'SeaGreen', 'Tomato'];

//■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□
//  SAMPLE DATA
//■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□

// let sampleCounter = 1
// let sampleItems = ['John', 'Smith', 'Kenny', 'Steve', 'Jeff', 'Kelly', 'Bill', 'Grain']

//■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□
//  Main Function
//■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□
function XxxData() {
  //==========================================
  // ■ Redux
  //==========================================
  const dispatchDict = useDispatch();
  //const dispatchInfo = useDispatch();
  //const { loading, error, result } = useSelector(selectInfo);

  //==========================================
  // ■ 変数
  //==========================================
  const { register, handleSubmit, setValue, getValues } = useForm();

  //Menu
  const [isMenuOpened, setMenuOpened] = useState(false);

  const [sounds, setSounds] = useState([]);

  const [sample, setSample] = useState(null);
  const [sampleTTL, setSampleTTL] = useState(null);
  const [sampleidx, setSampleidx] = useState(-1);
  const [sampleJP, setSampleJP] = useState(null);
  const [sampleReady, setSampleReady] = useState(false);

  const [withNote, setWithNote] = useState(false);
  const [withPY, setWithPY] = useState(true);
  const [withColor, setWithColor] = useState(true);

  const [allDicReady, setAllDicReady] = useState(false);

  //==========================================
  // ■ useEffect
  //==========================================
  useEffect(() => { dispatchDict(fetchDicts()) }, [dispatchDict]);   //Dicts
  //useEffect(() => { dispatchInfo(infoInitDB()) }, [dispatchInfo]);   //Info

  useEffect(
    () => {
      (async () => { //以下はデバグ用タイマー
        setTimeout(() => { setAllDicReady(true); }, 1000);
      })()
    }, []
  )

  //==========================================
  // ■ Handlers(Test)
  //==========================================
  // const handleTestAdd = () => {
  //   const data = { KEY: sampleCounter, NAME: sampleItems[sampleCounter] };
  //   dispatchInfo(infoAdd({ data }))
  //   sampleCounter++;
  // }
  // const handleTestUpd = () => {
  //   const data = { KEY: 1, NAME: sampleItems[sampleCounter] + '_upd_' + sampleCounter };
  //   dispatchInfo(infoUpdate({ data, key: 1, debug: true }))
  // }
  // const handleTestDel = () => { dispatchInfo(infoDelete({ key: 1, debug: true })) }
  // const handleTestClear = () => { dispatchInfo(infoClear({ debug: true })) }
  // const handleTestGetOne = () => { dispatchInfo(infoGetOne({ key: 1, debug: true })) }
  // const handleTestGetAll = () => { dispatchInfo(infoGetAll({ debug: true })) }

  //==========================================
  // ■ Handlers
  //==========================================
  // [■HANDLER] 変換
  const handleChange = () => {  //console.log('handleChange'); 
    (async () => {
      let sentence = getValues('txtChinese')
      //let sentence = data.txtChinese;  //引数: data
      if (!sentence) return
      const res = await makeLetterColored({ sentence })
      if (res) setSounds(res)
    })();
  }

  // [■HANDLER] サンプル文章取得
  const handleSample = (dir) => {
    //console.log('handleSample:', allDicReady)

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

  // [■HANDLER] Open Menu
  const handleOpenMenuItem = (key) => {
    try {
      //const item = sample_files[key]
      const item = sample_map.get(key)
      if (!item || !item.FILE) throw Error('No Entry');

      setSampleTTL(item.TTL);

      (async () => {
        const res = await getJson(sample_base_path + item.FILE);
        if (res) {
          setSample(res);
          setSampleReady(true);
        }
        setMenuOpened(false)
      })()
    } catch (e) {

    }
  }

  //==========================================
  // ■ Material-ui SVG Icons CSS
  //==========================================

  const stylePrevBtn = {
    backgroundColor: "rgba(150,150,150,0.2)",
    borderRadius: "25px",
    padding: "5px",
    cursor: "pointer",
    fontSize: "30px",
  }

  const styleNextBtn = {
    backgroundColor: "rgba(150,150,150,0.2)",
    borderRadius: "40px",
    padding: "5px",
    cursor: "pointer",
    fontSize: "60px",
  }

  const styleMenuBtn = {
    position: "relative",
    backgroundColor: "rgba(200,200,200,0.2)",
    color: "#f50057",
    borderRadius: "10px",
    padding: "10px",
    cursor: "pointer",
    fontSize: "60px",
    zIndex: "101"
  }

  //==========================================
  // ■ Main Return
  //==========================================
  return (
    <>
      { /* ========== LEFT MENU ========== */}
      <div className={style.menubutton}>
        <ListOutlinedIcon variant="Outlined" style={styleMenuBtn}
          onClick={() => { setMenuOpened(true) }}
        />
      </div>

      {isMenuOpened &&
        <>
          <div className={style.leftmenu}>
            <div className={style.leftmenu_title}>Menu</div>
            {[...sample_map.keys()].map(key => {
              const cell = sample_map.get(key);
              return <div key={key} className={style.leftmenu_item}
                onClick={() => { handleOpenMenuItem(key) }}>{cell.TTL}</div>
            })}
          </div>
          <div className={style.menu_bglayer}
            onClick={() => { setMenuOpened(false) }}
          ></div>
        </>
      }

      { /* ========== Sample Controller ========== */}
      {sampleReady &&
        <div className={style.controlbar}>
          <div className={style.controlbarLeft}>
            <ArrowBackIosIcon variant="Outlined" style={stylePrevBtn}
              color={"secondary"} onClick={() => { handleSample('prev') }}
            />
            <ArrowForwardIosIcon variant="Outlined" style={styleNextBtn}
              color={"secondary"} onClick={() => { handleSample('next') }}
            />
          </div>
          <div className={style.controlbarSample}>
            <div className={style.textsamplenote}>セットサンプル</div>
            <div className={style.textsamplettl}>{sampleTTL}</div>
          </div>
        </div>
      }

      { /* ========== BODY ========== */}
      <div className={style.mainbody}>
        { /* ---------- TITLE ---------- */}
        <div className={style.body_ttl}>
          <ruby className={style.color1}>声<rt className={style.pron}>Shēng</rt></ruby>
          <ruby className={style.color2}>即<rt className={style.pron}>Jí</rt></ruby>
          <ruby className={style.color3}>彩<rt className={style.pron}>Cǎi</rt></ruby>
          <ruby className={style.color4}>色<rt className={style.pron}>Sè</rt></ruby>
        </div>

        { /* ---------- TEXT INPUT FIELD ---------- */}
        <div className={style.body_tr}>
          <TextField type="text" className={style.inputfield}
            {...register('txtChinese', { required: true })}
            onKeyPress={e => {
              if (e.key === 'Enter') { handleChange() }
            }}
            placeholder="中国語入力後、実行ボタンを押す..."
            defaultValue="一般一半"
          />
        </div>

        { /* ---------- OPTION & BUTTON ---------- */}
        <div className={style.body_tr_flex}>
          <div className={style.body_tr_group}>
            <FormControlLabel label="色"
              control={<Checkbox className={style.pycheck} checked={withColor}
                onChange={() => setWithColor(!withColor)} />} />

            <FormControlLabel label="拼音"
              control={<Checkbox className={style.pycheck} checked={withPY}
                onChange={() => setWithPY(!withPY)} />} />

            <FormControlLabel label="凡例"
              control={<Checkbox className={style.pycheck} checked={withNote}
                onChange={() => setWithNote(!withNote)} />} />
          </div>
          <div className={style.body_tr_group}>
            <Button color="secondary" variant="contained"
              className={style.inputbutton}
              onClick={handleSubmit(handleChange)}
              disabled={!allDicReady}
            >実行</Button>
          </div>
        </div>

        { /* ---------- TEST BUTTONS  ---------- */}
        {/* <div className={style.body_tr_flex}
          style={{ flexWrap: "wrap", alignContent: "space-between" }}
        >
          <Button color="secondary" variant="contained"
            className={style.inputbutton}
            onClick={() => { handleTestGetAll() }}>全取得</Button>
          <Button color="secondary" variant="contained"
            className={style.inputbutton}
            onClick={() => { handleTestGetOne() }}>取得(1)</Button>
          <Button color="secondary" variant="contained"
            className={style.inputbutton}
            onClick={() => { handleTestAdd() }}>挿入</Button>
          <Button color="secondary" variant="contained"
            className={style.inputbutton}
            onClick={() => { handleTestUpd() }}>更新</Button>
          <Button color="secondary" variant="contained"
            className={style.inputbutton}
            onClick={() => { handleTestDel() }}>削除</Button>
          <Button color="secondary" variant="contained"
            className={style.inputbutton}
            onClick={() => { handleTestClear() }}>全削</Button>
          <div>
            <div>{JSON.stringify(result?.result || null)}</div>
            <div>{JSON.stringify(error || null)}</div>
            <div>{JSON.stringify(loading || null)}</div>
          </div>
        </div> */}

        { /* ---------- LOADING CYCLE ---------- */}
        {!allDicReady &&
          <div className={style.body_tr}>
            <CircularProgress color="secondary" />
          </div>
        }

        { /* ---------- PINYIN TEXT ---------- */}
        {
          sounds &&
          <div className={style.body_tr}>
            <div className={style.output}>
              {sounds.map(item =>
                <KanjiHTML key={item.idx}
                  item={item} withPY={withPY} withColor={withColor} colors={colors}
                />
              )}
              {withNote && <PinYinColorExplain colors={colors} />}
            </div>
          </div>

        }

        { /* ---------- NOTE ---------- */}
        <div className={style.body_tr} style={{ marginTop: "0", padding: "0" }}>
          <div className={style.note_small}>※熟語(下部点線)以外の「一」の拼音は不正確</div>
        </div>

        { /* ---------- SAMPLE JP(日本語訳) ---------- */}
        <div className={style.body_tr}>
          {sampleJP && (
            <div className={style.sampleJP}>{sampleJP}</div>
          )}
        </div>
      </div>
    </>
  )
}

export default XxxData;