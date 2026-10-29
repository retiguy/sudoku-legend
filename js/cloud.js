(()=>{'use strict';
const keys=['sudoku-legend-v2-game','sudoku-legend-v25-daily-game','sudoku-legend-v2-profile'];
const extra=Object.keys(localStorage).filter(k=>k.startsWith('sudoku-legend-')&&!keys.includes(k));
const allKeys=[...new Set([...keys,...extra])];
const cfg=window.SUDOKU_CLOUD_CONFIG||{};
let client=null,user=null;
const ui=document.createElement('dialog');ui.id='cloudDialog';ui.style.cssText='background:#1c2940;color:#fff;border:1px solid #e7b454;border-radius:16px;padding:24px;max-width:min(520px,94vw);width:100%;box-shadow:0 12px 60px #0008';
ui.innerHTML=`<h2>☁️ 클라우드 동기화</h2><p id="cloudStatus">설정 확인 중...</p><label>이메일 <input id="cloudEmail" type="email" autocomplete="email" style="width:100%;padding:10px;margin:8px 0;color:#111"></label><label>비밀번호 <input id="cloudPass" type="password" autocomplete="current-password" style="width:100%;padding:10px;margin:8px 0;color:#111"></label><div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0"><button id="cloudSignUp">회원가입</button><button id="cloudSignIn">로그인</button><button id="cloudSignOut">로그아웃</button></div><hr><p>⚠️ 처음에는 자동 덮어쓰기 대신 수동 동기화를 사용합니다. 다른 기기에서 불러오면 현재 기기의 기록이 교체됩니다.</p><div style="display:flex;flex-wrap:wrap;gap:8px"><button id="cloudUpload">⬆️ 이 기기 기록 올리기</button><button id="cloudDownload">⬇️ 클라우드 기록 가져오기</button><button id="cloudClose">닫기</button></div>`;
document.body.appendChild(ui);const $=id=>document.getElementById(id),status=t=>$('cloudStatus').textContent=t;
function ready(){if(!cfg.url||!cfg.anonKey){status('Supabase 주소와 공개 키를 js/cloud-config.js에 입력해 주세요.');return false}if(!window.supabase){status('인터넷 연결 또는 Supabase SDK 로딩을 확인해 주세요.');return false}try{client=window.supabase.createClient(cfg.url,cfg.anonKey);return true}catch(e){status('설정 오류: '+e.message);return false}}
async function refresh(){if(!client)return;const {data,error}=await client.auth.getUser();user=data?.user||null;status(error?'로그인 상태 확인 실패: '+error.message:user?'로그인됨: '+user.email:'로그인 후 동기화할 수 있습니다.')}
$('cloudOpen').onclick=async()=>{ui.showModal();if(!client&&ready())await refresh();else if(client)await refresh()};$('cloudClose').onclick=()=>ui.close();
$('cloudSignUp').onclick=async()=>{if(!client&&!ready())return;const {error}=await client.auth.signUp({email:$('cloudEmail').value.trim(),password:$('cloudPass').value});status(error?error.message:'가입 요청 완료. 이메일 확인 설정에 따라 인증 메일 확인 후 로그인하세요.')};
$('cloudSignIn').onclick=async()=>{if(!client&&!ready())return;const {error}=await client.auth.signInWithPassword({email:$('cloudEmail').value.trim(),password:$('cloudPass').value});if(error)status(error.message);else await refresh()};
$('cloudSignOut').onclick=async()=>{if(!client)return;await client.auth.signOut();await refresh()};
async function authorized(){if(!client&&!ready())return false;await refresh();if(!user){status('먼저 로그인해 주세요.');return false}return true}
$('cloudUpload').onclick=async()=>{if(!await authorized())return;if(!confirm('이 기기의 저장 데이터를 클라우드에 올릴까요? 기존 클라우드 데이터는 교체됩니다.'))return;
const snapshot={};for(const k of allKeys){const v=localStorage.getItem(k);if(v!==null)snapshot[k]=v}
const {error}=await client.from('sudoku_saves').upsert({user_id:user.id,payload:snapshot,updated_at:new Date().toISOString()},{onConflict:'user_id'});status(error?'업로드 실패: '+error.message:'업로드 완료! 다른 기기에서 가져오기를 눌러 주세요.')};
$('cloudDownload').onclick=async()=>{if(!await authorized())return;const {data,error}=await client.from('sudoku_saves').select('payload,updated_at').eq('user_id',user.id).maybeSingle();if(error){status('불러오기 실패: '+error.message);return}if(!data){status('클라우드에 저장된 기록이 없습니다.');return}if(!confirm('클라우드 기록('+data.updated_at+')으로 이 기기 기록을 교체할까요? 현재 진행 중인 기록은 사라질 수 있습니다.'))return;
const payload=data.payload;if(!payload||typeof payload!=='object'||Array.isArray(payload)){status('저장 데이터 형식 오류');return}for(const [k,v] of Object.entries(payload)){if(k.startsWith('sudoku-legend-')&&typeof v==='string')localStorage.setItem(k,v)}status('가져오기 완료. 게임을 다시 불러옵니다.');location.reload()};
})();