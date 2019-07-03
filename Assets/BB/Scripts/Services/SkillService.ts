namespace BB {
    export class SkillServices {
        static SplitBall(world:ut.World, gameContex:GameContext) : void {
            if(gameContex.ballCutAmount >= gameContex.ballMaxAmount)
                return;

            let rRange = new ut.Math.Range(0, 360);

            world.forEach([ut.Core2D.TransformLocalPosition, Ball],(transformPos, ball)=>{
                GameService.SpawnBall(world, gameContex, transformPos.position, GameService.GenRandomDir(rRange));
                
                GameService.SpawnBall(world, gameContex, transformPos.position, GameService.GenRandomDir(rRange));
            });
        }

        static ShootThreeBall(world:ut.World, gameContex:GameContext) : void {
            let targetPos:Vector3;

            world.forEach([ut.Core2D.TransformLocalPosition, Platform],(transformPos, platform)=>{
                targetPos = transformPos.position;
            });           

            targetPos.add(new Vector3(0,0.2,0));

            let rRange = new ut.Math.Range(5, 15);

            GameService.SpawnBall(world, gameContex, targetPos, GameService.GenRandomDir(rRange));

            rRange = new ut.Math.Range(-15, -5);
            
            GameService.SpawnBall(world, gameContex, targetPos, GameService.GenRandomDir(rRange));

            GameService.SpawnBall(world, gameContex, targetPos, new Vector3(0,1,0));
        }
    }
}