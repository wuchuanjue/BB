
namespace BB {

    /** New System */
    @ut.executeAfter(ut.Shared.UserCodeStart)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class CheckStateSystem extends ut.ComponentSystem {

        OnUpdate(): void {
            let gameContex = this.world.getConfigData(GameContext);

            if (gameContex.state != GameState.Play) {
                return;
            }
            
            this.world.forEach([TestMsgDisplay, ut.Text.Text2DRenderer],(msgDisplay, textRenderer)=>{
                if(msgDisplay.key == "amount") {
                    textRenderer.text = `ball:${gameContex.ballCutAmount}   block:${gameContex.blockAmount}`;
                    
                    //console.log(`gameContex.ballCutAmount:${gameContex.ballCutAmount}  gameContex.blockAmount:${gameContex.blockAmount}`);
                }
            });

            if (gameContex.blockAmount <= 0) {
                console.log("finish");
                
                // gameContex.state = GameState.PassLevel;

                return;
            } 

            if (gameContex.ballCutAmount <= 0) {
                gameContex.life -= 1;

                if(gameContex.life > 0) {
                    GameService.SpawnIdleBall(this.world, gameContex, this.world.getConfigData(GameReferences).platformEntity);
                    
                    GameService.DestroyAllProps(this.world);
                }
                else {
                    gameContex.state = GameState.GameOver;

                    console.log("game over");
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
