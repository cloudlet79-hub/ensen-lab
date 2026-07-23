// 메인 — 상태 · 라우터 · 상호작용 · 시트
import { logo, logoSpin, cat, wishIcon } from './assets.js';
import { WISHES, wishLb } from './data.js';
import { DB, ADMIN_CODE, track, fetchRuleset, fetchAdminSummary } from './store.js';
import { today, esc, toast, downloadDataUrl, defaultBirth } from './util.js';
import * as E from './engine.js';
import { cardImage } from './cards.js';
import { topbar, tabbar, viewOnboarding, viewHome, viewMissions, viewCard, viewReport, viewMe } from './screens.js';

var S={tab:"home",prevTab:"home",todayEntry:null,sheet:null};
var _logoTaps=0,_logoTimer=null;
function ready(){var s=DB.settings();return s.onboarded&&s.wishes&&s.wishes.length;}
function el(){return document.getElementById('root');}
function nav(t){if(t!==S.tab)S.prevTab=S.tab;S.tab=t;render();window.scrollTo(0,0);}

function render(){
  if(!ready()){el().innerHTML='<div class="app"><div class="scr">'+viewOnboarding()+'</div></div>';bindOnboarding();return;}
  var body=S.tab==="home"?viewHome(S):S.tab==="missions"?viewMissions(S):S.tab==="card"?viewCard(S):S.tab==="report"?viewReport(S):viewMe(S);
  el().innerHTML='<div class="app"><div class="scr">'+body+'</div></div>'+tabbar(S.tab);
  bind();
  if((S.tab==="home"||S.tab==="missions")&&!S.todayEntry)loadToday();
  if(S.sheet)renderSheet();
}
function loadToday(){E.ensureToday(function(entry){S.todayEntry=entry;render();});}

/* ── 온보딩 바인딩 ── */
function saveStep1(){var b=document.getElementById('p-birth');if(!b)return;var birth=b.value;var nick=document.getElementById('p-nick');DB.patchProfile({nickname:(nick?nick.value.trim():DB.profile().nickname),birth:birth,job:(document.getElementById('p-job').value||'').trim(),place:(document.getElementById('p-place').value||'').trim(),ohaeng:E.ohaengOf(birth)});}
function bindOnboarding(){
  document.querySelectorAll('[data-wish]').forEach(function(b){b.onclick=function(){var s=DB.settings();var w=(s.wishes||[]).slice();var id=b.getAttribute('data-wish');var i=w.indexOf(id);if(i>=0)w.splice(i,1);else w.push(id);DB.patchSettings({wishes:w});render();};});
  document.querySelectorAll('[data-mbti]').forEach(function(b){b.onclick=function(){saveStep1();var idx=parseInt(b.getAttribute('data-mbti'),10);var val=b.getAttribute('data-val');var mb=(DB.profile().mbti||"____").split('');mb[idx]=(mb[idx]===val?"_":val);DB.patchProfile({mbti:mb.join('')});render();};});
  var ag=document.getElementById('p-agree');if(ag)ag.onchange=function(){saveStep1();DB.patchSettings({agree:ag.checked});render();};
  document.querySelectorAll('[data-step]').forEach(function(b){b.onclick=function(){var to=b.getAttribute('data-step');var s=DB.settings();
    if(to==="1"){DB.patchSettings({_step:1});}
    else if(to==="2"){if(!s.agree){toast("기기 저장에 동의해 주세요");return;}saveStep1();showAnalyzing();return;}
    else if(to==="3"){DB.patchSettings({_step:3});}
    else if(to==="done"){if(!(s.wishes&&s.wishes.length)){toast("소망을 하나 이상 골라주세요");return;}E.seedId();DB.patchSettings({onboarded:true,_step:undefined});track('onboard_done',{wishes:(s.wishes||[]).length});S.todayEntry=null;S.tab="home";render();return;}
    render();};});
  document.querySelectorAll('[data-back-to]').forEach(function(b){b.onclick=function(){if(document.getElementById('p-birth'))saveStep1();DB.patchSettings({_step:parseInt(b.getAttribute('data-back-to'),10)});render();};});
  var sk=document.querySelector('[data-skip]');if(sk)sk.onclick=function(){DB.patchSettings({wishes:["happy","luck"],agree:true,onboarded:true,_step:undefined});E.seedId();S.todayEntry=null;S.tab="home";render();};
}

