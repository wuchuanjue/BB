
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
 
            this.world.forEach([TestMsgDisplay, ut.Text.Text2DRenderer],(msgDisplay, textRenderer)=>{
                if(msgDisplay.key == "amount") {
                    textRenderer.text = `ball:${gameContex.ballCutAmount}   block:${gameContex.blockAmount}`;
                }
            });

            if (gameContex.blockAmount <= 0) {
                 
                gameContex.state = GameState.PassLevel;

                this.world.setConfigData(gameContex);

                return; 
            } 

            if (gameContex.ballCutAmount <= 0) {
                gameContex.life -= 1;

                if(gameContex.life > 0) {
                    EntityManagerService.SpawnIdleBall(this.world, gameContex, this.world.getConfigData(GameReferences).platformEntity);
                    
                    EntityManagerService.ClearProps(this.world);
                }
                else {
                    gameContex.state = GameState.GameOver;
                }

                this.world.setConfigData(gameContex);

                return;
            }

            if (ut.Runtime.Input.getMouseButtonUp(0)) {
                this.world.forEach([ut.Entity, IdleBall], (entity, idleBall) => {
                    GameService.ShootBall(this.world, entity);

                    this.world.removeComponent(entity, IdleBall);
                });
            }
        }
    }
}
