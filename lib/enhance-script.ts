/**
 * Tiny page enhancements without a React runtime. Client islands were the
 * desktop TBT: Next hydrated Link, the theme toggle and the count-ups on a
 * static export that does not need a router.
 */
export const enhanceScript = `(function(){try{
var root=document.documentElement;
var btn=document.getElementById("theme-toggle");
if(btn){
  btn.setAttribute("aria-pressed",root.dataset.theme==="dark"?"true":"false");
  btn.addEventListener("click",function(){
    var next=root.dataset.theme!=="dark";
    root.dataset.theme=next?"dark":"light";
    root.style.colorScheme=next?"dark":"light";
    btn.setAttribute("aria-pressed",next?"true":"false");
    try{localStorage.setItem("theme",next?"dark":"light")}catch(e){}
  });
}
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var nodes=document.querySelectorAll("[data-count]");
if(!nodes.length)return;
var io=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(!entry.isIntersecting)return;
    io.unobserve(entry.target);
    var el=entry.target;
    var target=Number(el.getAttribute("data-count"));
    var locale=el.getAttribute("data-locale")||"en";
    var start=performance.now();
    var step=function(now){
      var t=Math.min((now-start)/1100,1);
      var eased=t===1?1:1-Math.pow(2,-9*t);
      el.textContent=Math.round(target*eased).toLocaleString(locale);
      if(t<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
},{threshold:0.5});
nodes.forEach(function(n){io.observe(n)});
}catch(e){}})();`;