/* ── 앱 바인딩 ── */
function bind(){
  document.querySelectorAll('[data-nav]').forEach(function(b){b.onclick=function(){nav(b.getAttribute('data-nav'));};});
  document.querySelectorAll('[data-complete]').forEach(function(b){b.onclick=function(){openSheet({type:'complete',i:parseInt(b.getAttribute('data-complete'),10),date:today(),felt:null,again:null});};});
  document.querySelectorAll('[data-swap]').forEach(function(b){b.onclick=function(){var e=E.swapMission(parseInt(b.getAttribute('data-swap'),10));if(e===false){toast("오늘은 더 바꿀 미션이 없어요");return;}if(e){track('mission_swap');S.todayEntry=e;render();toast("다른 미션으로 바꿨어요");}};});
  document.querySelectorAll('[data-undo]').forEach(function(b){b.onclick=function(){E.unmarkDone(today(),parseInt(b.getAttribute('data-undo'),10));render();toast("완료를 취소했어요");};});
  document.querySelectorAll('[data-close]').forEach(function(b){b.onclick=function(){var r=DB.reflections();r['__close_'+today()]=b.getAttribute('data-close');DB.setReflections(r);track('day_close',{v:b.getAttribute('data-close')});render();toast("하루를 닫았어요");};});
  var ed=document.querySelector('[data-edit]');if(ed)ed.onclick=function(){openSheet({type:'edit'});};
  var po=document.querySelector('[data-policy]');if(po)po.onclick=function(){openSheet({type:'policy'});};
  var rs=document.querySelector('[data-reset]');if(rs)rs.onclick=function(){openSheet({type:'reset'});};
  var ag=document.querySelector('[data-admin]');if(ag)ag.onclick=openAdminGate;
  var pz=document.querySelector('[data-personalize]');if(pz)pz.onclick=function(){openSheet({type:'edit'});};
  var cs=document.querySelector('[data-card-share]');if(cs)cs.onclick=shareCard;
  var cd=document.querySelector('[data-card-save]');if(cd)cd.onclick=saveCard;
  var bl=document.getElementById('brandLogo');if(bl)bl.onclick=function(){_logoTaps++;clearTimeout(_logoTimer);_logoTimer=setTimeout(function(){_logoTaps=0;},1600);if(_logoTaps>=5){_logoTaps=0;openAdminGate();}};
}
function openAdminGate(){openSheet({type:'adminGate',code:''});}
/* ── 오행 분석 연출: 회전 로고 + 순환 문구 후 결과 공개 ── */
function showAnalyzing(){
  var msgs=["생년월일의 결을 읽고 있어요","오행의 흐름을 살피고 있어요","오늘의 기운을 맞추고 있어요"];
  el().innerHTML='<div class="app"><div class="scr"><div class="analyzing">'+
    '<div class="spin">'+logoSpin(72)+'</div>'+
    '<p class="ana-msg" id="anaMsg">'+msgs[0]+'</p>'+
    '<p class="faint small">잠시만 기다려 주세요</p>'+
    '</div></div></div>';
  var i=0;var iv=setInterval(function(){i=(i+1)%msgs.length;var m=document.getElementById('anaMsg');if(m){m.style.opacity='0';setTimeout(function(){if(m){m.textContent=msgs[i];m.style.opacity='1';}},180);}},900);
  setTimeout(function(){clearInterval(iv);DB.patchSettings({_step:2});render();},2600);
}
async function saveCard(){toast('카드 이미지를 만들고 있어요…');try{var u=await cardImage();downloadDataUrl(u,'ensen-card.png');track('card_save');toast('카드를 이미지로 저장했어요');}catch(e){toast('이미지 저장에 실패했어요');}}
async function shareCard(){try{var u=await cardImage();var blob=await (await fetch(u)).blob();var file=new File([blob],'ensen-card.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text:'나의 행운 문구 · ENSEN LAB'});track('card_share');}else{downloadDataUrl(u,'ensen-card.png');toast('공유가 지원되지 않아 이미지로 저장했어요');}}catch(e){if(e&&e.name==='AbortError')return;toast('공유를 완료하지 못했어요');}}

/* ── 시트 ── */
function openSheet(cfg){S.sheet=cfg;renderSheet();}
function closeSheet(){S.sheet=null;var w=document.getElementById('sheetWrap');if(w)w.remove();}
function finishComplete(){var st=S.sheet;var date=st.date;track('mission_complete');closeSheet();
  var entry=S.todayEntry;var all=entry&&entry.items.every(function(m,i){return E.isDone(date,i);});
  render();
  if(all){var s=DB.settings();if(s.lastAllDone!==date){DB.patchSettings({lastAllDone:date});openSheet({type:'allDone'});}}
  else toast("완료로 기록했어요");
}
function renderSheet(){
  var old=document.getElementById('sheetWrap');if(old)old.remove();if(!S.sheet)return;var mid=false,html='';
  if(S.sheet.type==='complete'){var st=S.sheet;var felt=[["good","좋았어요"],["ok","보통이에요"],["hard","어려웠어요"]];
    html='<div class="sheet-grip"></div><div class="sheet-h"><span class="t">이 행동을 마쳤어요</span></div><p class="faint small">회고는 선택이에요. 건너뛰어도 완료로 기록돼요.</p>'+
      '<div class="qgroup"><p class="q">해보니 어땠나요?</p><div class="opts">'+felt.map(function(o){return '<button class="opt'+(st.felt===o[0]?' on':'')+'" data-felt="'+o[0]+'">'+o[1]+'</button>';}).join('')+'</div></div>'+
      '<button class="cta gold" style="margin-top:16px" data-c-save>완료로 기록하기</button><button class="ghost" style="margin-top:10px" data-c-skip>회고 건너뛰고 완료</button>';
  } else if(S.sheet.type==='allDone'){mid=true;
    html='<div style="display:flex;justify-content:center;margin-bottom:6px">'+cat(96,'cheer')+'</div><h1 class="disp" style="font-size:21px">오늘의 미션을<br>모두 마쳤어요</h1><p class="muted small" style="margin-top:8px">작은 약속을 지킨 하루예요. 리포트에서 나의 흐름을 확인해 보세요.</p><button class="cta gold" style="margin-top:18px" data-alldone-ok>리포트 보기</button>';
  } else if(S.sheet.type==='policy'){
    html='<div class="sheet-grip"></div><div class="sheet-h"><span class="t">개인정보 처리방침</span><button class="link" data-close aria-label="닫기">닫기</button></div><div class="doc">'+
      '<h4>무엇을 저장하나요</h4><p>선택한 소망과 생년월일·직업·장소·성향(입력한 경우), 완료·회고 기록을 저장해요. 이름·연락처는 수집하지 않아요.</p>'+
      '<h4>어디에 저장되나요</h4><p>기록은 이 브라우저(localStorage)에만 저장돼요. 미션 생성을 위해 개인화 정보가 ENSEN의 서버 함수(Supabase)와 AI 제공자에 일시 전송될 수 있으나 별도로 보관하지 않아요.</p>'+
      '<h4>어떻게 쓰이나요</h4><p>선택한 소망·오행·성향을 바탕으로 오늘의 맞춤 행동을 만드는 데에만 써요.</p>'+
      '<h4>어떻게 삭제하나요</h4><p>내 정보의 “데이터 초기화”로 이 기기의 모든 기록을 즉시 지울 수 있어요.</p></div><button class="ghost" style="margin-top:16px" data-close>닫기</button>';
  } else if(S.sheet.type==='reset'){
    var rn=(function(){var r=DB.reflections(),n=0;for(var k in r)if(k.indexOf('__')!==0)n+=Object.keys(r[k]).length;return n;})();
    html='<div class="sheet-grip"></div><div class="sheet-h"><span class="t">데이터를 초기화할까요?</span></div><p class="doc">아래 기록이 <b>모두 삭제</b>되고 복구할 수 없어요.</p>'+
      '<div class="card" style="padding:2px 16px;margin-top:10px"><div class="row"><span class="k">소망·개인화 정보</span><span class="v">전체</span></div><div class="row"><span class="k">완료 기록</span><span class="v">'+E.completedCountAll()+'건</span></div><div class="row"><span class="k">회고 기록</span><span class="v">'+rn+'건</span></div></div>'+
      '<button class="cta" style="margin-top:16px;background:var(--coral)" data-reset-confirm>모두 삭제</button><button class="ghost" style="margin-top:10px" data-close>취소</button>';
  } else if(S.sheet.type==='edit'){var s=DB.settings();var p=DB.profile();var w=s.wishes||[];var mb=p.mbti||"____";var pairs=[["E","I",0],["S","N",1],["T","F",2],["J","P",3]];
    html='<div class="sheet-grip"></div><div class="sheet-h"><span class="t">소망 · 개인화</span><button class="link" data-close aria-label="닫기">닫기</button></div>'+
      '<div class="field" style="margin-top:6px"><span>닉네임</span><input id="e-nick" type="text" placeholder="예: 구름" value="'+esc(p.nickname||'')+'"></div><div class="field"><span>소망 (복수)</span><div class="wgrid">'+WISHES.map(function(x){var on=w.indexOf(x.id)>=0;return '<button class="wq'+(on?' on':'')+'" data-ewish="'+x.id+'"><span class="chk"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span><span class="ic" style="color:'+x.c+'">'+wishIcon(x.id,x.c)+'</span><span class="lb">'+x.lb+'</span></button>';}).join('')+'</div></div>'+
      '<div class="field"><span>생년월일</span><input id="e-birth" type="date" max="'+today()+'" value="'+(p.birth||defaultBirth())+'"></div>'+
      '<div class="field"><span>직업</span><input id="e-job" type="text" value="'+esc(p.job||'')+'"></div>'+
      '<div class="field"><span>장소</span><input id="e-place" type="text" value="'+esc(p.place||'')+'"></div>'+
      '<div class="field"><span>성향(MBTI)</span><div class="mbti">'+pairs.map(function(pr){var cur=mb[pr[2]];return '<button data-embti="'+pr[2]+'" data-val="'+pr[0]+'" class="'+(cur===pr[0]?'on':'')+'">'+pr[0]+'</button><button data-embti="'+pr[2]+'" data-val="'+pr[1]+'" class="'+(cur===pr[1]?'on':'')+'">'+pr[1]+'</button>';}).join('')+'</div></div>'+
      '<p class="why-note">소망을 바꾸면 오늘의 미션이 새로 만들어져요.</p><button class="cta gold" style="margin-top:12px" data-edit-save>저장</button>';
  } else if(S.sheet.type==='adminGate'){
    html='<div class="sheet-grip"></div><div class="sheet-h"><span class="t">관리자 접근</span><button class="link" data-close aria-label="닫기">닫기</button></div>'+
      '<p class="faint small">관리자 접근 코드를 입력하세요.</p>'+
      '<div class="field" style="margin-top:10px"><input id="adm-code" type="password" placeholder="접근 코드" autocomplete="off"></div>'+
      '<button class="cta gold" style="margin-top:12px" data-adm-enter>확인</button>';
  } else if(S.sheet.type==='admin'){
    var comp=E.completedCountAll();var stk=E.streak();var lv=E.level();var sym=E.symbolsUnlocked();
    var r=DB.reflections();var refl=0;for(var k in r)if(k.indexOf('__')!==0)refl+=Object.keys(r[k]).length;
    var closes=Object.keys(DB.completions()).length;
    var cells=[["완료 행동",comp],["연속(일)",stk],["기록한 날",closes],["회고",refl],["레벨",lv],["상징",sym]];
    html='<div class="sheet-grip"></div><div class="sheet-h"><span class="t">관리자 · 로컬 진단</span><button class="link" data-close aria-label="닫기">닫기</button></div>'+
      '<div class="adm-metrics">'+cells.map(function(x){return '<div class="cell"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>';}).join('')+'</div>'+
      '<div class="card" style="padding:2px 16px;margin-top:12px">'+
        '<div class="row"><span class="k">닉네임</span><span class="v">'+esc(DB.profile().nickname||"—")+'</span></div>'+
        '<div class="row"><span class="k">오행</span><span class="v">'+esc(E.ohaengLabel(DB.profile().ohaeng)||"—")+'</span></div>'+
        '<div class="row"><span class="k">소망</span><span class="v">'+((DB.settings().wishes||[]).map(function(id){return wishLb(id);}).join('·')||"—")+'</span></div>'+
      '</div>'+
      '<div class="sect" style="margin-top:14px"><span class="t" style="font-family:var(--disp);font-size:14px">서버 지표 (전체 사용자)</span></div>'+
      '<div id="admServer" class="why-note">서버 지표를 불러오는 중…</div>'+
      '<button class="cta gold" style="margin-top:14px" data-adm-export>데이터 내보내기 (JSON)</button><button class="ghost" style="margin-top:10px" data-close>닫기</button>'+
      '<p class="why-note" style="margin-top:12px">이 기기의 로컬 데이터 요약입니다. 접근 코드는 src/store.js의 ADMIN_CODE에서 바꿀 수 있고, 실제 관리자 권한·전체 회원 지표는 서버 콘솔에서 관리합니다(프런트에 권한 로직 없음).</p>';
  }
  var wrap=document.createElement('div');
  wrap.innerHTML='<div class="sheet-wrap'+(mid?' mid':'')+'" id="sheetWrap"><div class="sheet'+(mid?' pop':'')+'" role="dialog" aria-modal="true">'+html+'</div></div>';
  document.body.appendChild(wrap.firstChild);
  document.getElementById('sheetWrap').onclick=function(e){if(e.target.id==='sheetWrap'&&S.sheet.type!=='allDone')closeSheet();};
  bindSheet();
}
function bindSheet(){
  document.querySelectorAll('[data-close]').forEach(function(b){b.onclick=closeSheet;});
  document.querySelectorAll('[data-felt]').forEach(function(b){b.onclick=function(){S.sheet.felt=b.getAttribute('data-felt');renderSheet();};});
  document.querySelectorAll('[data-again]').forEach(function(b){b.onclick=function(){S.sheet.again=b.getAttribute('data-again');renderSheet();};});
  var save=document.querySelector('[data-c-save]');if(save)save.onclick=function(){var st=S.sheet;E.markDone(st.date,st.i);if(st.felt)E.saveReflection(st.date,st.i,st.felt);finishComplete();};
  var ako=document.querySelector('[data-alldone-ok]');if(ako)ako.onclick=function(){closeSheet();nav('report');};
  var skip=document.querySelector('[data-c-skip]');if(skip)skip.onclick=function(){var st=S.sheet;E.markDone(st.date,st.i);finishComplete();};
  var rc=document.querySelector('[data-reset-confirm]');if(rc)rc.onclick=function(){DB.clearAll();closeSheet();S.todayEntry=null;S.tab="home";render();toast("모든 기록을 지웠어요");};
  document.querySelectorAll('[data-ewish]').forEach(function(b){b.onclick=function(){var s=DB.settings();var w=(s.wishes||[]).slice();var id=b.getAttribute('data-ewish');var i=w.indexOf(id);if(i>=0){if(w.length<=1){toast("소망은 하나 이상이어야 해요");return;}w.splice(i,1);}else w.push(id);DB.patchSettings({wishes:w});renderSheet();};});
  document.querySelectorAll('[data-embti]').forEach(function(b){b.onclick=function(){var idx=parseInt(b.getAttribute('data-embti'),10);var val=b.getAttribute('data-val');var mb=(DB.profile().mbti||"____").split('');mb[idx]=(mb[idx]===val?"_":val);DB.patchProfile({mbti:mb.join('')});renderSheet();};});
  var es=document.querySelector('[data-edit-save]');if(es)es.onclick=function(){var birth=document.getElementById('e-birth').value;DB.patchProfile({nickname:document.getElementById('e-nick').value.trim(),birth:birth,job:document.getElementById('e-job').value.trim(),place:document.getElementById('e-place').value.trim(),ohaeng:E.ohaengOf(birth)});var mm=DB.missions();delete mm[today()];DB.setMissions(mm);S.todayEntry=null;closeSheet();S.tab="home";render();toast("저장했어요. 오늘의 미션을 새로 준비할게요");};
  var ae=document.querySelector('[data-adm-enter]');if(ae)ae.onclick=function(){var v=(document.getElementById('adm-code').value||'').trim();if(v===ADMIN_CODE){S.sheet=null;openSheet({type:'admin',code:v});}else toast('접근 코드가 올바르지 않아요');};
  var srv=document.getElementById('admServer');
  if(srv&&S.sheet&&S.sheet.type==='admin'){
    fetchAdminSummary(S.sheet.code||ADMIN_CODE).then(function(d){
      var box=document.getElementById('admServer');if(!box)return;
      if(!d||d.ok!==true){box.textContent='서버 지표를 불러오지 못했어요 (오프라인 또는 코드 불일치).';return;}
      var cells=[["전체 사용자",d.users_total],["7일 활성",d.active_7d],["7일 완료",d.completes_7d],["7일 하루닫기",d.closes_7d],["7일 카드",d.cards_7d],["AI 호출 7일",d.ai_calls_7d],["AI 실패 7일",d.ai_fail_7d],["AI 토큰 7일",d.ai_tokens_7d]];
      box.outerHTML='<div class="adm-metrics" id="admServer">'+cells.map(function(x){return '<div class="cell"><b>'+(x[1]==null?0:x[1])+'</b><small>'+x[0]+'</small></div>';}).join('')+'</div><p class="why-note">룰셋 v'+(d.ruleset_v==null?'—':d.ruleset_v)+' 적용 중 · 코드 검증은 서버(admin_summary)가 수행</p>';
    });
  }
  var ax=document.querySelector('[data-adm-export]');if(ax)ax.onclick=function(){try{var data={profile:DB.profile(),settings:DB.settings(),missions:DB.missions(),completions:DB.completions(),reflections:DB.reflections(),exportedAt:today()};var url='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(data,null,2));downloadDataUrl(url,'ensen-data-'+today()+'.json');toast('데이터를 내보냈어요');}catch(e){toast('내보내기에 실패했어요');}};
}

fetchRuleset(function(){if(ready())render();});
try{var st0=DB.settings();if(st0.onboarded&&st0.lastOpenTracked!==today()){DB.patchSettings({lastOpenTracked:today()});track('app_open');}}catch(e){}
try{render();}catch(e){el().innerHTML='<div class="app"><div class="scr"><div class="empty">잠시 문제가 생겼어요. 새로고침해 주세요.</div></div></div>';}
