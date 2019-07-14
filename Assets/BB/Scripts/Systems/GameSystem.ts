
namespace BB {

    @ut.executeBefore(ut.HitBox2D.HitBox2DSystem)
    export class GameSystem extends ut.ComponentSystem {

        OnUpdate(): void {
            let state = GameState.None;

            this.world.forEach([ut.Entity, StateChangeCmd],(entity, cmd)=>{
                state = cmd.stateWhat;
                
                this.world.removeComponent(entity, StateChangeCmd);
            });

            if(state != GameState.None) {
                let context = this.world.getConfigData(GameContext);

                GameService.EnterState(this.world, context, state);

                this.world.setConfigData(context);
            }
        }
    }
}


