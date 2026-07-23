// 화면 렌더 — 온보딩(소개→입력→분석→소망) + 탭(홈·미션·컬렉션·리포트·나)
import { logo, cat, glyph, wishIcon, colorForGlyph, catIcon, catMood } from './assets.js';
import { WISHES, wishLb, REWARD, BURDENS } from './data.js';
import { DB } from './store.js';
import { esc, today, hex2bg, defaultBirth } from './util.js';
import * as E from './engine.js';

export function topbar(right,back){
  var left=back?'<button class="back" data-nav="'+back+'" aria-label="이전 화면으로"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>뒤로</button>'
    :'<div class="brand" id="brandLogo">'+logo(24)+'<span class="wm">ENSEN</span></div>';
  return '<div class="top">'+left+(right||'')+'</div>';
}
export function tabbar(tab){
  var T=[["home","홈",'<path d="M4 12l8-8 8 8"/><path d="M6 10v10h12V10"/>'],
    ["missions","미션",'<path d="M5 6h14M5 12h14M5 18h9"/><circle cx="19" cy="18" r="1.6"/>'],
    ["card","카드",'<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M8 10h8M8 14h5"/>'],
    ["report","리포트",'<path d="M6 20V10M12 20V5M18 20v-7"/>'],
    ["me","나",'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>']];
  return '<nav class="tabs" aria-label="주요 메뉴">'+T.map(function(t){return '<button class="tab'+(tab===t[0]?' on':'')+'" data-nav="'+t[0]+'" aria-label="'+t[1]+'"'+(tab===t[0]?' aria-current="page"':'')+'><svg viewBox="0 0 24 24">'+t[2]+'</svg>'+t[1]+'</button>';}).join('')+'</nav>';
}

