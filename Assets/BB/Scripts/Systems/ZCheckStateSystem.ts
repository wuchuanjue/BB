
namespace BB {
        
    /** 命名前加Z是为了临时解决HitSystem使用前未定义的问题。 原因待查 */
    @ut.executeAfter(HitSystem)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class ZCheckStateSystem extends ut.ComponentSystem {
 
        OnUpdate(): void {
            let gameContex = this.world.getConfigData(GameContext);
 
            if (gameContex.state != GameState.Play) {
                return;
            }

            if (gameContex.blockAmount <= 0) {
                let result = new GameResult();

                result.passLevel = true;

                let platform = this.world.getConfigData(GameReferences).platformEntity;

                this.world.setOrAddComponentData(platform, result);

                GameService.SendStateCmd(this.world, GameState.LevelFinish);

                return; 
            } 

            if (gameContex.ballCutAmount <= 0) {

                gameContex.cutLife -= 1;

                if(gameContex.cutLife > 0) {
                    EntityManagerService.SpawnIdleBall(this.world, gameContex, this.world.getConfigData(GameReferences).platformEntity);
                    
                    EntityManagerService.ClearProps(this.world);
                }
                else {
                    //lose
                    let result = new GameResult();

                    result.passLevel = false;

                    let configEntity = this.world.getConfigData(GameReferences).platformEntity;     //this.world.getConfigEntity();

                    this.world.setOrAddComponentData(configEntity, result);

                    GameService.SendStateCmd(this.world, GameState.LevelFinish);
                }

                this.world.setConfigData(gameContex);
 
                return;
            }

            if (!gameContex.uiTouchOver && ut.Runtime.Input.getMouseButtonUp(0)) {
                this.world.forEach([ut.Entity, IdleBall], (entity, idleBall) => {
                    GameService.ShootBall(this.world, entity);

                    this.world.removeComponent(entity, IdleBall);
                });
            }
        }
    }
}
