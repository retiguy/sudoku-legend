/* V2.7 화면 크기 조절 및 집중 모드: 게임 데이터 변경 없음 */
(()=>{'use strict';
 const root=document.documentElement;
 const nav=document.querySelector('.main-nav');
 const game=document.querySelector('#gameLayout');
 const button=document.createElement('button');
 button.type='button';button.id='focusToggle';button.textContent='🎯 집중 모드';button.setAttribute('aria-pressed','false');
 nav.appendChild(button);
 let focus=false;
 function update(){
   const w=window.innerWidth,h=window.innerHeight;
   const mobile=w<=720;
   const top=document.querySelector('.topbar');
   const used=(top?.getBoundingClientRect().bottom||130)+(nav?.getBoundingClientRect().height||48)+55;
   // 보드 위 제목/아래 입력·조작 버튼을 위한 높이를 예약한다.
   const available=h-used-195;
   const side=focus?Math.min(w-60,880):Math.min(w*.43,680);
   const board=mobile?Math.max(250,Math.min(w-42,540)):Math.max(310,Math.min(side,available));
   root.style.setProperty('--legend-board-size',Math.round(board)+'px');
   root.classList.toggle('legend-compact',!mobile && h<960);
 }
 button.addEventListener('click',()=>{
   focus=!focus;root.classList.toggle('legend-focus',focus);
   button.textContent=focus?'↩ 일반 모드':'🎯 집중 모드';button.setAttribute('aria-pressed',String(focus));
   update();
 });
 window.addEventListener('resize',update,{passive:true});
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(update)));
 update();
})();