/* ── 온보딩 ── */
export function viewOnboarding(){
  var s=DB.settings();var p=DB.profile();var step=s._step||0;
  if(step===0){
    return topbar('<button class="link" data-skip>둘러보기</button>')+
      '<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;margin-top:4px">'+cat(92,'happy')+
        '<p class="eyebrow">YOUR STORY. YOUR LUCK.</p><h1 class="disp">ENSEN LAB</h1>'+
        '<p class="muted small" style="max-width:28ch">나의 정보를 읽어 오행을 분석하고, 소망에 맞춘 오늘의 작은 행동을 건네는 개인화 행운·행동 앱이에요.</p></div>'+
      '<div class="steps">'+
        '<div class="step"><span class="n" style="background:var(--coral)">1</span><span class="tt">정보 입력<small>생년월일·성향 등 (선택)</small></span></div>'+
        '<div class="step"><span class="n" style="background:var(--gold)">2</span><span class="tt">오행 분석 결과<small>나의 기운을 읽어요</small></span></div>'+
        '<div class="step"><span class="n" style="background:var(--sky)">3</span><span class="tt">소망 연계<small>이루고 싶은 것을 골라요</small></span></div>'+
        '<div class="step"><span class="n" style="background:var(--teal)">4</span><span class="tt">개인화 미션 → 회고 → 리포트<small>나에게 맞는 행동을 매일</small></span></div>'+
      '</div>'+'<button class="cta" data-step="1">시작하기</button>';
  }
  if(step===1){
    var mb=p.mbti||"____";var pairs=[["E","I",0],["S","N",1],["T","F",2],["J","P",3]];
    return topbar('<span class="faint small">1 / 3</span>',null)+
      '<div><h1 class="disp">나를 알려주세요</h1><p class="faint small">모두 선택이에요. 알려줄수록 분석과 미션이 정확해져요.</p></div>'+
      '<div class="field"><span>닉네임 <span class="faint">(불릴 이름)</span></span><input id="p-nick" type="text" placeholder="예: 구름" value="'+esc(p.nickname||'')+'"></div>'+
      '<div class="field"><span>생년월일 <span class="faint">(오행 자동 분석)</span></span><input id="p-birth" type="date" max="'+today()+'" value="'+(p.birth||defaultBirth())+'"></div>'+
      '<div class="field"><span>직업 / 하는 일</span><input id="p-job" type="text" placeholder="예: 디자이너, 학생" value="'+esc(p.job||'')+'"></div>'+
      '<div class="field"><span>사는 곳 / 지역</span><input id="p-place" type="text" placeholder="예: 서울, 바닷가 도시" value="'+esc(p.place||'')+'"></div>'+
      '<div class="field"><span>성향 (MBTI)</span><div class="mbti">'+pairs.map(function(pr){var cur=mb[pr[2]];return '<button data-mbti="'+pr[2]+'" data-val="'+pr[0]+'" class="'+(cur===pr[0]?'on':'')+'">'+pr[0]+'</button><button data-mbti="'+pr[2]+'" data-val="'+pr[1]+'" class="'+(cur===pr[1]?'on':'')+'">'+pr[1]+'</button>';}).join('')+'</div></div>'+
      '<label class="agree"><input type="checkbox" id="p-agree" '+(s.agree?'checked':'')+'><span class="txt">생년월일과 기록을 이 기기에 저장하는 데 동의합니다.</span></label>'+
      '<button class="cta" data-step="2" '+(s.agree?'':'disabled')+'>분석하기</button>'+
      '<button class="link center" data-back-to="0" style="align-self:center">뒤로</button>';
  }
  if(step===2){
    var a=E.analysis();
    var oh=a.oh?'<div class="oh"><div class="han">'+a.han+'</div><div class="lb">오행 '+a.oh+'('+a.han+')</div><div class="kw">'+a.kw+'</div><div class="ph">'+esc(a.advice)+'</div></div>'
      :'<div class="oh"><div class="han">✦</div><div class="lb">오행 분석</div><div class="kw">생년월일을 넣으면 더 정확해요</div><div class="ph">지금은 소망 기반으로 맞춰드릴게요.</div></div>';
    var traits=a.traits.length?'<div class="traits">'+a.traits.map(function(t){return '<div class="tr"><span class="k">'+esc(t.k)+'</span><span class="v">'+esc(t.v)+'</span></div>';}).join('')+'</div>':'';
    return topbar('<span class="faint small">2 / 3</span>',null)+
      '<div><h1 class="disp">나의 분석 결과</h1><p class="faint small">입력한 정보로 읽은 오늘의 나예요.</p></div>'+
      '<div class="ana">'+oh+traits+'</div>'+
      '<button class="cta gold" data-step="3">소망 고르러 가기</button>'+
      '<button class="link center" data-back-to="1" style="align-self:center">뒤로</button>';
  }
  var w=s.wishes||[];
  return topbar('<span class="faint small">3 / 3</span>',null)+
    '<div><h1 class="disp">소망 선택</h1><p class="faint small">이루고 싶은 것을 골라주세요 · 복수 선택 가능</p></div>'+
    '<div class="wgrid">'+WISHES.map(function(x){var on=w.indexOf(x.id)>=0;return '<button class="wq'+(on?' on':'')+'" data-wish="'+x.id+'" aria-pressed="'+on+'"><span class="chk"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span><span class="ic" style="color:'+x.c+'">'+wishIcon(x.id,x.c)+'</span><span class="lb">'+x.lb+'</span><span class="ds">'+x.ds+'</span></button>';}).join('')+'</div>'+
    '<button class="cta gold" data-step="done" '+(w.length?'':'disabled')+'>개인화 미션 받기 ('+w.length+')</button>'+
    '<button class="link center" data-back-to="2" style="align-self:center">뒤로</button>';
}

/* ── 공용 ── */
function fortuneCard(){
  var f=E.fortune();var s=DB.settings();var wishesTxt=(s.wishes||[]).map(wishLb).join('·');
  return '<section class="fortune" aria-label="오늘의 행운 문구">'+
    (f.oh?'<span class="f-han l" aria-hidden="true">'+f.han+'</span><span class="f-han r" aria-hidden="true">'+f.han+'</span>':'')+
    '<p class="f-eye">❖ 나의 행운 문구 ❖</p><p class="f-phrase">'+esc(f.phrase)+'</p>'+
    (f.oh?'<p class="f-sub">— 오행 '+f.oh+'('+f.han+') · '+f.kw+' —</p>':'<p class="f-sub">— '+esc(wishesTxt||'오늘의 결')+' —</p>')+
    '<p class="f-brand">ENSEN LAB</p></section>';
}
function missionItem(m,i,date,compact){
  var d=E.isDone(date,i);
  if(d)return '<div class="m done"><span class="ic" style="background:'+hex2bg(m.color)+';color:'+m.color+'">'+catIcon(m.color,'joy')+'</span><div class="tx"><p class="ln">'+esc(m.sentence)+'</p><div class="act"><span class="done-tag"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>완료</span>'+(compact?'':'<button class="undo" data-undo="'+i+'">완료 취소</button>')+'</div></div></div>';
  return '<div class="m"><span class="ic" style="background:'+hex2bg(m.color)+';color:'+m.color+'">'+catIcon(m.color,catMood(m.sentence))+'</span><div class="tx"><p class="ln">'+esc(m.sentence)+'</p>'+(m.reason?'<p class="why">'+esc(m.reason)+'</p>':'')+'<p class="mt">'+m.minutes+'분'+(m.tag?' · '+esc(m.tag):'')+'</p><div class="act"><button class="btn-done" data-complete="'+i+'"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>완료하기</button>'+(compact?'':'<button class="btn-swap" data-swap="'+i+'" aria-label="다른 미션으로 바꾸기"><svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg></button>')+'</div></div></div>';
}

