// 엔진 — 오행 분석 · 행운 문구 · 미션 생성(AI+로컬) · 완료/회고 · 지표
import { DB, FN_URL, SUPA_ANON, cachedRuleset } from './store.js';
import { POOL, OHAENG, FORTUNE_GEN, OH_ADVICE, MBTI_NOTE, REWARD, wishLb, SYMBOLS, BURDENS, burdenLb } from './data.js';
import { colorForGlyph } from './assets.js';
import { today, dAgo, hash, shuffleSeeded } from './util.js';

export function seedId(){var p=DB.profile();if(!p.seedId){p=DB.patchProfile({seedId:Date.now().toString(36)+Math.random().toString(36).slice(2,8)});}return p.seedId;}
export function ohaengOf(birth){if(!birth)return null;var y=parseInt(String(birth).slice(0,4),10);if(!y)return null;var stem=((y-4)%10+10)%10;return ["목","목","화","화","토","토","금","금","수","수"][stem];}
export function ohaengLabel(o){return o?({"목":"목(木)","화":"화(火)","토":"토(土)","금":"금(金)","수":"수(水)"}[o]):null;}

// AI 분석 결과 (생년월일→오행, MBTI→성향 노트). 규칙 기반이며 은유적으로 표현.
export function analysis(){
  var p=DB.profile();var oh=p.ohaeng;var meta=oh?OHAENG[oh]:null;
  var traits=[];
  if(oh)traits.push({k:"기운",v:OH_ADVICE[oh]});
  if(p.mbti&&p.mbti.indexOf('_')<0){
    var t=p.mbti;var notes=[];[0,1,2,3].forEach(function(i){var c=t[i];if(MBTI_NOTE[c])notes.push(MBTI_NOTE[c]);});
    traits.push({k:"성향",v:notes.slice(0,2).join(' ')});
  }
  if(p.job)traits.push({k:"일상",v:esc0(p.job)+" 안에서 실천할 수 있는 행동으로 맞춰요."});
  return {oh:oh,han:meta?meta.han:null,kw:meta?meta.kw:null,tone:meta?meta.tone:null,advice:oh?OH_ADVICE[oh]:null,traits:traits};
}
function esc0(s){return String(s||'');}

/* 룰셋(CMS): 원격 판본이 캐시돼 있으면 그것을, 없으면 번들 데이터 사용 */
export function activePool(){
  var rs=cachedRuleset();
  if(rs&&rs.content&&Array.isArray(rs.content.pool)&&rs.content.pool.length)return rs.content.pool;
  return POOL;
}
function activePhrases(oh){
  var rs=cachedRuleset();
  if(rs&&rs.content&&rs.content.phrases&&Array.isArray(rs.content.phrases[oh])&&rs.content.phrases[oh].length)return rs.content.phrases[oh];
  return OHAENG[oh]?OHAENG[oh].phrases:null;
}
export function rulesetVersion(){var rs=cachedRuleset();return rs?rs.version:0;}
/* 개인 고유 심벌 (오행 + 시드로 결정적 부여) */
export function personalSymbol(){
  var p=DB.profile();var oh=p.ohaeng;
  var cand=oh?SYMBOLS.filter(function(x){return x.oh===oh;}):SYMBOLS;
  if(!cand.length)cand=SYMBOLS;
  return cand[hash(seedId()+'sym')%cand.length];
}

export function fortune(){
  var p=DB.profile();var oh=p.ohaeng;var seed=hash(seedId()+today());
  if(oh&&OHAENG[oh]){var ph=activePhrases(oh)||OHAENG[oh].phrases;return {phrase:ph[seed%ph.length],oh:oh,han:OHAENG[oh].han,kw:OHAENG[oh].kw};}
  return {phrase:FORTUNE_GEN[seed%FORTUNE_GEN.length],oh:null};
}

