namespace BB {
    export interface ISound {
        PlaySoundHit():void;
        PlaySoundReceiveProp():void;
        PlaySoundUI():void;
    }

    export class SoundProxy {
        public static soundImp : ISound;
 
        static PlaySoundHit(): void {
            SoundProxy.soundImp.PlaySoundHit();
        };

        static PlaySoundReceiveProp(): void {
            SoundProxy.soundImp.PlaySoundReceiveProp();
        };

        static PlaySoundUI() : void {
            SoundProxy.soundImp.PlaySoundUI();
        }
    }

    export class InternalSound implements ISound {
        PlaySoundHit(): void {
            // console.log("InternalSound::PlayHitSound()");
        };        
        
        PlaySoundReceiveProp(): void {
            // console.log("InternalSound::PlayPropSound()");
        };

        PlaySoundUI() : void {
            console.log("InternalSound::PlaySoundUI()");
        }
    }
}