/* ── 홈 ── */
export function viewHome(S){
  var date=today();var entry=S.todayEntry;var p=DB.profile();
  var doneN=entry?entry.items.filter(function(m,i){return E.isDone(date,i);}).length:0;
  var total=entry?entry.items.length:3;var allDone=entry&&doneN===total&&total>0;
  var expr=allDone?'cheer':(doneN>0?'happy':'base');
  var caption=entry&&entry.state?entry.state:(doneN>0?'좋아요, 잘하고 있어요!':'오늘도 한 걸음 함께해요');
  // 개인화 미입력 배너 (생년월일 없으면)
  var banner=(!p.birth)?'<button class="calm" style="width:100%;background:#fef6e6;border-color:#f0dcb4;text-align:left;display:flex;align-items:center;gap:10px" data-personalize><span style="flex:1"><span class="t" style="font-size:14px;font-family:var(--disp)">생년월일·성향을 입력해 보세요</span><span class="s" style="display:block">오행 분석과 더 정확한 맞춤 미션을 받을 수 있어요.</span></span><span class="faint" style="font-size:20px">›</span></button>':'';
  // 오늘 미션 요약 카드
  var summary;
  if(!entry)summary='<div class="skel" style="height:96px"></div>';
  else {
    var nextIdx=-1;for(var k=0;k<entry.items.length;k++){if(!E.isDone(date,k)){nextIdx=k;break;}}
    var lead=entry.items[nextIdx>=0?nextIdx:0];
    var nextTxt=allDone?'모두 마쳤어요! 잘했어요':lead.sentence;
    summary='<button class="card" style="width:100%;text-align:left;padding:16px 18px;display:flex;align-items:center;gap:14px" data-nav="missions">'+
      '<span class="ic" style="width:44px;height:44px;flex:none;border-radius:12px;display:grid;place-items:center;background:'+hex2bg(lead.color)+';color:'+lead.color+'">'+catIcon(lead.color,catMood(lead.sentence))+'</span>'+
      '<span style="flex:1"><span class="t" style="font-family:var(--disp);font-size:15px;display:block">오늘의 미션 '+doneN+' / '+total+'</span><span class="faint small">'+esc(nextTxt)+'</span></span>'+
      '<span class="faint" style="font-size:20px">›</span></button>'+
      (entry.source==='ai'?'<p class="srcnote">✦ AI가 나에게 맞춰 제안했어요</p>':'<p class="srcnote">지금은 기기 내 개인화 추천으로 보여드려요</p>');
  }
  var cta=entry?'<button class="cta" data-nav="missions">'+(allDone?'오늘의 미션 다시 보기':'오늘의 미션 하러 가기')+'</button>':'';
  return topbar('<span class="pill">✦ 연속 '+E.streak()+'일</span>')+fortuneCard()+
    '<div class="todaycat">'+cat(64,expr)+'<p>'+esc(caption)+'</p></div>'+banner+
    '<div class="sect"><span class="t">오늘</span></div>'+summary+cta+
    (allDone?'<section class="calm"><p class="t">오늘의 작은 약속을 지켰어요</p><p class="s">리포트에서 나만의 패턴을 볼 수 있어요.</p></section>':viewCloseInline(date));
}
function viewCloseInline(date){
  var luck=E.getLuck(date);var v=luck?luck.v:null;
  var care=E.getCare(date);var cb=care?care.burden:null;
  var noteLine=luck&&luck.note?'<p class="serif small" style="margin-top:10px;color:#5a4a2a">“'+esc(luck.note)+'”</p>':(v==='good'?'<button class="link small" style="margin-top:10px" data-luck-note>어떤 좋은 일이었는지 한 줄 남기기</button>':'');
  var careBlock='';
  if(v){
    if(cb){var cm=E.careMeta(cb);careBlock='<p class="serif small" style="margin-top:12px;color:#5a5a4a">'+esc(cm?cm.msg:'')+'</p>';}
    else careBlock='<div style="margin-top:14px;padding-top:12px;border-top:1px dashed #e7ddc6"><p style="font-size:13px;font-weight:700">혹시 오늘, 마음을 무겁게 한 것이 있었나요?</p><p class="faint small" style="margin-top:2px">알려주시면 내일의 행동에 살며시 반영할게요.</p><div class="opts" style="margin-top:10px">'+BURDENS.map(function(x){return '<button class="opt" style="min-width:70px;padding:9px 6px;font-size:12px" data-burden="'+x.id+'">'+x.lb+'</button>';}).join('')+'</div></div>';
  }
  return '<section class="calm" style="background:#fbf7ee;border-color:#efe1c6;text-align:left"><p class="t" style="font-family:var(--serif);text-align:center">오늘, 좋은 일이 있었나요?</p>'+
    '<div class="opts" style="margin-top:12px"><button class="opt'+(v==='good'?' on':'')+'" data-close="good">있었어요</button><button class="opt'+(v==='ok'?' on':'')+'" data-close="ok">보통</button><button class="opt'+(v==='no'?' on':'')+'" data-close="no">아쉬웠어요</button></div>'+
    noteLine+careBlock+
    '<p class="faint small" style="margin-top:10px;text-align:center">이 기록이 쌓이면, 어떤 행동이 좋은 일로 이어지는지 보여드려요.</p></section>';
}

