namespace BB {
    export class SkillServices {
        static IncreasBall(world:ut.World, gameContex:GameContext) : void {
            if(gameContex.ballCutAmount >= gameContex.ballMaxAmount)
                return;

            let rRange = new ut.Math.Range(0, 360);

            world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, Ball],(ballEntity, transformPos, ball)=>{
                GameService.SpawnBall(world, gameContex, transformPos.position, GameService.GenRandomDir(rRange));
                
                GameService.SpawnBall(world, gameContex, transformPos.position, GameService.GenRandomDir(rRange));
            });
        }
    }
}