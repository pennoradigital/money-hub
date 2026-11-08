/* PennoraDigital Money Hub - shared helpers. Everything stays in this browser (localStorage). Nothing is sent anywhere. */
var PH = (function(){
  var MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var MONL=["January","February","March","April","May","June","July","August","September","October","November","December"];
  function $(id){return document.getElementById(id)}
  function num(v){var n=parseFloat(String(v==null?"":v).replace(/[^0-9.\-]/g,""));return isFinite(n)?n:0}
  function pos(v){return Math.max(0,num(v))}
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function load(key,def){try{var t=localStorage.getItem(key);if(t)return JSON.parse(t)}catch(e){}return def}
  function store(key,val,badge){var ok=true;try{localStorage.setItem(key,JSON.stringify(val))}catch(e){ok=false}
    var el=badge&&$(badge); if(el){el.textContent=ok?"✓ Saved on this device":"Not saving in this browser";el.className=ok?"saved":"saved off"} return ok}
  function cur(){var c=load("pennora-hub-cur",null);return typeof c==="string"?c:"$"}
  function setCur(c){try{localStorage.setItem("pennora-hub-cur",JSON.stringify(c))}catch(e){}}
  function money(v,c){if(!isFinite(v))return "—";c=(c==null?cur():c);var r=Math.round(v);return (r<0?"-":"")+c+Math.abs(r).toLocaleString("en-AU")}
  function money2(v,c){c=(c==null?cur():c);var r=Math.round(v*100)/100;return (r<0?"-":"")+c+Math.abs(r).toLocaleString("en-AU",{minimumFractionDigits:r%1?2:0,maximumFractionDigits:2})}
  function ym(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")}
  function ymAdd(s,k){var p=s.split("-"),t=(+p[0])*12+(+p[1]-1)+k;return Math.floor(t/12)+"-"+String(t%12+1).padStart(2,"0")}
  function ymLabel(s,long){var p=s.split("-");return (long?MONL:MON)[+p[1]-1]+" "+p[0]}
  function ymDiff(a,b){var x=a.split("-"),y=b.split("-");return (+y[0]-x[0])*12+(+y[1]-x[1])}
  function dur(n){if(!isFinite(n))return "never";var y=Math.floor(n/12),m=n%12,a=[];if(y)a.push(y+(y===1?" yr":" yrs"));if(m||!y)a.push(m+(m===1?" mth":" mths"));return a.join(" ")}
  function curSelect(sel,val,onchange){
    var opts=[["$","$ Dollar"],["£","£ Pound"],["€","€ Euro"],["₹","₹ Rupee"],["R","R Rand"],["¥","¥ Yen"],["","None"]];
    sel.innerHTML=opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>'}).join("");
    sel.value=val; sel.addEventListener("change",function(){onchange(sel.value)});
  }
  function download(name,obj){var b=new Blob([JSON.stringify(obj,null,1)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
  function pickFile(input,cb){input.addEventListener("change",function(){var f=input.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{cb(JSON.parse(r.result))}catch(e){alert("That file couldn't be opened. Please choose a backup file saved from this app.")}input.value=""};r.readAsText(f)})}
  /* debt maths (same as Debt Payoff app) for the Home summary */
  function debtFree(st){
    if(!st||!Array.isArray(st.debts))return null;
    var d=st.debts.filter(function(x){return +x.bal>0.005}).map(function(x){return {bal:+x.bal,r:(+x.rate||0)/1200,min:+x.min||0}});
    if(!d.length)return {total:0,months:0};
    var total=d.reduce(function(s,x){return s+x.bal},0);
    var order=d.slice(); if(st.strategy==="snowball")order.sort(function(a,b){return a.bal-b.bal||b.r-a.r});else order.sort(function(a,b){return b.r-a.r||a.bal-b.bal});
    var budget=d.reduce(function(s,x){return s+x.min},0)+(+st.extra||0),m=0;
    function left(){for(var j=0;j<d.length;j++)if(d[j].bal>0.005)return true;return false}
    while(m<600&&left()){m++;var av=budget;d.forEach(function(x){if(x.bal>0.005)x.bal+=x.bal*x.r});
      d.forEach(function(x){if(x.bal>0.005){var p=Math.min(x.min,x.bal);x.bal-=p;av-=p}});
      for(var j=0;j<order.length&&av>0.005;j++){var x=order[j];if(x.bal>0.005){var p=Math.min(av,x.bal);x.bal-=p;av-=p}}}
    return {total:total,months:left()?Infinity:m,start:/^\d{4}-\d{2}$/.test(st.start||"")?st.start:ym()};
  }
  if("serviceWorker" in navigator && location.protocol==="https:"){navigator.serviceWorker.register("sw.js").catch(function(){})}
  return {$:$,num:num,pos:pos,esc:esc,load:load,store:store,cur:cur,setCur:setCur,money:money,money2:money2,ym:ym,ymAdd:ymAdd,ymLabel:ymLabel,ymDiff:ymDiff,dur:dur,curSelect:curSelect,download:download,pickFile:pickFile,debtFree:debtFree,MON:MON,MONL:MONL};
})();