/* ── 미션 ── */
export function viewMissions(S){
  var date=today();var entry=S.todayEntry;
  var head=topbar('<span class="pill">✦ 연속 '+E.streak()+'일</span>',S.prevTab||'home')+'<h1 class="disp">오늘의 미션</h1>';
  if(!entry)return head+'<div class="miss">'+[0,1,2].map(function(){return '<div class="skel"></div>';}).join('')+'</div><p class="srcnote">맞춤 미션을 준비하고 있어요…</p>';
  var doneN=entry.items.filter(function(m,i){return E.isDone(date,i);}).length;
  var list='<div class="miss">'+entry.items.map(function(m,i){return missionItem(m,i,date,false);}).join('')+'</div>';
  var note=entry.source==='ai'?'<p class="srcnote">✦ AI 맞춤 제안 · 마음에 안 들면 ⇄ 로 바꿔요</p>':'<p class="srcnote">개인화 추천 · ⇄ 로 다른 행동으로 바꿀 수 있어요</p>';
  var foot=(doneN===entry.items.length)?'<section class="calm"><p class="t">오늘의 작은 약속을 지켰어요</p><p class="s">회고는 미션 완료 때 남길 수 있어요.</p></section>':'<p class="faint small center">완료를 누르면 짧은 회고를 남길 수 있어요. 건너뛰어도 돼요.</p>';
  return head+'<div class="sect"><span class="t">전체 '+entry.items.length+'개</span><span class="p">'+doneN+' 완료</span></div>'+list+note+foot;
}

/* ── 카드 (나만의 행운 카드 · 저장/공유) ── */
export function viewCard(S){
  var f=E.fortune();var p=DB.profile();
  var card='<section class="fortune" style="padding:26px 42px">'+
    (f.oh?'<span class="f-han l" aria-hidden="true">'+f.han+'</span><span class="f-han r" aria-hidden="true">'+f.han+'</span>':'')+
    '<p class="f-eye">❖ 나의 행운 문구 ❖</p>'+
    '<div style="display:flex;justify-content:center;margin:4px 0 0">'+cat(70,'happy')+'</div>'+
    '<p class="f-phrase">'+esc(f.phrase)+'</p>'+
    (f.oh?'<p class="f-sub">— 오행 '+f.oh+'('+f.han+') · '+f.kw+' —</p>':'')+
    '<p class="f-sub" style="margin-top:8px;color:#8a7550">'+(p.nickname?esc(p.nickname)+' · ':'')+today()+'</p>'+
    '<p class="f-brand">ENSEN LAB</p></section>';
  var ratio=S.cardRatio||'post';
  var ratioUI='<div class="opts"><button class="opt'+(ratio==='post'?' on':'')+'" data-ratio="post">기본 카드 (4:5)</button><button class="opt'+(ratio==='story'?' on':'')+'" data-ratio="story">스토리용 (9:16)</button></div>';
  return topbar('<span class="pill">나의 카드</span>',S.prevTab||'home')+
    '<div><h1 class="disp">오늘의 카드</h1><p class="faint small serif">매일 나의 오행에 맞춘 행운 문구 카드가 생겨요.<br>이미지로 저장하거나 SNS에 공유해 보세요.</p></div>'+
    card+ratioUI+
    '<button class="cta gold" data-card-share>공유하기</button>'+
    '<button class="ghost" data-card-save>이미지로 저장</button>'+
    '<p class="faint small center">저장·공유하면 선택한 비율의 이미지로 만들어져요.</p>';
}

