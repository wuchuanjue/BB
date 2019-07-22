namespace BB {
    export class SkillServices {
        static TriggerSkillFromProp(world: ut.World, prop: Prop, gameContext: GameContext): void {
            switch (prop.type) {
                case PropType.split:
                    SkillServices.SplitBall(world, gameContext);
                    break;
                case PropType.shoot3:
                    SkillServices.ShootThreeBall(world, gameContext);
                    break;
                 case PropType.expand:
                     SkillServices.ExpandPlatform(world, gameContext);
                     break;
            }
        }

        static ExpandPlatform(world:ut.World, gameContex:GameContext) : void {
            console.log("ExpandPlatform");

            let platform =  world.getConfigData(GameReferences).platformEntity;

            let startSize = world.getComponentData(platform, ut.Core2D.Sprite2DRendererOptions).size;
            let endSize = new Vector2(startSize.x + 0.1, startSize.y);

            let tween = new ut.Tweens.TweenDesc;
            tween.cid = ut.Core2D.Sprite2DRendererOptions.cid;
            tween.offset = 0;
            tween.duration = 0.2;
            tween.func = ut.Tweens.TweenFunc.Linear;
            tween.loop = ut.Core2D.LoopMode.Once;
            tween.destroyWhenDone = true;
            tween.t = 0.0;

            ut.Tweens.TweenService.addTweenVector2(world, platform,startSize, endSize , tween);

            let touchMovement = world.getComponentData(platform, TouchMovement);

            touchMovement.size = new Vector2(endSize.x + touchMovement.size.y);
        }
 
        static SplitBall(world:ut.World, gameContex:GameContext) : void {
            let rRange = new ut.Math.Range(1, 359);

            world.forEach([ut.Core2D.TransformLocalPosition, Ball],(transformPos, ball)=>{
                if(gameContex.ballCutAmount >= gameContex.ballMaxAmount)
                    return;

                EntityManagerService.SpawnBall(world, gameContex, transformPos.position, EntityManagerService.GenRandomDir(rRange));

                EntityManagerService.SpawnBall(world, gameContex, transformPos.position, EntityManagerService.GenRandomDir(rRange));
                
                EntityManagerService.SpawnBall(world, gameContex, transformPos.position, EntityManagerService.GenRandomDir(rRange));
            });
        }

        static ShootThreeBall(world:ut.World, gameContex:GameContext) : void {
            let platform =  world.getConfigData(GameReferences).platformEntity;

            let targetPos:Vector3 = world.getComponentData(platform, ut.Core2D.TransformLocalPosition).position;

            targetPos.add(new Vector3(0,0.2,0));

            let rRange = new ut.Math.Range(5, 15);
 
            EntityManagerService.SpawnBall(world, gameContex, targetPos, EntityManagerService.GenRandomDir(rRange));

            rRange = new ut.Math.Range(-15, -5);
            
            EntityManagerService.SpawnBall(world, gameContex, targetPos, EntityManagerService.GenRandomDir(rRange));

            EntityManagerService.SpawnBall(world, gameContex, targetPos, new Vector3(0,1,0));
        }
    }
}