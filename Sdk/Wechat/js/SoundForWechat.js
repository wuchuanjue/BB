export default class SoundForWechat {
  hitSounds;
  propSound;
  uiSound;
  hitSoundPointer;

  constructor(){
    this.hitSounds = [];
    this.hitSoundPointer = 0;

    for(let i = 0; i < 3; i++) 
    {
      this.hitSounds[i] = new Audio();
      this.hitSounds[i].src = "Assets/pi40.wav";
    }
     
    this.propSound = new Audio();
    this.propSound.src = "Assets/power21.wav";

    this.uiSound = new Audio();
    this.uiSound.src = "Assets/click.wav";

  }

  PlaySoundHit() {
    let hitSound = this.hitSounds[this.hitSoundPointer];

    hitSound.currentTime = 0;
 
    hitSound.play();

    this.hitSoundPointer ++;

    this.hitSoundPointer %= this.hitSounds.length;

    // console.log("SoundForWechat::PlaySoundHit()");
  }
 
  PlaySoundReceiveProp() {
    this.propSound.currentTime = 0;
    this.propSound.play();

    // console.log("SoundForWechat::PlaySoundReceiveProp()");
  }

  PlaySoundUI() {
    this.uiSound.currentTime = 0;
    this.uiSound.play();
  }
}