/* ── 리포트 ── */
export function viewReport(S){
  var w=E.weekly();var a=E.analysis();
  var head=topbar('<span class="pill">최근 7일</span>',S.prevTab||'home')+'<h1 class="disp">리포트</h1>';
  var ohBlock=a.oh?'<div class="tip"><div class="k">나의 오행 · '+a.oh+'('+a.han+') · '+a.kw+'</div><div class="v">'+esc(a.advice)+'</div></div>':'';
  if(w.days<3){var dots='';for(var i=0;i<3;i++)dots+='<i class="'+(i<w.days?'on':'')+'"></i>';
    return head+ohBlock+'<div class="empty"><div style="margin-bottom:12px;display:flex;justify-content:center">'+cat(76,'base')+'</div><b class="serif" style="font-size:16px;color:var(--char)">3일만 기록하면<br>나만의 패턴을 보여드릴게요</b><div class="pdots">'+dots+'</div><p style="margin-top:12px">지금까지 '+w.days+'일 기록했어요.</p></div>';}
  var topLb=w.topTag||"—";
  /* 핵심 데이터: 행동 × 행운 상관 */
  var cor=E.luckCorrelation();var corBlock='';
  if(cor.cDays>=2&&cor.cRate!=null){
    var corTxt='미션을 완료한 날 중 <b>'+cor.cRate+'%</b>에서 좋은 일이 기록됐어요.';
    if(cor.oDays>=2&&cor.oRate!=null&&cor.cRate>cor.oRate)corTxt+=' 완료하지 않은 날('+cor.oRate+'%)보다 높아요 — 행동이 행운을 만들고 있어요.';
    corBlock='<div class="tip" style="background:#f0f8f2;border-color:#cfe6d4"><div class="k" style="color:#2f7d5a">행동과 행운의 상관</div><div class="v">'+corTxt+'</div></div>';
  }
  var tip;
  if(w.luckRate!=null&&w.luckRate>=60)tip="좋은 일이 자주 기록된 한 주였어요. "+(w.topTag?topLb+" 행동과 함께한 날이 많았네요.":"");
  else if(w.topTag)tip=topLb+" 행동을 가장 자주 실천했어요. 조금 더 가볍게 이어가 봐도 좋아요.";
  else tip="이번 주엔 여러 행동을 고르게 시도했어요. 다음 주엔 하나에 집중해 보는 것도 방법이에요.";
  /* 행운 기록 목록 */
  var jr=E.luckJournal(5).filter(function(x){return x.note;});
  var jrBlock=jr.length?'<div class="sect" style="margin-top:2px"><span class="t" style="font-size:14px">나의 행운 기록</span></div>'+jr.map(function(x){return '<div class="card" style="padding:12px 16px"><p class="serif" style="font-size:13.5px;color:#5a4a2a">“'+esc(x.note)+'”</p><p class="faint small" style="margin-top:4px">'+x.date+'</p></div>';}).join(''):'';
  /* PLUS 티저 */
  var st=DB.settings();
  var plusBlock='<button class="tip" style="width:100%;text-align:left;border-color:#e2d3ef;background:#f8f4fc" data-plus><div class="k" style="color:#7c5cc4">ENSEN PLUS 준비 중 🔒</div><div class="v" style="font-size:13px">오행별 행운의 날 분석 · 행동↔행운 심층 상관 · 월간 리포트'+(st.plusInterest?' — 관심 등록 완료 ✓':' — 눌러서 미리 보기')+'</div></button>';
  return head+'<div class="ins"><div class="big"><b class="mono">'+w.completed+'</b><small>최근 7일 동안 완료한 작은 행동</small></div>'+
    '<div class="grid2"><div class="cell"><div class="k">자주 실천한 결</div><div class="v">'+esc(topLb)+'</div></div><div class="cell"><div class="k">좋은 일 기록률</div><div class="v">'+(w.luckRate!=null?w.luckRate+'%':'기록 없음')+'</div></div></div>'+
    corBlock+ohBlock+'<div class="tip"><div class="k">이런 경향이 보여요</div><div class="v">'+esc(tip)+'</div></div>'+jrBlock+plusBlock+
    '<p class="faint small center">단정이 아니라, 지금까지의 기록에서 보이는 흐름이에요.</p></div>';
}

