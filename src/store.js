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
// 관리자 소프트 게이트(코드). 관리자 권한 판단 로직은 프런트에 두지 않음 — 실제 권한은 정식 콘솔 서버.
export var ADMIN_URL="ensen_admin.html";
export var ADMIN_CODE="ensen-admin";
