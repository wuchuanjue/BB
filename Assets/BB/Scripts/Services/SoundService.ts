namespace BB {
    

    export class SoundService {
        static PlaySoundHit() : void {
            // window
            
        }

        static PlaySoundReceiveProp() : void {

        }

        static PlaySound(world:ut.World, entity:ut.Entity) {
            // console.log("play sound1");

            if (!world.hasComponent(entity, ut.Audio.AudioSourceStart)) {
                // console.log("play sound2");

                world.addComponent(entity, ut.Audio.AudioSourceStart);
            }
        }
    }
}