/* ── 나 ── */
export function viewMe(S){
  var s=DB.settings();var p=DB.profile();var oh=E.ohaengLabel(p.ohaeng);var sym=E.personalSymbol();
  var wtags=(s.wishes||[]).map(function(id){return '<span class="tg">'+wishLb(id)+'</span>';}).join('')||'—';
  return topbar('',S.prevTab||'home')+
    '<div class="me-id"><span style="width:54px;height:54px;border-radius:16px;background:#fbf6ee;border:1px solid var(--line);display:grid;place-items:center;padding:8px;color:#C7A14A">'+glyph(sym.id,"#C7A14A",3.6)+'</span><div><p class="me-name">'+esc(p.nickname||"나")+'</p><p class="faint small">Lv.'+E.level()+(oh?' · 오행 '+oh:'')+' · '+sym.nm+'</p></div></div>'+
    '<div class="card" style="padding:16px 18px;background:linear-gradient(160deg,#fdfaf3,#f7f1e4);border-color:#e7dcc2"><div style="display:flex;gap:14px;align-items:center"><span style="width:60px;height:60px;flex:none;color:#9c8348">'+glyph(sym.id,"#9c8348",3)+'</span><div><p class="eyebrow" style="letter-spacing:.2em">나의 상징</p><p style="font-family:var(--disp);font-size:17px;margin-top:2px">'+sym.nm+' <span class="faint small">'+sym.en+(sym.oh?' · '+sym.oh+'('+({"목":"木","화":"火","토":"土","금":"金","수":"水"}[sym.oh])+')':'')+'</span></p></div></div>'+
    '<p class="serif" style="font-size:13.5px;line-height:1.8;color:#5a4a2a;margin-top:12px">'+esc(sym.desc)+'</p>'+
    '<div style="display:flex;gap:6px;margin-top:10px">'+sym.tags.map(function(t){return '<span class="tg">'+t+'</span>';}).join('')+'</div></div>'+
    '<button class="tip" style="width:100%;text-align:left;border:1px solid #e2d3ef;background:#f8f4fc;border-radius:16px;padding:14px 16px" data-plus><div class="k" style="font-size:11px;font-weight:800;color:#7c5cc4">ENSEN PLUS · 준비 중</div><div class="v" style="font-family:var(--serif);font-size:14px;margin-top:5px;line-height:1.6">더 깊은 나의 리포트, 먼저 만나보세요'+(DB.settings().plusInterest?' — 관심 등록 완료 ✓':'')+'</div></button>'+
    '<div class="device"><svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/></svg>이 기기에만 저장 중</div>'+
    '<p class="why-note">지금은 계정 로그인·기기 간 동기화가 없어요. 기록은 이 브라우저에만 저장돼요. 초기화하면 복구할 수 없어요.</p>'+
    '<div class="card" style="padding:2px 16px">'+
      '<div class="row"><span class="k">소망</span><span class="v"><span class="tags">'+wtags+'</span></span></div>'+
      '<div class="row"><span class="k">생년월일</span><span class="v">'+esc(p.birth||"선택 안 함")+(oh?' · '+oh:'')+'</span></div>'+
      '<div class="row"><span class="k">직업</span><span class="v">'+esc(p.job||"선택 안 함")+'</span></div>'+
      '<div class="row"><span class="k">장소</span><span class="v">'+esc(p.place||"선택 안 함")+'</span></div>'+
      '<div class="row"><span class="k">성향</span><span class="v">'+esc(p.mbti&&p.mbti.indexOf('_')<0?p.mbti:"선택 안 함")+'</span></div>'+
    '</div>'+
    '<button class="ghost" data-edit>소망·개인화 정보 바꾸기</button>'+
    '<button class="link center" data-policy style="align-self:center">개인정보 처리방침</button>'+
    '<div style="display:flex;justify-content:center;margin-top:2px"><button class="link danger" data-reset>데이터 초기화</button></div>'+
    '<p class="faint small center">ENSEN LAB v1.0.0 · Your Story. Your Luck.</p>';
}
