(()=>{var t={383:(t,e,i)=>{const{getRelativePosition:s}=i(891);t.exports=class{constructor(t){this._opt=Object.assign({container:"#Dotline",width:1920,height:1080,dotSum:100,speed:1,speedx:null,speedy:null,maxLength:100,dotStyle:{fill:"gray",r:2},lineStyle:{stroke:"rgb(0,0,0)","stroke-width":1},background:null,mouseEffect:!1,mouseDistance:100},t),this._timer=null,this._dots=[],this._lines=[];let e=document.querySelector(this._opt.container),i=e;"CANVAS"!==e.tagName&&(i=document.createElement("canvas"),e.appendChild(i),i.setAttribute("style","width:100%;height:100%;")),this._opt.width&&i.setAttribute("width",this._opt.width),this._opt.height&&i.setAttribute("height",this._opt.height),this._canvas=i,this._ctx=i.getContext("2d"),this._ratio={x:this._opt.width/e.clientWidth,y:this._opt.height/e.clientHeight},this.init(),this._mousePosition={x:0,y:0}}init(){this._ctx.clearRect(0,0,this._opt.width,this._opt.height),this._createDots(),this._createLines(),this._drawBg(),this._draw(),this._mounseMove()}start(){this._timer=!0,this._animation()}end(){this._timer=!1}restart(){this.init(),this.start()}_mounseMove(){let t=this;this._canvas.onmousemove=function(e){if(t._opt.mouseEffect){let i=s(e);t._mousePosition={x:i.x*t._ratio.x,y:i.y*t._ratio.y}}},this._canvas.onmouseout=function(){t._mousePosition.x=t._mousePosition.y=0}}_animation(){this._timer&&(this._moveDots(),this._createLines(),this._draw(),requestAnimationFrame(this._animation.bind(this)))}_createDots(){this._dots=[];let t=this._opt.speedx||this._opt.speed||2,e=this._opt.speedy||this._opt.speed||2;for(;this._opt.dotSum-- >0;)this._dots.push({dom:null,x:Math.random()*this._opt.width^1,y:Math.random()*this._opt.height^1,stepx:+(Math.random()*t-t).toFixed(2),stepy:+(Math.random()*e-e).toFixed(2)})}_moveDots(){let{width:t,height:e}=this._opt,{x:i,y:s}=this._mousePosition;this._dots.forEach((o=>{this._opt.mouseEffect&&this._mousePosition.x>0&&this._mousePosition.y>0&&this._opt.mouseDistance>Math.sqrt(Math.pow(o.x-i,2)+Math.pow(o.y-s,2))?((o.x>i&&o.stepx>0||o.x<i&&o.stepx<0)&&(o.stepx*=-1),(o.y>s&&o.stepy>0||o.y<s&&o.stepy<0)&&(o.stepy*=-1)):(o.stepx=o.x>t||o.x<1?0-o.stepx:0+o.stepx,o.stepy=o.y>e||o.y<1?0-o.stepy:0+o.stepy),o.x=+o.x+o.stepx,o.y=+o.y+o.stepy}))}_createLines(){this._lines=[],this._dots.forEach(((t,e)=>{for(let i=0;i<this._dots.length;i++){if(i<=e)continue;let s=this._dots[i],o=t.x-s.x,h=t.y-s.y,n=Math.sqrt(o*o+h*h);n<this._opt.maxLength&&n>0&&this._lines.push([t,s,n])}}))}_drawBg(){this._opt.background&&(this._ctx.fillStyle=this._opt.background,this._ctx.fillRect(0,0,this._opt.width,this._opt.height))}_draw(){if(this._ctx.clearRect(0,0,this._opt.width,this._opt.height),this._drawBg(),null!==this._opt.dotStyle&&(this._ctx.beginPath(),this._ctx.fillStyle=this._opt.dotStyle.fill,this._dots.map((t=>{this._ctx.arc(t.x,t.y,this._opt.dotStyle.r,0,2*Math.PI,!0)})),this._ctx.stroke()),null!==this._opt.lineStyle){let t,e=this._opt.lineStyle.stroke;this._lines.map((([i,s,o])=>{this._ctx.beginPath(),t=(1-o/this._opt.maxLength).toFixed(2),this._ctx.strokeStyle=`rgba${e.replace(/rgba(\(.+)\)/,"$1")}, ${parseFloat(t+.2).toFixed(1)})`,this._ctx.lineWidth=this._opt.lineStyle["stroke-width"]*t,this._ctx.moveTo(i.x,i.y),this._ctx.lineTo(s.x,s.y),this._ctx.stroke()}))}}}},891:t=>{"use strict";var e=function(t){return"number"==typeof t&&!isNaN(t)};t.exports.getRelativePosition=function(t,i){var s=(i=i||t.currentTarget).getBoundingClientRect(),o=t.originalEvent||t,h=0,n=0;return t.touches&&t.touches.length?e(t.touches[0].pageX)&&e(t.touches[0].pageY)?(h=t.touches[0].pageX,n=t.touches[0].pageY):e(t.touches[0].clientX)&&e(t.touches[0].clientY)&&(h=o.touches[0].clientX,n=o.touches[0].clientY):e(t.pageX)&&e(t.pageY)?(h=t.pageX,n=t.pageY):t.currentPoint&&e(t.currentPoint.x)&&e(t.currentPoint.y)&&(h=t.currentPoint.x,n=t.currentPoint.y),{x:h-s.left,y:n-s.top}}}},e={},i=function i(s){var o=e[s];if(void 0!==o)return o.exports;var h=e[s]={exports:{}};return t[s](h,h.exports,i),h.exports}(383);exports.Dotline=i})();