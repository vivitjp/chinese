import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDicts, fetchDicts } from './store/dictsSlice'

import { getJson } from '../api/getJson';

import makeLetterColored from './makeLetterColored'
import { KanjiHTML } from './KanjiHTML';
import PinYinColorExplain from './PinYinColorExplain'

import IndexedDBClass, { idbTYPE, idbStatus } from '../lib/IndexedDBClass'
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

const idbLogin = new IndexedDBClass({
  db: { name: "login", version: 1 },
  store: { name: "user", storeOptions: { keyPath: "KEY", autoIncrement: false }, },
});

let sampleCounter = 1
let sampleItems = ['John', 'Smith', 'Kenny', 'Steve', 'Jeff', 'Kelly', 'Bill', 'Grain']

//■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□
//  Main Function
//■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□■□
function XxxData() {
  //==========================================
  // ■ DEBUG
  //==========================================
  let debug_pref = 'XxxData: ';

  //==========================================
  // ■ Redux
  //==========================================
  const dispatch = useDispatch();
  //  const { loading, error, dicts } = useSelector(selectDicts);

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
  useEffect(() => {
    dispatch(fetchDicts());
  }, [dispatch]);   //Dicts

  useEffect(
    () => {
      (async () => {
        const res = await idbLogin.initDB({ debug: false })

        //以下はデバグ用タイマー
        setTimeout(() => { setAllDicReady(true); }, 1000);
      })()
    }, []
  )

  //==========================================
  // ■ Handlers(Test)
  //==========================================
  // [■HANDLER] 変換

  const handleTestAdd = () => {
    (async () => {
      const info = { KEY: sampleCounter, NAME: sampleItems[sampleCounter] };
      const res = await idbLogin.exec({ type: idbTYPE.Add, data: info, debug: true })
      if (res) console.log(debug_pref, 'ADD', res.result)

      sampleCounter++;
      if (sampleItems.length <= sampleCounter) sampleCounter = 1
    })().catch((e) => {
      console.error(debug_pref, e.result)
    })
  }

  const handleTestUpd = () => {
    (async () => {
      const info = { KEY: 1, NAME: sampleItems[sampleCounter] + '_upd_' + sampleCounter };
      const res = await idbLogin.exec({ type: idbTYPE.Update, key: 1, data: info, debug: true })
      if (res) console.log(debug_pref, 'UPD', res.result)
    })().catch((e) => {
      switch (e.status) {
        case idbStatus.NOREC2UPD:
          console.error(debug_pref, 'KEY NOT FOUND: ', e.result)
          break;
        default:
          console.error(debug_pref, e.result)
      }
    })
  }

  const handleTestDel = () => {
    (async () => {
      const res = await idbLogin.exec({ type: idbTYPE.Delete, key: 1, debug: true })
      if (res) console.log(debug_pref, 'DEL', res.result)
    })().catch((e) => {
      console.error(debug_pref, e.result)
    })
  }

  const handleTestClear = () => {
    (async () => {
      const res = await idbLogin.exec({ type: idbTYPE.Clear, debug: true })
      if (res) console.log(debug_pref, 'CLEAR', res.result)
    })().catch((e) => {
      console.error(debug_pref, e.result)
    })
  }

  const handleTestGet = () => {
    (async () => {
      const res = await idbLogin.exec({ type: idbTYPE.GetAll, debug: true })
      if (res) console.log(debug_pref, 'GET', res.result)
    })().catch((e) => {
      console.error(debug_pref, 'GetAll', e.result)
    })
  }

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
      //console.log(res);
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
        <div className={style.body_tr_flex}
          style={{ flexWrap: "wrap", alignContent: "space-between" }}
        >
          <Button color="secondary" variant="contained"
            className={style.inputbutton}
            onClick={() => { handleTestGet() }}>取得</Button>
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
        </div>

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