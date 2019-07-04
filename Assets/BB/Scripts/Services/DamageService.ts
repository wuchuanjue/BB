namespace BB {
    export class DamageService {
        static CalcBlockCollisionDirection(ballPos:Vector3, blockPos:Vector3) : number {
            return 0;
        }

        static AtkBlock(blockEntity: ut.Entity, blockPos: Vector3 , ball:BB.Ball, world:ut.World, gameContex:GameContext) : void {
            let block = world.getComponentData(blockEntity, BB.Block);
 
            if(block.blockConfig.isWall)   
                return; 
 
            block.life = block.life - 1; 
  
            world.setComponentData(blockEntity, block);
 
            if(block.life <= 0) {
                DamageService.CheckSpawnProp(world, block, blockPos);

                BlockService.OpenBlockCollisionAroundBlock(world, block);

                world.destroyEntity(blockEntity); 

                gameContex.blockAmount -= 1;
            }
            else {
                let renderer = world.getComponentData(blockEntity, ut.Core2D.Sprite2DRenderer);
                renderer.color =  new ut.Core2D.Color(Math.random(),Math.random(),1,1);

                world.setComponentData(blockEntity, renderer); 
            }
        }

        static BallLose(ballEnity: ut.Entity, world:ut.World) : void {
            world.destroyEntity(ballEnity);
        }

        static CheckSpawnProp(world:ut.World,block:Block, spawnPos:Vector3) : void {
            let randomSeed = Math.random();

            let propType = PropType.none;

            if(randomSeed <= 0.01) {
                propType = PropType.expand;
            }
            else if(randomSeed > 0.01 && randomSeed <= 0.04) {
                propType = PropType.shoot3;
            }
  
            if(propType == PropType.none)
                return;

            let gameContex = world.getConfigData(GameContext);

            GameService.SpawnProp(world, gameContex,propType, spawnPos);
        }
    }
}