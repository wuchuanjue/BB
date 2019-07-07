
namespace BB {

    /** MovementSystem */
    @ut.executeBefore(ut.HitBox2D.HitBox2DSystem)
    @ut.executeAfter(GameSystem)
    export class MovementSystem extends ut.ComponentSystem {
        
        OnUpdate():void {
            if(!GameService.IsGameState(this.world, GameState.Play))
                return;

            let dt = this.scheduler.deltaTime();

            dt = Math.min(0.02, dt);
 
            this.world.forEach([ut.Entity, BB.Movement, ut.Core2D.TransformLocalPosition] , (entity, movement, localPos)=>{
                if(movement.speed == 0)
                    return;

                let move = movement.dir.multiplyScalar(movement.speed * dt);
                
                localPos.position = localPos.position.add(move);

                // if(this.world.hasComponent(entity, Ball)) {
                //     CoreUtils.DrawDebugPoint(this.world, localPos.position, new ut.Core2D.Color(1,1,0,1));
                // }
            });
        }
    }
}
