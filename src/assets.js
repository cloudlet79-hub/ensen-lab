// ENSEN 브랜드 자산 — 로고(스파클별) · 고양이 마스코트 ENI · 오행 글리프 · 소망 아이콘
export function ensStar(cx,cy,r,f){var k=r*0.16;return '<path d="M'+cx+' '+(cy-r)+' Q'+(cx+k)+' '+(cy-k)+' '+(cx+r)+' '+cy+' Q'+(cx+k)+' '+(cy+k)+' '+cx+' '+(cy+r)+' Q'+(cx-k)+' '+(cy+k)+' '+(cx-r)+' '+cy+' Q'+(cx-k)+' '+(cy-k)+' '+cx+' '+(cy-r)+' Z" fill="'+f+'"/>';}
export function logo(s){s=s||24;var g="#C7A14A";return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="45" cy="54" r="32" stroke="'+g+'" stroke-width="4.5"/><line x1="50" y1="22" x2="79" y2="51" stroke="'+g+'" stroke-width="4.5" stroke-linecap="round"/>'+ensStar(45,56,8.5,g)+ensStar(86,23,5.5,g)+'</svg>';}
export function cat(size,expr,coat){
  size=size||96;coat=coat||"#F3E7D0";var line="#6b5a3a",blush="#FFB1A0";
  var eyes=expr==='happy'?'<path d="M40 63 q6 -7 12 0" stroke="'+line+'" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M68 63 q6 -7 12 0" stroke="'+line+'" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
    :expr==='cheer'?'<circle cx="46" cy="62" r="4.2" fill="'+line+'"/><circle cx="74" cy="62" r="4.2" fill="'+line+'"/><circle cx="47.5" cy="60.5" r="1.4" fill="#fff"/><circle cx="75.5" cy="60.5" r="1.4" fill="#fff"/>'
    :'<circle cx="46" cy="62" r="4.6" fill="'+line+'"/><circle cx="74" cy="62" r="4.6" fill="'+line+'"/><circle cx="47.8" cy="60.2" r="1.5" fill="#fff"/><circle cx="75.8" cy="60.2" r="1.5" fill="#fff"/>';
  var mouth=expr==='cheer'?'<path d="M52 72 q8 9 16 0" stroke="'+line+'" stroke-width="3" fill="#F79" stroke-linecap="round"/>'
    :'<path d="M56 71 q4 4 8 0" stroke="'+line+'" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M60 68 v4" stroke="'+line+'" stroke-width="2.4" stroke-linecap="round"/>';
  var paws=expr==='cheer'?'<ellipse cx="30" cy="86" rx="8" ry="9" fill="'+coat+'" stroke="'+line+'" stroke-width="2.4"/><ellipse cx="90" cy="86" rx="8" ry="9" fill="'+coat+'" stroke="'+line+'" stroke-width="2.4"/>'
    :'<ellipse cx="47" cy="116" rx="9" ry="7" fill="'+coat+'" stroke="'+line+'" stroke-width="2.4"/><ellipse cx="73" cy="116" rx="9" ry="7" fill="'+coat+'" stroke="'+line+'" stroke-width="2.4"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+(size*1.16)+'" viewBox="0 0 120 132" fill="none" aria-hidden="true">'+
    '<path d="M92 112 q22 -4 16 -26 q-4 -14 -16 -12" fill="none" stroke="'+line+'" stroke-width="6" stroke-linecap="round"/>'+
    '<path d="M60 74 C36 74 30 96 32 112 C33 122 44 124 60 124 C76 124 87 122 88 112 C90 96 84 74 60 74 Z" fill="'+coat+'" stroke="'+line+'" stroke-width="2.6"/>'+paws+
    '<path d="M34 40 L28 14 L52 30 Z" fill="'+coat+'" stroke="'+line+'" stroke-width="2.6" stroke-linejoin="round"/>'+
    '<path d="M86 40 L92 14 L68 30 Z" fill="'+coat+'" stroke="'+line+'" stroke-width="2.6" stroke-linejoin="round"/>'+
    '<path d="M35 34 L32 22 L44 30 Z" fill="'+blush+'"/><path d="M85 34 L88 22 L76 30 Z" fill="'+blush+'"/>'+
    '<circle cx="60" cy="58" r="32" fill="'+coat+'" stroke="'+line+'" stroke-width="2.6"/>'+
    '<circle cx="40" cy="70" r="6" fill="'+blush+'" opacity=".7"/><circle cx="80" cy="70" r="6" fill="'+blush+'" opacity=".7"/>'+eyes+mouth+
    '<path d="M24 64 H12 M25 71 H14" stroke="'+line+'" stroke-width="2" stroke-linecap="round" opacity=".7"/>'+
    '<path d="M96 64 H108 M95 71 H106" stroke="'+line+'" stroke-width="2" stroke-linecap="round" opacity=".7"/>'+ensStar(60,12,9,'#C7A14A')+'</svg>';
}
function _rot(d,n){var s='';for(var i=0;i<n;i++)s+='<path d="'+d+'" transform="rotate('+(360/n*i)+' 50 50)"/>';return s;}
export var G={
  clover:function(){return _rot("M50 50 C50 33 35 28 31 39 C27 48 38 55 50 50 Z",4)+'<path d="M50 54 C53 68 52 78 45 86"/>';},
  byeol:function(){return '<path d="M50 12 L61 38 L89 41 L68 60 L74 88 L50 74 L26 88 L32 60 L11 41 L39 38 Z"/>';},
  nabi:function(){return '<path d="M50 32 V70"/><path d="M50 34 L41 22"/><path d="M50 34 L59 22"/><path d="M50 42 C34 22 13 30 19 49 C23 61 40 59 50 48 Z"/><path d="M50 42 C66 22 87 30 81 49 C77 61 60 59 50 48 Z"/><path d="M50 54 C40 58 25 63 31 75 C37 86 48 75 50 63 Z"/><path d="M50 54 C60 58 75 63 69 75 C63 86 52 75 50 63 Z"/>';},
  saessak:function(){return '<path d="M50 86 V44"/><path d="M50 58 C35 58 24 47 24 33 C40 33 50 44 50 58 Z"/><path d="M50 48 C63 48 74 37 74 23 C58 23 50 34 50 48 Z"/><path d="M37 86 H63"/>';},
  nachimban:function(){return '<circle cx="50" cy="50" r="33"/><path d="M50 18 L57 43 L82 50 L57 57 L50 82 L43 57 L18 50 L43 43 Z"/><path d="M50 43 L57 50 L50 57 L43 50 Z"/>';},
  dal:function(){return '<path d="M64 16 A35 35 0 1 0 64 84 A28 28 0 1 1 64 16 Z"/><path d="M78 26 l2.5 5.5 6 .8 -4.3 4.3 1 6 -5.2-2.8 -5.2 2.8 1-6 -4.3-4.3 6-.8 Z"/>';},
  taeyang:function(){var s='<circle cx="50" cy="50" r="19"/>';for(var i=0;i<12;i++){var a=i/12*6.2832;s+='<line x1="'+(50+Math.cos(a)*26).toFixed(1)+'" y1="'+(50+Math.sin(a)*26).toFixed(1)+'" x2="'+(50+Math.cos(a)*38).toFixed(1)+'" y2="'+(50+Math.sin(a)*38).toFixed(1)+'"/>';}return s;},
  maehwa:function(){var s='';for(var i=0;i<5;i++){var a=(i/5)*6.2832-1.5708;s+='<circle cx="'+(50+Math.cos(a)*17).toFixed(1)+'" cy="'+(50+Math.sin(a)*17).toFixed(1)+'" r="13"/>';}return s+'<circle cx="50" cy="50" r="5" fill="currentColor" stroke="none"/>';},
  yeopjeon:function(){return '<circle cx="50" cy="50" r="32"/><rect x="39" y="39" width="22" height="22" rx="2"/><circle cx="50" cy="50" r="24" stroke-dasharray="3 6"/>';},
  muhandae:function(){return '<path d="M50 50 C40 30 18 32 18 50 C18 68 40 70 50 50 C60 30 82 32 82 50 C82 68 60 70 50 50 Z"/>';},
  mandala:function(){return '<circle cx="50" cy="50" r="34"/><circle cx="50" cy="50" r="20"/><circle cx="50" cy="50" r="7"/>'+_rot("M50 30 C56 37 56 43 50 50 C44 43 44 37 50 30 Z",8);},
  wanggwan:function(){return '<path d="M20 70 L27 32 L39 48 L50 26 L61 48 L73 32 L80 70 Z"/><path d="M20 70 H80"/><circle cx="50" cy="40" r="3.6" fill="currentColor" stroke="none"/>';}
};
export function glyph(id,color,sw){var f=G[id]||G.clover;return '<svg viewBox="0 0 100 100" fill="none" stroke="'+(color||"currentColor")+'" stroke-width="'+(sw||4)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+f()+'</svg>';}
export function colorForGlyph(g){var m={clover:"#2FB39B",byeol:"#FFA23E",nabi:"#8B7BE8",saessak:"#3FA9E8",nachimban:"#C7A14A",dal:"#F26D9E",taeyang:"#FF7A59",maehwa:"#F472B6",yeopjeon:"#C7A14A",muhandae:"#8B7BE8",mandala:"#2FB39B",wanggwan:"#E9B949"};return m[g]||"#C7A14A";}
// 소망 라인 아이콘
var WI={
  money:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M14.5 9.3c-.4-.9-1.4-1.3-2.6-1.3-1.4 0-2.4.7-2.4 1.8 0 2.4 5 1.2 5 3.6 0 1.2-1.1 1.9-2.6 1.9-1.3 0-2.3-.5-2.7-1.4"/>',
  job:'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5.5A2.5 2.5 0 0110.5 3h3A2.5 2.5 0 0116 5.5V7"/><path d="M3 12h18"/>',
  love:'<path d="M12 20s-7-4.6-7-9.2A3.8 3.8 0 0112 8a3.8 3.8 0 017 2.8C19 15.4 12 20 12 20z"/>',
  relation:'<circle cx="8.5" cy="8" r="3"/><path d="M3 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 5.5a3 3 0 010 5.6"/><path d="M21 20c0-2.4-1.4-4-3.5-4.6"/>',
  health:'<path d="M12 20s-7-4.6-7-9.2A3.8 3.8 0 0112 8a3.8 3.8 0 017 2.8C19 15.4 12 20 12 20z"/><path d="M7 12h2l1.3-2 2 4 1.2-2H17" stroke-width="1.4"/>',
  study:'<path d="M5 4h13a1 1 0 011 1v14a1 1 0 01-1 1H7a2 2 0 01-2-2z"/><path d="M9 4v16"/>',
  safety:'<path d="M12 3l7 3v5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6z"/><path d="M9.5 12l1.8 1.8L15 10"/>',
  luck:'<path d="M12 12c0-2.6-2-4-3.4-2.6C7.2 10.6 9 12.4 12 12z"/><path d="M12 12c0-2.6 2-4 3.4-2.6C16.8 10.6 15 12.4 12 12z"/><path d="M12 12c-2.6 0-4 2-2.6 3.4C10.6 16.8 12.4 15 12 12z"/><path d="M12 12c2.6 0 4 2 2.6 3.4C13.4 16.8 11.6 15 12 12z"/><path d="M13 13.5c1 1.5 1 3.5-.5 5.5"/>',
  achieve:'<path d="M7 4h10v3a5 5 0 01-10 0z"/><path d="M7 5H4.5A2.5 2.5 0 007 9.5M17 5h2.5A2.5 2.5 0 0117 9.5"/><path d="M10 12.5h4M9.5 20h5M12 12.5V20"/>',
  happy:'<circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01"/><path d="M8.5 14.2a4 4 0 007 0"/>',
  talent:'<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 00-3.8 10.6c.8.7 1.3 1.5 1.3 2.4h5c0-.9.5-1.7 1.3-2.4A6 6 0 0012 3z"/>',
  change:'<path d="M4 8h9l-2-2M4 8l2 2"/><path d="M20 16h-9l2 2M20 16l-2-2"/><path d="M4 8c8 0 8 8 16 8" stroke-dasharray="0.1 4"/>'
};
export function wishIcon(id,color){return '<svg viewBox="0 0 24 24" fill="none" stroke="'+(color||'currentColor')+'" aria-hidden="true">'+(WI[id]||WI.happy)+'</svg>';}
