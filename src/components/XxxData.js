import React, { useEffect, useState } from 'react';
import { getJson } from '../api/getJson';
import makeLetterColored from './makeLetterColored'
import { KanjiHTML } from './KanjiHTML';
import styles from './XxxData.module.css'
import { useForm } from 'react-hook-form'
import { FormControlLabel, Button, Checkbox, TextField } from '@material-ui/core';

function XxxData() {
  const { register, handleSubmit, reset } = useForm();

  //const inputRef = useRef(); //参照変数宣言

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
        const res = await getJson("./data/dict_main.json")
        if (res) { setDict(res) }
      })();
      (async () => {
        const res = await getJson("./data/dict_tree.json")
        if (res) { setTree(res) }
      })();
    }, []
  );

  // 変換
  const handleChange = (data) => {
    //console.log(data)
    let sentence = data.txtChinese;
    if (!sentence) return
    const res = makeLetterColored({ sentence, jibo, dict, tree })
    //console.log(res)
    if (res) setSounds(res)
  }

  return (
    <>
      <div className="transbody">
        <div className={styles.body_ttl}>
          中国語の拼音を彩色表示
        </div>
        <div className={styles.body_tr}>
          <TextField
            type="text"
            {...register('txtChinese', { required: true })}
            defaultValue={"当然最主要的原因是七月十四的时候，鸭子发育得正好，肉质肥嫩，入口即化，是吃鸭子的好季节。"}
            className={styles.inputfield}
          />
        </div>
        <div className={styles.body_tr}>
          <Button
            value='声調彩色'
            onClick={handleSubmit(handleChange)}
            className={styles.inputbutton}
            variant="contained"
            color="primary"
            style={{ 'marginRight': '30px' }}
          >声調彩色</Button>

          <FormControlLabel
            label="PingYin:"
            control={
              <Checkbox
                checked={withPY}
                onChange={() => setWithPY(!withPY)}
                inputProps={{ 'aria-label': 'controlled' }}
                className={styles.pycheck}
              />
            }
          />
        </div>
        <div className={styles.body_tr}>
          {
            sounds && (
              <div className="output">{
                sounds.map((n, i) => <KanjiHTML key={i} item={n} withPY={withPY} />)
              }</div>
            )
          }
        </div>
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