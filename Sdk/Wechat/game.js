import './js/libs/weapp-adapter'
import './js/libs/symbol'
import SoundForWechat from './js/SoundForWechat.js'
 
// Fix window.performance.now
((window) => {
  if (typeof window.performance === 'object' && typeof window.performance.now === 'function') {
    const __window_performance_now = window.performance.now;
    window.performance.now = () => {
      return __window_performance_now() * 1000;
    }
  }
})(window || {});

if(!console.assert) {
  console.assert = function(c,m){
    if(!c) {
      console.log(m);
    }
  }
}

window.sound = new SoundForWechat();

import ut from './js/TestGame.js'
  
import BB from './js/TestGame.js'
 

ut._HTML.main();
 
 

