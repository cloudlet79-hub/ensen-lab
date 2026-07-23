// 저장소 — 키 분리(profile/settings/missions/completions/reflections). 서버 전환 시 이 어댑터만 교체.
export var DB={
  _g:function(k,d){try{var v=localStorage.getItem('ensen.'+k);return v?JSON.parse(v):d;}catch(e){return d;}},
  _s:function(k,v){try{localStorage.setItem('ensen.'+k,JSON.stringify(v));}catch(e){}},
  profile:function(){return this._g('profile',{});},
  settings:function(){return this._g('settings',{});},
  missions:function(){return this._g('missions',{});},
  completions:function(){return this._g('completions',{});},
  reflections:function(){return this._g('reflections',{});},
  patchProfile:function(p){var o=this.profile();for(var k in p)o[k]=p[k];this._s('profile',o);return o;},
  patchSettings:function(p){var o=this.settings();for(var k in p)o[k]=p[k];this._s('settings',o);return o;},
  setMissions:function(v){this._s('missions',v);},
  setCompletions:function(v){this._s('completions',v);},
  setReflections:function(v){this._s('reflections',v);},
  clearAll:function(){['profile','settings','missions','completions','reflections'].forEach(function(k){localStorage.removeItem('ensen.'+k);});}
};
// Supabase Edge Function (AI 미션 생성). ANTHROPIC_API_KEY 시크릿 설정 시 실동작.
export var SUPA_URL="https://miildqjxzdgwwnvmjrzv.supabase.co";
export var SUPA_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paWxkcWp4emRnd3dudm1qcnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjUwMDEsImV4cCI6MjEwMDI0MTAwMX0.c5GM61LzqkeKKWxm3FQRGYQT89llMgu9fg22ok70MC0";
export var FN_URL=SUPA_URL+"/functions/v1/generate-missions";
// 관리자 게이트: 서버 지표·코드 검증은 admin_summary RPC가 담당(프런트에 권한 로직 없음).
export var ADMIN_URL="ensen_admin.html";
export var ADMIN_CODE="ensen-admin"; // UI 게이트용(로컬 진단 열람)

/* ── 익명 사용 이벤트 적재 (fire-and-forget, 실패 무시) ── */
export function track(event,props){
  try{
    var p=DB.profile();var seed=p.seedId||"anon";
    fetch(SUPA_URL+"/rest/v1/app_events",{method:"POST",
      headers:{apikey:SUPA_ANON,Authorization:"Bearer "+SUPA_ANON,"Content-Type":"application/json",Prefer:"return=minimal"},
      body:JSON.stringify({seed_id:seed,event:String(event).slice(0,40),props:props||{}})}).catch(function(){});
  }catch(e){}
}
/* ── 판본 관리형 룰셋(CMS) 로드: 캐시 즉시 + 백그라운드 갱신 ── */
export function cachedRuleset(){return DB._g('ruleset',null);}
export function fetchRuleset(cb){
  try{
    fetch(SUPA_URL+"/rest/v1/rulesets?active=eq.true&select=version,content&order=version.desc&limit=1",
      {headers:{apikey:SUPA_ANON,Authorization:"Bearer "+SUPA_ANON}})
      .then(function(r){return r.json();})
      .then(function(rows){
        if(Array.isArray(rows)&&rows[0]&&rows[0].content){
          var cur=cachedRuleset();
          if(!cur||cur.version!==rows[0].version){DB._s('ruleset',rows[0]);if(cb)cb(rows[0]);}
        }
      }).catch(function(){});
  }catch(e){}
}
/* ── 서버 관리자 요약 (admin_summary RPC — 코드는 서버가 검증) ── */
export function fetchAdminSummary(code){
  return fetch(SUPA_URL+"/rest/v1/rpc/admin_summary",{method:"POST",
    headers:{apikey:SUPA_ANON,Authorization:"Bearer "+SUPA_ANON,"Content-Type":"application/json"},
    body:JSON.stringify({access_code:code})})
    .then(function(r){return r.json();}).catch(function(){return null;});
}
