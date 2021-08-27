import React, { useState, useEffect, useRef } from 'react'
import CvsFrameWork from './CvsFrameWork'

const Chanvas = ({ height, width }) => {
  const [ctx, setCtx] = useState(null)
  const canvasRef = useRef();

  //console.log('height, width', height, width);

  // ここで Canvas の高さを測定する必要あり!!
  // 
  const canvas_w = width - 30;
  const canvas_h = 200;  //height

  useEffect(() => {
    canvasRef.current.width = canvas_w;
    canvasRef.current.height = canvas_h;
    const cvsContext = canvasRef.current.getContext("2d")
    setCtx(cvsContext)
  }, [])

  useEffect(() => {
    if (ctx === null) return

    const cvs = new CvsFrameWork(ctx, canvas_w, canvas_h)
    cvs.clearRect();
    cvs.drawRect(2, 2, canvas_w - 2, canvas_h - 2);

    ctx.fillStyle = 'orange'
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.textAlign = 'left';
    ctx.fillText('你好简单的', 20, 20);
  }, [ctx])

  return (<canvas ref={canvasRef}></canvas>)
}

export default Chanvas