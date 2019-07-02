
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

            // if (gameContex.blockAmount <= 0) {
            //     console.log("finish");
            //     this.scheduler.pause();

            //     return;
            // }

            // if (gameContex.ballCutAmount <= 0) {
            //     console.log("lose");
                
            //     //test restart
            //     GameService.SpawnIdleBall(this.world, gameContex, this.world.getConfigData(GameReferences).platformEntity);
            //     return;
            // }

            if (ut.Runtime.Input.getMouseButtonUp(0)) {
                this.world.forEach([ut.Entity, IdleBall], (entity, idleBall) => {
                    let wPos = ut.Core2D.TransformService.computeWorldPosition(this.world, entity);

                    let transformNode = new ut.Core2D.TransformNode();

                    let transofrmPos = this.world.getComponentData(entity, ut.Core2D.TransformLocalPosition);

                    let movement = this.world.getComponentData(entity, Movement);

                    this.world.setComponentData(entity, transformNode);

                    transofrmPos.position = wPos;

                    this.world.setComponentData(entity, transofrmPos);

                    movement.dir = new Vector3(0, 1, 0);

                    this.world.setComponentData(entity, movement);

                    this.world.removeComponent(entity, IdleBall);
                });
            }
        }
    }
}
