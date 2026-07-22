// 엔진 — 오행 분석 · 행운 문구 · 미션 생성(AI+로컬) · 완료/회고 · 지표
import { DB, FN_URL, SUPA_ANON } from './store.js';
import { POOL, OHAENG, FORTUNE_GEN, OH_ADVICE, MBTI_NOTE, REWARD, wishLb } from './data.js';
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

export function fortune(){
  var p=DB.profile();var oh=p.ohaeng;var seed=hash(seedId()+today());
  if(oh&&OHAENG[oh]){var ph=OHAENG[oh].phrases;return {phrase:ph[seed%ph.length],oh:oh,han:OHAENG[oh].han,kw:OHAENG[oh].kw};}
  return {phrase:FORTUNE_GEN[seed%FORTUNE_GEN.length],oh:null};
}

export function eligiblePool(){var s=DB.settings();var wishes=(s.wishes&&s.wishes.length)?s.wishes:["happy"];return POOL.filter(function(a){return wishes.indexOf(a.w)>=0;});}
export function localMissions(count){
  var s=DB.settings();var wishes=(s.wishes&&s.wishes.length)?s.wishes:["happy"];
  var seed=hash(seedId()+today()+wishes.join(',')+(DB.profile().ohaeng||''));
  var pool=eligiblePool();if(!pool.length)pool=POOL.slice();
  return shuffleSeeded(pool,seed).slice(0,count||3).map(function(a){return {sentence:a.s,minutes:a.min,tag:wishLb(a.w),reason:a.r,glyph:a.g,color:a.c,source:"local"};});
}
export function aiMissions(count){
  var s=DB.settings();var p=DB.profile();
  var body={date:today(),count:count||3,profile:{wishes:(s.wishes||[]).map(wishLb),ohaeng:p.ohaeng||null,birth:p.birth||null,job:p.job||null,place:p.place||null,mbti:(p.mbti&&p.mbti.indexOf('_')<0?p.mbti:null)}};
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
  var pool=POOL.filter(function(a){return wishes.indexOf(a.w)>=0&&used.indexOf(a.s)<0;});
  if(!pool.length)pool=POOL.filter(function(a){return used.indexOf(a.s)<0;});
  if(!pool.length)return false;
  entry.swaps=(entry.swaps||0)+1;var pick=shuffleSeeded(pool,hash(seedId()+date+'w'+i+'#'+entry.swaps))[0];
  entry.items[i]={sentence:pick.s,minutes:pick.min,tag:wishLb(pick.w),reason:pick.r,glyph:pick.g,color:pick.c,source:entry.items[i].source};
  var c=DB.completions();if(c[date])delete c[date][String(i)];DB.setCompletions(c);
  DB.setMissions(m);return entry;
}
// 완료/회고 (분리 저장)
export function isDone(date,i){var c=DB.completions();return !!(c[date]&&c[date][String(i)]);}
export function markDone(date,i){var c=DB.completions();c[date]=c[date]||{};c[date][String(i)]={t:Date.now()};DB.setCompletions(c);}
export function unmarkDone(date,i){var c=DB.completions();if(c[date])delete c[date][String(i)];DB.setCompletions(c);var r=DB.reflections();if(r[date])delete r[date][String(i)];DB.setReflections(r);}
export function saveReflection(date,i,felt,again){var r=DB.reflections();r[date]=r[date]||{};r[date][String(i)]={felt:felt||null,again:again||null,t:Date.now()};DB.setReflections(r);}
// 지표
export function completedCountAll(){var c=DB.completions(),n=0;for(var k in c)n+=Object.keys(c[k]).length;return n;}
export function streak(){var c=DB.completions(),d=new Date(),n=0;for(var i=0;i<400;i++){var ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');var has=c[ds]&&Object.keys(c[ds]).length;if(has)n++;else if(i>0)break;d.setDate(d.getDate()-1);}return n;}
export function level(){return 1+Math.floor(completedCountAll()/6);}
export function symbolsUnlocked(){return Math.min(REWARD.length,Math.floor(completedCountAll()/2)+2);}
export function weekly(){
  var c=DB.completions(),r=DB.reflections(),m=DB.missions();
  var completed=0,tagCount={},good=0,reflTotal=0,days=0;
  for(var i=0;i<7;i++){var d=dAgo(i);var cd=c[d]?Object.keys(c[d]):[];if(cd.length)days++;completed+=cd.length;
    cd.forEach(function(idx){var it=m[d]&&m[d].items&&m[d].items[parseInt(idx,10)];var tag=it?it.tag:null;if(tag)tagCount[tag]=(tagCount[tag]||0)+1;});
    if(r[d])for(var k in r[d]){var f=r[d][k].felt;if(f){reflTotal++;if(f==='good')good++;}}}
  var topTag=null,mx=0;for(var t in tagCount)if(tagCount[t]>mx){mx=tagCount[t];topTag=t;}
  return {completed:completed,days:days,topTag:topTag,pos:reflTotal?Math.round(good/reflTotal*100):null};
}
