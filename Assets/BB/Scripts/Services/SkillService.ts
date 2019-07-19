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

                     break;
            }
        }

        static ExpandPlatform(world:ut.World, gameContex:GameContext) : void {
            let platform =  world.getConfigData(GameReferences).platformEntity;

            // let sprite2DRenderer = 
        }

        static SplitBall(world:ut.World, gameContex:GameContext) : void {
            let rRange = new ut.Math.Range(1, 359);

            world.forEach([ut.Core2D.TransformLocalPosition, Ball],(transformPos, ball)=>{
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