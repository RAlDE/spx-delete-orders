// Simulação DOM com relógio virtual. Não acessa o SPX real.
const path=require('node:path');
const paths=[path.resolve('node_modules'),process.env.DEL_TEST_MODULES,path.resolve('../test-runtime/node_modules')].filter(Boolean);
const {JSDOM}=require(require.resolve('jsdom',{paths}));
const FakeTimers=require(require.resolve('@sinonjs/fake-timers',{paths}));
function wrapper(get){return {locator(selector){return wrapper(()=>{const e=get();return (e?.shadowRoot||e)?.querySelector(selector);});},async count(){return get()?1:0;},async textContent(){return get()?.textContent;},async isDisabled(){return !!get()?.disabled;}};}
module.exports={chromium:{async launch(){return {async newPage(){let dom,clock,html;return {
 clock:{async install(){},async runFor(ms){await clock.tickAsync(ms);}},
 async route(url,callback){await callback({fulfill(args){html=args.body;}});},
 async goto(url){dom=new JSDOM(html,{url,runScripts:'dangerously',pretendToBeVisual:true});const w=dom.window;w.Element.prototype.getClientRects=function(){for(let n=this;n instanceof w.Element;n=n.parentElement){if(w.getComputedStyle(n).display==='none')return [];}return this.isConnected?[{}]:[];};clock=FakeTimers.withGlobal(w).install({toFake:['Date','setTimeout','clearTimeout']});},
 async evaluate(fn,arg){return typeof fn==='string'?dom.window.eval(fn):dom.window.eval('('+fn.toString()+')')(arg);},
 locator(selector){return wrapper(()=>dom.window.document.querySelector(selector));},url(){return dom.window.location.href;},async close(){clock.uninstall();dom.window.close();}
 };},async close(){}};}}};
