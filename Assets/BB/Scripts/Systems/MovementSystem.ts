
namespace BB {

    /** MovementSystem */
    @ut.executeAfter(ut.Shared.UserCodeStart)
    @ut.executeAfter(GameSystem)
    @ut.executeBefore(HitSystem)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class MovementSystem extends ut.ComponentSystem {
        
        OnUpdate():void {
            if(!GameService.IsGameState(this.world, GameState.Play))
                return;

            let dt = this.scheduler.deltaTime();

            dt = Math.min(0.02, dt);
 
            this.world.forEach([BB.Movement, ut.Core2D.TransformLocalPosition] , (movement, localPos)=>{
                if(movement.speed == 0)
                    return;

                let move = movement.dir.multiplyScalar(movement.speed * dt);
                
                localPos.position = localPos.position.add(move);

                CoreUtils.DrawDebugPoint(this.world, localPos.position, new ut.Core2D.Color(1,1,0,1));
            });
        }
    }
}
