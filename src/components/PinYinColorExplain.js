import React from 'react'
import style from './PinYinColorExplain.module.css'

//const colors = ['#AAA', '#666', 'DodgerBlue', 'SeaGreen', 'Tomato'];

const PinYinColorExplain = ({ colors }) => {
  return (
    <div className={style.note_box}>
      <span className={style.note} style={{ color: colors[1] }}>①声</span>
      <span className={style.note} style={{ color: colors[2] }}>②声</span>
      <span className={style.note} style={{ color: colors[3] }}>③声</span>
      <span className={style.note} style={{ color: colors[4] }}>④声</span>
      <span className={style.note} style={{ color: colors[0] }}>軽声</span>
    </div>
  )
}

export default PinYinColorExplain