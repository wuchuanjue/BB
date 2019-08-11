namespace BB {

    export class SoundService{

        static Init() : void {
            SoundProxy.soundImp = window[`sound`] ? window[`sound`] : new InternalSound(); 
        }

        static PlaySoundHit() : void {
            SoundProxy.PlaySoundHit();
        }

        static PlaySoundReceiveProp() : void {
            SoundProxy.PlaySoundReceiveProp();
        }

        static PlaySoundUI() : void {
            SoundProxy.PlaySoundUI();
        }
    }
}