export function eligiblePool(){var s=DB.settings();var wishes=(s.wishes&&s.wishes.length)?s.wishes:["happy"];return activePool().filter(function(a){return wishes.indexOf(a.w)>=0;});}
export function localMissions(count){
  var s=DB.settings();var wishes=(s.wishes&&s.wishes.length)?s.wishes:["happy"];
  var seed=hash(seedId()+today()+wishes.join(',')+(DB.profile().ohaeng||''));
  var pool=eligiblePool();if(!pool.length)pool=activePool().slice();
  var out=shuffleSeeded(pool,seed).slice(0,count||3).map(function(a){return {sentence:a.s,minutes:a.min,tag:wishLb(a.w),reason:a.r,glyph:a.g,color:a.c,source:"local"};});
  /* 어제 마음이 무거웠다면 → 케어 미션 하나 주입 */
  var care=getCare(dAgo(1));var meta=care&&care.burden?careMeta(care.burden):null;
  if(meta&&meta.care&&out.length>=2){
    var used=out.map(function(x){return x.sentence;});
    var cp=activePool().filter(function(a){return a.w===meta.care&&a.min<=3&&used.indexOf(a.s)<0;});
    if(cp.length){var pick=shuffleSeeded(cp,hash(seedId()+today()+'care'))[0];
      out[out.length-1]={sentence:pick.s,minutes:pick.min,tag:"마음 돌봄",reason:"어제 "+burdenLb(care.burden)+"이(가) 무거웠다고 하셔서, 가볍게 돌보는 행동을 담았어요.",glyph:pick.g,color:"#2FB39B",source:"local"};}
  }
  return out;
}
export function aiMissions(count){
  var s=DB.settings();var p=DB.profile();
  var body={date:today(),seedId:seedId(),count:count||3,profile:{wishes:(s.wishes||[]).map(wishLb),ohaeng:p.ohaeng||null,birth:p.birth||null,job:p.job||null,place:p.place||null,mbti:(p.mbti&&p.mbti.indexOf('_')<0?p.mbti:null),burden:(function(){var c=getCare(dAgo(1));return c&&c.burden&&c.burden!=='none'?burdenLb(c.burden):null;})()}};
  return fetch(FN_URL,{method:"POST",headers:{"apikey":SUPA_ANON,"Authorization":"Bearer "+SUPA_ANON,"Content-Type":"application/json"},body:JSON.stringify(body)})
    .then(function(r){return r.json();})
    .then(function(d){
      if(!d||!d.ok||!Array.isArray(d.missions)||!d.missions.length)return null;
      return {state:d.state||null,missions:d.missions.map(function(m){return {sentence:m.sentence,minutes:m.minutes||2,tag:m.tag||"",reason:m.reason||"",glyph:m.glyph||"clover",color:colorForGlyph(m.glyph),source:"ai"};})};
    }).catch(function(){return null;});
}
export function ensureToday(cb){
  var date=today();var m=DB.missions();
  if(m[date]&&m[date].items){cb(m[date]);return;}
  aiMissions(3).then(function(res){
    var entry=(res&&res.missions&&res.missions.length)?{items:res.missions,state:res.state,source:"ai",swaps:0}:{items:localMissions(3),state:null,source:"local",swaps:0};
    var mm=DB.missions();mm[date]=entry;DB.setMissions(mm);cb(entry);
  });
}
export function swapMission(i){
  var date=today();var m=DB.missions();var entry=m[date];if(!entry)return null;
  var s=DB.settings();var wishes=s.wishes||[];var used=entry.items.map(function(x){return x.sentence;});
  var AP=activePool();var pool=AP.filter(function(a){return wishes.indexOf(a.w)>=0&&used.indexOf(a.s)<0;});
  if(!pool.length)pool=AP.filter(function(a){return used.indexOf(a.s)<0;});
  if(!pool.length)return false;
  entry.swaps=(entry.swaps||0)+1;var pick=shuffleSeeded(pool,hash(seedId()+date+'w'+i+'#'+entry.swaps))[0];
  entry.items[i]={sentence:pick.s,minutes:pick.min,tag:wishLb(pick.w),reason:pick.r,glyph:pick.g,color:pick.c,source:entry.items[i].source};
  var c=DB.completions();if(c[date])delete c[date][String(i)];DB.setCompletions(c);
  DB.setMissions(m);return entry;
}
// 완료 (원탭)
export function isDone(date,i){var c=DB.completions();return !!(c[date]&&c[date][String(i)]);}
export function markDone(date,i){var c=DB.completions();c[date]=c[date]||{};c[date][String(i)]={t:Date.now()};DB.setCompletions(c);}
export function unmarkDone(date,i){var c=DB.completions();if(c[date])delete c[date][String(i)];DB.setCompletions(c);}
/* 하루 닫기 = 행운 기록 (핵심 데이터: 행동 × 좋은 일) */
export function saveLuck(date,v,note){var r=DB.reflections();r['__close_'+date]={v:v,note:(note||'').slice(0,80),t:Date.now()};DB.setReflections(r);}
export function saveCare(date,burden){var r=DB.reflections();r['__care_'+date]={burden:burden,t:Date.now()};DB.setReflections(r);}
export function getCare(date){var r=DB.reflections();return r['__care_'+date]||null;}
export function careMeta(id){for(var i=0;i<BURDENS.length;i++)if(BURDENS[i].id===id)return BURDENS[i];return null;}
export function getLuck(date){var r=DB.reflections();var e=r['__close_'+date];if(!e)return null;if(typeof e==='string')return {v:e,note:''};return e;}
export function luckJournal(limit){var r=DB.reflections();var out=[];for(var k in r){if(k.indexOf('__close_')===0){var e=r[k];var v=(typeof e==='string')?{v:e,note:''}:e;out.push({date:k.slice(8),v:v.v,note:v.note||''});}}out.sort(function(a,b){return a.date<b.date?1:-1;});return out.slice(0,limit||10);}
/* 행동↔행운 상관: 최근 14일, 미션 완료한 날 vs 아닌 날의 '좋은 일' 기록률 */
export function luckCorrelation(){
  var c=DB.completions();var days=0,cGood=0,cDays=0,oGood=0,oDays=0;
  for(var i=0;i<14;i++){var d=dAgo(i);var luck=getLuck(d);var completed=c[d]&&Object.keys(c[d]).length>0;
    if(!luck&&!completed)continue;days++;
    if(completed){cDays++;if(luck&&luck.v==='good')cGood++;}
    else{oDays++;if(luck&&luck.v==='good')oGood++;}}
  return {days:days,cDays:cDays,cRate:cDays?Math.round(cGood/cDays*100):null,oDays:oDays,oRate:oDays?Math.round(oGood/oDays*100):null};
}
// 지표
export function completedCountAll(){var c=DB.completions(),n=0;for(var k in c)n+=Object.keys(c[k]).length;return n;}
export function streak(){var c=DB.completions(),d=new Date(),n=0;for(var i=0;i<400;i++){var ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');var has=c[ds]&&Object.keys(c[ds]).length;if(has)n++;else if(i>0)break;d.setDate(d.getDate()-1);}return n;}
export function level(){return 1+Math.floor(completedCountAll()/6);}
export function symbolsUnlocked(){return Math.min(REWARD.length,Math.floor(completedCountAll()/2)+2);}
export function weekly(){
  var c=DB.completions(),m=DB.missions();
  var completed=0,tagCount={},days=0,luckGood=0,luckDays=0;
  for(var i=0;i<7;i++){var d=dAgo(i);var cd=c[d]?Object.keys(c[d]):[];if(cd.length)days++;completed+=cd.length;
    cd.forEach(function(idx){var it=m[d]&&m[d].items&&m[d].items[parseInt(idx,10)];var tag=it?it.tag:null;if(tag)tagCount[tag]=(tagCount[tag]||0)+1;});
    var luck=getLuck(d);if(luck){luckDays++;if(luck.v==='good')luckGood++;}}
  var topTag=null,mx=0;for(var t in tagCount)if(tagCount[t]>mx){mx=tagCount[t];topTag=t;}
  return {completed:completed,days:days,topTag:topTag,luckDays:luckDays,luckRate:luckDays?Math.round(luckGood/luckDays*100):null};
}
