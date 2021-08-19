import React, { useEffect, useState, useRef } from 'react';
import { getJson } from '../api/getJson';
import makeLetterColored from './makeLetterColored'
import { KanjiHTML } from './KanjiHTML';
import './XxxData.css'

function XxxData() {
  const inputRef = useRef(); //参照変数宣言

  const [jibo, setJibo] = useState(null);
  const [dict, setDict] = useState(null);
  const [tree, setTree] = useState(null);
  const [sounds, setSounds] = useState(null);
  const [withPY, setWithPY] = useState(false);

  useEffect(
    () => {
      (async () => {
        const res = await getJson("./data/jibo.json")
        if (res) { setJibo(res) }
      })();
      (async () => {
        const res = await getJson("./data/dic.json")
        if (res) { setDict(res) }
      })();
      (async () => {
        const res = await getJson("./data/dic_tree.json")
        if (res) { setTree(res) }
      })();
    }, []
  );

  const handleChange = () => {
    let sentence = inputRef.current.value;
    if (!sentence) return
    const res = makeLetterColored({ sentence, jibo, dict, tree })
    console.log(res)
    if (res) setSounds(res)
  }

  return (
    <>
      <div className="transbody">
        <div className="body_tr">
          中国語を入力してください
        </div>
        <div className="body_tr">
          <input
            type="text"
            ref={inputRef}
            defaultValue={"重音你们都是从重温日本来的重温旧梦吗？"}
            className="inputfield"
          />
        </div>
        <div>
          <div>重温	zhòng wēn</div>
          <div>重温旧梦	chóng wēn jiù mèng</div>
          <div>重音	zhòng yīn</div>
        </div>
        <div className="body_tr">
          <input
            type="button"
            value='Change'
            onClick={handleChange}
            className="inputbutton"
          />
          PingYin:<input
            type="checkbox" onClick={() => setWithPY(!withPY)}
          />
        </div>
        <div className="body_tr">
          {
            sounds && (
              <div className="output">{
                sounds.map(n => <KanjiHTML item={n} withPY={withPY} />)
              }</div>
            )
          }
        </div>
      </div>
    </>
  )
}

export default XxxData;