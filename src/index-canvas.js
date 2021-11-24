const { getRelativePosition } = require('./util.js');

class Dotline {
    constructor(option) {
        this._opt = Object.assign({
            // 容器选择器名称
            container: '#Dotline',
            // canvas画布尺寸
            width: 1920,
            height: 1080,
            // 粒子数量
            dotSum: 100,
            // 粒子运动速度，x,y的运动速度
            speed: 1,
            speedx: null,
            speedy: null,
            // 允许建立连线的最大粒子距离
            maxLength: 100,
            // 粒子和线条的样式，请参考
            dotStyle: { fill: 'gray', r: 2, },
            // rgb(18, 33, 63)
            lineStyle: {
                stroke: "rgb(0,0,0)",
                'stroke-width': 1
            },
            // 背景色
            background: null,
            // 鼠标聚集效果
            mouseEffect: false,
            // 产生聚集效果的最大距离
            mouseDistance: 100,
        }, option);
        this._timer = null;
        this._dots = [];
        this._lines = [];

        let container = document.querySelector(this._opt.container);
        let _canvas = container;
        if (container.tagName !== 'CANVAS') {
            _canvas = document.createElement('canvas');
            container.appendChild(_canvas);
            _canvas.setAttribute('style', `width:100%;height:100%;`);
        }
        this._opt.width && _canvas.setAttribute('width', this._opt.width);
        this._opt.height && _canvas.setAttribute('height', this._opt.height);

        this._canvas = _canvas;
        this._ctx = _canvas.getContext('2d');
        this._ratio = {
            x: this._opt.width / container.clientWidth,
            y: this._opt.height / container.clientHeight,
        };

        this.init();
        // 鼠标聚集
        this._mousePosition = { x: 0, y: 0 };
        // resize ?
    }
    // 初始化
    init() {
        this._ctx.clearRect(0, 0, this._opt.width, this._opt.height);
        this._createDots();
        this._createLines();
        this._drawBg();
        this._draw();
        this._mounseMove();
        return this;
    }

    start() {
        this._timer = true;
        this._animation();
        return this;
    }
    end() {
        this._timer = false;
        return this;
    }
    restart() {
        this.init();
        return this.start();
    }
    // 鼠标监听
    _mounseMove() {
        let _self = this;
        this._canvas.onmousemove = function (e) {
            if (_self._opt.mouseEffect) {
                let pos = getRelativePosition(e);
                _self._mousePosition = {
                    x: pos.x * _self._ratio.x,
                    y: pos.y * _self._ratio.y,
                };
            }
        }
        // todo: 快速移动出去时，无法捕获out事件，导致焦点一直存在
        this._canvas.onmouseout = function () {
            _self._mousePosition.x = _self._mousePosition.y = 0;
        }
    }
    // 持续运动
    _animation() {
        if (!this._timer) return;
        this._moveDots();
        this._createLines();
        this._draw();
        requestAnimationFrame(this._animation.bind(this));
    }
    // 生成粒子位置信息
    _createDots() {
        this._dots = [];
        let stepx = (this._opt.speedx || this._opt.speed || 2),
            stepy = (this._opt.speedy || this._opt.speed || 2);
        while (this._opt.dotSum-- > 0) {
            this._dots.push({
                dom: null,
                x: (Math.random() * this._opt.width) ^ 1,
                y: (Math.random() * this._opt.height) ^ 1,
                // 可能是 < 1
                stepx: +((Math.random() * stepx) - stepx).toFixed(2),
                stepy: +((Math.random() * stepy) - stepy).toFixed(2),
            });
        }
    }
    // 移动粒子
    _moveDots() {
        let { width, height } = this._opt;
        let { x, y } = this._mousePosition;
        this._dots.forEach((dot) => {
            // 鼠标附近的dot做向心运动
            if (this._opt.mouseEffect && this._mousePosition.x > 0 && this._mousePosition.y > 0 && this._opt.mouseDistance > Math.sqrt(Math.pow(dot.x - x, 2) + Math.pow(dot.y - y, 2))) {
                // 扭转方向
                if ((dot.x > x && dot.stepx > 0) || (dot.x < x && dot.stepx < 0)) dot.stepx *= -1;
                if ((dot.y > y && dot.stepy > 0) || (dot.y < y && dot.stepy < 0)) dot.stepy *= -1;
            } else {
                //点碰到边缘返回
                dot.stepx = (dot.x > width || dot.x < 1) ? 0 - dot.stepx : 0 + dot.stepx;
                dot.stepy = (dot.y > height || dot.y < 1) ? 0 - dot.stepy : 0 + dot.stepy;
            }
            dot.x = +dot.x + dot.stepx;
            dot.y = +dot.y + dot.stepy;
        });
    }
    // 生成粒子间的线条信息
    _createLines() {
        this._lines = [];
        this._dots.forEach((pre, index) => {
            for (let index2 = 0; index2 < this._dots.length; index2++) {
                if (index2 <= index) continue;
                let next = this._dots[index2];
                let dx = pre.x - next.x,
                    dy = pre.y - next.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this._opt.maxLength && distance > 0) this._lines.push([pre, next, distance]);
            }
        })
    }
    // 给画布增加背景色
    _drawBg() {
        if (!this._opt.background) return;
        this._ctx.fillStyle = this._opt.background;
        this._ctx.fillRect(0, 0, this._opt.width, this._opt.height);
    }
    // 绘图
    _draw() {
        this._ctx.clearRect(0, 0, this._opt.width, this._opt.height);
        this._drawBg();

        if (this._opt.dotStyle !== null) {
            this._ctx.beginPath();
            this._ctx.fillStyle = this._opt.dotStyle.fill;
            this._dots.map(dot => {
                this._ctx.arc(dot.x, dot.y, this._opt.dotStyle.r, 0, Math.PI * 2, true);
            });
            this._ctx.stroke();
        }

        if (this._opt.lineStyle !== null) {
            let opacity, stroke = this._opt.lineStyle['stroke'];
            this._lines.map(([pre, next, distance]) => {
                this._ctx.beginPath();
                opacity = (1 - distance / this._opt.maxLength).toFixed(2);
                this._ctx.strokeStyle = `rgba${stroke.replace(/rgba(\(.+)\)/, '$1')}, ${parseFloat(opacity + 0.2).toFixed(1)})`;
                this._ctx.lineWidth = this._opt.lineStyle['stroke-width'] * opacity;
                this._ctx.moveTo(pre.x, pre.y);
                this._ctx.lineTo(next.x, next.y);
                this._ctx.stroke();
            })
        }
    }
}

module.exports = Dotline;