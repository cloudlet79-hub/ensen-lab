// 나만의 행운 카드 이미지 생성 (캔버스) → 저장/SNS 공유
import { cat } from './assets.js';
import { DB } from './store.js';
import { fortune } from './engine.js';
import { today } from './util.js';

function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function wrapText(ctx,text,cx,y,maxW,lh){
  var words=String(text).split(' '),line='',lines=[];
  for(var i=0;i<words.length;i++){var t=line?line+' '+words[i]:words[i];if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=words[i];}else line=t;}
  if(line)lines.push(line);
  var sy=y-(lines.length-1)*lh/2;
  lines.forEach(function(l,i){ctx.fillText(l,cx,sy+i*lh);});
  return lines.length;
}
function svgImg(svg){return new Promise(function(res){var i=new Image();i.onload=function(){res(i);};i.onerror=function(){res(null);};i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});}
async function ensureFonts(){try{await Promise.all([document.fonts.load('600 44px "Noto Serif KR"'),document.fonts.load('700 20px "Gowun Dodum"'),document.fonts.load('800 18px "Manrope"'),document.fonts.load('700 20px "Pretendard Variable"')]);await document.fonts.ready;}catch(e){}}

export async function cardImage(){
  await ensureFonts();
  var f=fortune();var p=DB.profile();var W=800,H=1000,dpr=2;
  var cv=document.createElement('canvas');cv.width=W*dpr;cv.height=H*dpr;
  var ctx=cv.getContext('2d');ctx.scale(dpr,dpr);ctx.textAlign='center';ctx.textBaseline='middle';
  var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fbf6ea');g.addColorStop(1,'#f2ead7');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#dcc9a0';ctx.lineWidth=2;roundRect(ctx,26,26,W-52,H-52,22);ctx.stroke();
  ctx.strokeStyle='#ecdcb6';ctx.lineWidth=6;roundRect(ctx,38,38,W-76,H-76,17);ctx.stroke();
  ctx.fillStyle='#bb9d5c';ctx.font='700 20px "Pretendard Variable",sans-serif';ctx.fillText('❖   나의 행운 문구   ❖',W/2,138);
  var ci=await svgImg(cat(150,'happy'));if(ci)ctx.drawImage(ci,W/2-75,190,150,175);
  ctx.fillStyle='#2a2318';ctx.font='600 42px "Noto Serif KR",serif';
  wrapText(ctx,f.phrase,W/2,470,W-170,60);
  if(f.oh){
    // 오행 원형 심볼
    [W/2-150,W/2+150].forEach(function(x){ctx.beginPath();ctx.arc(x,600,26,0,7);ctx.strokeStyle='#d9c088';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#9c8348';ctx.font='700 22px "Noto Serif KR",serif';ctx.fillText(f.han,x,602);});
    ctx.fillStyle='#9c8348';ctx.font='700 20px "Pretendard Variable",sans-serif';ctx.fillText('— 오행 '+f.oh+'('+f.han+') · '+f.kw+' —',W/2,600);
  }
  ctx.fillStyle='#8a7550';ctx.font='700 22px "Gowun Dodum","Pretendard Variable",sans-serif';
  var who=(p.nickname?p.nickname+' · ':'')+today();
  ctx.fillText(who,W/2,720);
  ctx.fillStyle='#c3ad76';ctx.font='800 20px "Manrope",sans-serif';
  ctx.save();ctx.translate(W/2,H-90);var t='ENSEN LAB';var ls=6;var tw=ctx.measureText(t).width+ls*(t.length-1);var sx=-tw/2;ctx.textAlign='left';for(var i=0;i<t.length;i++){ctx.fillText(t[i],sx,0);sx+=ctx.measureText(t[i]).width+ls;}ctx.restore();
  return cv.toDataURL('image/png');
}
