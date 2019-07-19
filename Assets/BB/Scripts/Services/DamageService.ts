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
                DamageService.CheckSpawnProp(world, block, blockPos,gameContex);

                BlockService.AddAroundBlockCollision(world, block);

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

        static CheckSpawnProp(world:ut.World,block:Block, spawnPos:Vector3, gameContex:GameContext) : void {
            if(gameContex.propAmount > 6) 
                return;

            let timePass = Time.time() - gameContex.propTimeFlagSec;
            
            //间隔时间不能太短
            if(timePass < 1)
                return;

            let randomSeed = Math.random();

            let propType = PropType.none;

            let weightOfPropAmount = 0.5 + (gameContex.propAmount / 6) * 0.5;     

            let weightOfTimeFlag = 0.2 + Math.max((1 - (timePass / 8)) * 0.8, 0);
 
            // console.log(`randomSeed0:${randomSeed}  prop amount:${gameContex.propAmount}  timePass:${timePass}`);
            
            randomSeed *= weightOfPropAmount * weightOfTimeFlag;

            // console.log(`randomSeed1:${randomSeed}   weightOfPropAmount:${weightOfPropAmount}   weightOfTimeFlag：${weightOfTimeFlag}`);
 
            if(randomSeed <= 0.02) {
                propType = PropType.shoot3;  
            }
            else if(randomSeed <= 0.04) {
                propType = PropType.split;
            }
            else if(false && randomSeed < 0.07) {
                propType = PropType.expand;         //TODO
            }
   
            if(propType == PropType.none)
                return;

            gameContex.propTimeFlagSec = Time.time();

            EntityManagerService.SpawnProp(world, gameContex,propType, spawnPos);
        }
    }
}