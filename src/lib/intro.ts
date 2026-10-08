// Opening intro: plain HTML + an inline script, so it runs as soon as the page
// is parsed rather than after React hydrates (on a slow first load the clip used
// to finish before React attached its listeners, leaving the splash stuck on the
// last frame). React never manages this markup: the root layout renders it with
// dangerouslySetInnerHTML and the script empties the container when done.
//
// Flow: the clip plays on white; on its last frame (the full logo) the logo
// image takes its place and flies into the navbar logo spot, while the white
// layer holds until the logo is about halfway, then gives way to the homepage.
// Shown once per browser session; skipped on /admin and for returning visits.

const SEEN_KEY = 'mozza-intro-seen';
const LOGO_SRC = '/brand/mozza-italia-logo.png';

// Runs in <head> before paint: hide the intro for the rest of the session.
export const introGateScript = `try{if(sessionStorage.getItem('${SEEN_KEY}'))document.documentElement.classList.add('intro-seen')}catch(e){}`;

const INTRO_MARKUP = '<div class="intro-backdrop"></div><video src="/brand/intro.mp4" muted playsinline preload="auto" disablepictureinpicture></video>';

export const introScript = `(function(){
var d=document,html=d.documentElement;
if(html.classList.contains('intro-seen')||location.pathname.indexOf('/admin')===0)return;
// Built by this script and attached to <body> directly (React never renders or
// hydrates it), so React starting up can't replace the playing video.
var splash=d.createElement('div');splash.className='intro-splash';splash.setAttribute('aria-hidden','true');
splash.innerHTML='${INTRO_MARKUP}';
d.body.appendChild(splash);
var video=splash.querySelector('video'),backdrop=splash.querySelector('.intro-backdrop');
var FLY=1200,started=false,safety;
var V={w:848,h:478,x:114,y:106,bw:625};
var L={w:1600,h:649,x:125,y:36,bw:1364};
var pre=new Image();pre.src='${LOGO_SRC}';if(pre.decode)pre.decode().catch(function(){});
function done(){try{sessionStorage.setItem('${SEEN_KEY}','1')}catch(e){}html.classList.add('intro-seen');if(splash.parentNode)splash.parentNode.removeChild(splash);}
function fly(){
if(started)return;started=true;clearTimeout(safety);
var target=d.querySelector('.nav-brand img');
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!target||reduce||!video.animate){done();return;}
var r=video.getBoundingClientRect(),s=Math.min(r.width/V.w,r.height/V.h);
var ox=r.left+(r.width-V.w*s)/2,oy=r.top+(r.height-V.h*s)/2;
var artL=ox+V.x*s,artT=oy+V.y*s,k=(V.bw*s)/L.bw;
var sl=artL-L.x*k,st=artT-L.y*k,sw=L.w*k,sh=L.h*k;
var e=target.getBoundingClientRect();
var logo=d.createElement('img');logo.src='${LOGO_SRC}';logo.alt='';logo.className='intro-fly-logo';
logo.style.left=sl+'px';logo.style.top=st+'px';logo.style.width=sw+'px';logo.style.height=sh+'px';
splash.appendChild(logo);video.style.visibility='hidden';
logo.animate([{transform:'translate(0px,0px) scale(1)'},{transform:'translate('+(e.left-sl)+'px,'+(e.top-st)+'px) scale('+(e.width/sw)+')'}],{duration:FLY,easing:'cubic-bezier(.45,0,.15,1)',fill:'forwards'});
if(backdrop)backdrop.animate([{opacity:1},{opacity:1,offset:.45},{opacity:0,offset:.75},{opacity:0}],{duration:FLY,fill:'forwards'});
setTimeout(done,FLY);
}
video.addEventListener('ended',fly);
video.addEventListener('error',fly);
splash.addEventListener('click',fly);
// Play once the page is parsed (navbar exists) and only while the tab is visible.
function start(){
if(d.hidden){d.addEventListener('visibilitychange',onVisible);return;}
d.removeEventListener('visibilitychange',onVisible);
safety=setTimeout(fly,9000);
var p=video.play&&video.play();
if(p&&p.catch)p.catch(function(){clearTimeout(safety);if(d.hidden)d.addEventListener('visibilitychange',onVisible);else fly();});
}
function onVisible(){if(!d.hidden)start();}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start);else start();
})();`;
