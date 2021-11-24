const { getRelativePosition } = require('./util.js');

class Dotline {
    constructor(option) {
        this._opt = Object.assign({
            // 容器选择器名称
            container: '#dotLine',
            // svg尺寸
            width: 1920,
            height: 1080,
            // 粒子数量
            dotSum: 100,
            // 粒子运动的最大速度（可以分别设置x,y的最大运动速度）
            speed: 1,
            speedx: null,
            speedy: null,
            // 允许建立连线的最大粒子距离
            maxLength: 100,
            // 粒子和线条的样式，请参考 <circle> <line>标签的属性进行设置
            dotStyle: { fill: 'gray', r: 2, },
            lineStyle: { stroke: "rgb(0,0,0)", 'stroke-width': 1 },
            // 背景色
            background: null,
            // 鼠标聚集效果
            mouseEffect: false,
            // 产生聚集效果的最大距离
            mouseDistance: 100,
        }, option);
        this._timer = null;
        this._bg = [];
        this._dots = [];
        this._lines = [];
        this.dotStyle = '';
        this.lineStyle = '';

        // tips: svg和html不属于同一个命名空间：
        // 参考：https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createElementNS
        let container = document.querySelector(this._opt.container);
        let _svg = container;
        if (container.tagName !== 'SVG') {
            _svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            container.append(_svg);
            _svg.setAttribute('style', 'width:100%;height:100%;');
        }
        this._svg = _svg;
        _svg.setAttribute('viewBox', `0 0 ${this._opt.width} ${this._opt.height}`);
        this.init();
        this._ratio = {
            x: this._opt.width / container.clientWidth,
            y: this._opt.height / container.clientHeight,
        };

        // 鼠标聚集
        this._mousePosition = { x: 0, y: 0 };
        // resize
    }
    init() {
        this._opt.dotStyle && Object.keys(this._opt.dotStyle).forEach(key => {
            this.dotStyle += key + ':' + this._opt.dotStyle[key] + ';';
        })
        this._opt.lineStyle && Object.keys(this._opt.lineStyle).forEach(key => {
            this.lineStyle += key + ':' + this._opt.lineStyle[key] + ';';
        })
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

    _drawBg() {
        this._bg = this._opt.background ? [`<rect style='width:100%;height:100%;background:${this._opt.background}'></rect>`] : [];
    }
    // 鼠标监听
    _mounseMove() {
        let _self = this;
        this._svg.onmousemove = function (e) {
            if (_self._opt.mouseEffect) {
                let pos = getRelativePosition(e);
                _self._mousePosition = {
                    x: pos.x * _self._ratio.x,
                    y: pos.y * _self._ratio.y,
                };
                // console.log(pos,_self._mousePosition,_self._ratio);
            }
        }
        // todo: 快速移动出去时，无法捕获out事件，导致焦点一直存在
        this._svg.onmouseout = function () {
            _self._mousePosition.x = _self._mousePosition.y = 0;
        }
    }

    _animation() {
        if (!this._timer) return;
        this.moveDots();
        this._createLines();
        this._draw();
        requestAnimationFrame(this._animation.bind(this));
    }

    _createDots() {
        this._dots = [];
        let stepx = (this._opt.speedx || this._opt.speed),
            stepy = (this._opt.speedy || this._opt.speed);
        while (this._opt.dotSum-- > 0) {
            this._dots.push({
                dom: null,
                x: (Math.random() * this._opt.width) ^ 1,
                y: (Math.random() * this._opt.height) ^ 1,
                // 可能是 < 1
                stepx: stepx || +((Math.random() * 2) - 2).toFixed(2),
                stepy: stepy || +((Math.random() * 2) - 2).toFixed(2),
            });
        }
    }
    moveDots() {
        let { width, height } = this._opt;
        let { x, y } = this._mousePosition;
        this._dots.forEach((dot) => {
            // 鼠标附近的dot做向心运动
            if (this._opt.mouseEffect && this._mousePosition.x > 0 && this._mousePosition.y > 0 && this._opt.mouseDistance > Math.sqrt(Math.pow(dot.x - x, 2) + Math.pow(dot.y - y, 2))) {
                // 扭转方向
                if ((dot.x > x && dot.stepx > 0) || (dot.x < x && dot.stepx < 0)) {
                    dot.stepx *= -1;
                }
                if ((dot.y > y && dot.stepy > 0) || (dot.y < y && dot.stepy < 0)) {
                    dot.stepy *= -1;
                }
            } else {
                //点碰到边缘返回
                dot.stepx = (dot.x > width || dot.x < 1) ? 0 - dot.stepx : 0 + dot.stepx;
                dot.stepy = (dot.y > height || dot.y < 1) ? 0 - dot.stepy : 0 + dot.stepy;
            }
            dot.x = +dot.x + dot.stepx;
            dot.y = +dot.y + dot.stepy;
        });
    }
    _createLines() {
        this._lines = [];
        this._dots.forEach((pre, index) => {
            for (let index2 = 0; index2 < this._dots.length; index2++) {
                let next = this._dots[index2];
                if (index2 < index) continue;
                let distance = Math.sqrt(Math.pow(pre.x - next.x, 2) + Math.pow(pre.y - next.y, 2));
                if (distance < this._opt.maxLength) this._lines.push([pre, next, distance]);
            }
        })
    }
    _draw() {
        let dots = this._dots.map(dot => {
            return `<circle cx="${dot.x}" cy="${dot.y}" style="${this.dotStyle}"></circle>`;
        });

        let opacity = 1;
        let lines = this._lines.map(([pre, next, distance]) => {
            opacity = (1 - distance / this._opt.maxLength).toFixed(2);
            return `<line x1="${pre.x}" y1="${pre.y}" x2="${next.x}" y2="${next.y}" style="opacity:${opacity};${this.lineStyle};"></line>`;
        })
        this._svg.innerHTML = this._bg.join('') + dots.join('') + lines.join('');
    }
}
module.exports = Dotline;


