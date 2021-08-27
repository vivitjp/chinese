export default class CvsFrameWork {
  constructor(ctx, width, height) {
    this.OK = !!(ctx)
    this.ctx = ctx;
    this.width = width || 200;
    this.height = height || 100;
  }

  // num = 9;
  // isLeagal() { return this.age > 19; } //注意:functionは付けない

  //プロパティ(変数)getter/setter
  // set name(name) { this._name = name; }
  // get name() { return this._name; }

  //Staticプロパティ(変数)/メソッド
  // static sData = 'static data';
  // static sFunc() { console.log('Static Func'); }

  drawRect = (x, y, w, h, color = '#AAA', thickness = '0.3') => {
    if (!this.OK) return
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = thickness
    this.ctx.strokeRect(x, y, w, h);
  }

  clearRect = () => {
    if (!this.OK) return
    this.ctx.clearRect(0, 0, this.width, this.height);  //全消去
  }

}