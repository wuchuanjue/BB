
namespace BB {

    @ut.executeAfter(ut.Shared.UserCodeStart)
    @ut.executeAfter(ut.HitBox2D.HitBox2DSystem)
    @ut.executeBefore(CheckStateSystem)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class HitSystem extends ut.ComponentSystem {

        // OnUpdate(): void {
        //     if (!GameService.IsGameState(this.world, GameState.Play))
        //         return;

        //     let gameContex = this.world.getConfigData(GameContext);

        //     if (gameContex.state != GameState.Play)
        //         return;

        //     let cameraEntity = GameService.GetMainCameraEntity();

        //     this.world.forEach([ut.Entity, Ball, ut.Core2D.TransformLocalPosition], (ballEntity, ball, transformPos) => {

        //         if(this.world.hasComponent(ballEntity, ut.HitBox2D.RectHitBox2D))
        //             this.world.removeComponent(ballEntity, ut.HitBox2D.RectHitBox2D);

        //         let movement = this.world.getComponentData(ballEntity, BB.Movement);

        //         ut.HitBox2D.HitBox2DService.rayCast(this.world, movement.prePos, transformPos.position, cameraEntity);

        //         let hitRayCast = ut.HitBox2D.HitBox2DService.rayCast(this.world, movement.prePos, transformPos.position, cameraEntity);

        //         if (hitRayCast.entityHit == null || hitRayCast.entityHit.isNone()) {

        //             return;
        //         }

        //         if (!this.world.exists(hitRayCast.entityHit))
        //             return;

        //         let targetEntity = hitRayCast.entityHit;

        //         // console.log(`hit entity 1 name: ${this.world.getEntityName(targetEntity)}  index:${targetEntity.index}`);
 
        //         if (ball.preHitEntity == targetEntity.index) {
        //             //碰撞到同一个物体
        //             return;
        //         }

        //         // console.log(`hit entity 1: ${targetEntityName}`);

        //         ball.preHitEntity = targetEntity.index;

        //         let hitArea = 5;

        //         let hitPos = new Vector3();

        //         hitPos.subVectors(transformPos.position, movement.prePos).multiplyScalar(hitRayCast.t).add(movement.prePos);
 
        //         if (this.world.hasComponent(hitRayCast.entityHit, BB.Block)) {
        //             let block = this.world.getComponentData(hitRayCast.entityHit, BB.Block);

        //             // DamageService.AtkBlock(hitRayCast.entityHit, ball, this.world);
        //         }
        //         else if (this.world.hasComponent(hitRayCast.entityHit, BB.Border)) {
        //             let border = this.world.getComponentData(hitRayCast.entityHit, BB.Border);

        //             hitArea = border.Dir;
        //         }

        //         movement.prePos = transformPos.position = hitPos;

        //         if (hitArea == 4 || hitArea == 6)
        //             movement.dir.x = -movement.dir.x;
        //         else
        //             movement.dir.y = -movement.dir.y;

        //         this.world.setComponentData(ballEntity, movement);

        //         // this.scheduler.pause();
        //     });
        // }

        OnUpdate(): void {
            let gameContex = this.world.getConfigData(GameContext);

            if (gameContex.state != GameState.Play)
                return;

            let hitSound = "none";

            this.world.forEach([ut.Entity, ut.HitBox2D.HitBoxOverlapResults, ut.Core2D.TransformLocalPosition, Ball]
                , (ballEntity, overlapResults, ballTrans, ball) => {

                    let overlaps = overlapResults.overlaps;

                    if (overlaps.length == 0)
                        return;

                    let target = overlaps[0].otherEntity;

                    if (!this.world.exists(target))
                        return;

                    // console.log(`ball pre hit:${ball.preHitEntity}  cut hit:${target.index} 
                    // cut hit name:${this.world.getEntityName(target)}`);

                    if (ball.preHitEntity == target.index) {
                        return;
                    }

                    ball.preHitEntity = target.index;

                    let hitArea = 5;

                    let movement = this.world.getComponentData(ballEntity, BB.Movement);
 
                    if (this.world.hasComponent(target, BB.Border)) {
                        let border = this.world.getComponentData(target, BB.Border);
 
                        // if (border.Dir == 2) {
                        //     //lose ball; 
                        //     GameService.LoseBall(this.world, ballEntity, gameContex);

                        //     return;
                        // }

                        hitArea = border.Dir;

                        hitSound = "border";

                        console.log(`hit border. hit area:${hitArea}`);
                    }
                    else if (this.world.hasComponent(target, Block)) {
                        hitSound = "block";

                        let blockTransformPos = this.world.getComponentData(target, ut.Core2D.TransformLocalPosition);
                        let blockTransScale = this.world.getComponentData(target, ut.Core2D.TransformLocalScale);

                        hitArea = this.CalcBlockHitInfo(blockTransformPos.position.clone(), ballTrans.position.clone(), movement.dir.clone());

                        // console.log(`hit block. hit area:${hitArea}`);

                        //TODO debug go on.
                        if(hitArea == 4 || hitArea == 6) {
                            let ballPos = ballTrans.position;
 
                            let testPoint = this.AjduestHitPos(ballPos, movement.dir
                                ,new ut.Math.Rect(blockTransformPos.position.x, blockTransformPos.position.y,blockTransScale.scale.x + 0.01,blockTransScale.scale.y + 0.01));

                            ballTrans.position = ballPos;  

                            BlockService.TestMarkBlock(this.world,target, true);
                            
                            this.scheduler.pause();
                        }
                        else {
                            DamageService.AtkBlock(target, blockTransformPos.position, ball, this.world, gameContex);
                        }
                    }
                    else if (this.world.hasComponent(target, Platform)) {
                        let upDir = new Vector3(0, 1, 0);

                        let platformTransformPos = this.world.getComponentData(target, ut.Core2D.TransformLocalPosition);

                        let platformSpriteOptions = this.world.getComponentData(target, ut.Core2D.Sprite2DRendererOptions);

                        let hitOffset = ballTrans.position.x - platformTransformPos.position.x;

                        //角度范围140  
                        let angle = hitOffset / (platformSpriteOptions.size.x * 0.5) * 60;

                        angle = -angle;

                        movement.dir = upDir.applyAxisAngle(new Vector3(0, 0, 1), Math.PI / 180 * angle).normalize();

                        hitSound = "platform";
                    }

                    if (hitArea == 4 || hitArea == 6)
                        movement.dir.x = -movement.dir.x;
                    else if (hitArea == 2 || hitArea == 8)
                        movement.dir.y = -movement.dir.y;

                    this.world.setComponentData(ballEntity, movement);
                });


            if (hitSound != "none") {
                SoundService.PlaySound(this.world, this.world.getConfigData(GameReferences).hitBlockAudioEntity);
            }

            this.ForeachPropHit(gameContex);

            this.world.setConfigData(gameContex);
        }

        private ForeachPropHit(gameContex: GameContext) : void {
            this.world.forEach([ut.Entity, Prop, ut.HitBox2D.HitBoxOverlapResults], (propEntity, prop, overlapResults) => {
                let overlaps = overlapResults.overlaps;

                if (overlaps.length == 0)
                    return;

                let target = overlaps[0].otherEntity;

                if (!this.world.exists(target))
                    return;
                
                if (this.world.hasComponent(target, Platform)) {

                    this.world.addComponent(propEntity, Dying);

                    GameService.ReceiveProp(this.world, prop, gameContex);
                    
                    SoundService.PlaySound(this.world, this.world.getConfigData(GameReferences).receivePropAudioEntity);

                    this.world.destroyEntity(propEntity);
                }
                else if (this.world.hasComponent(target, Border)) {
                    let border = this.world.getComponentData(target, Border);

                    if (border.Dir == 2) {
                        this.world.destroyEntity(propEntity);
                    }
                }
            });
        }

        /**
         * 直接返回上一个位置
         * @param blockPos 
         * @param ballPos 
         * @param ballDirection 
         */
        private CalcBlockHitInfo(blockPos: Vector3, ballPos: Vector3, ballDirection: Vector3): number {
            // let res = new Vector3();
            //ballPos.sub(ballDirection.multiplyScalar(5));

            let blockToballDir = ballPos.sub(blockPos).normalize();

            let upDir = new Vector3(0, 1, 0);

            let isLeft = blockToballDir.x < 0;

            //改成dot了事
            let angle = blockToballDir.angleTo(upDir) / (Math.PI / 180);

            let hitArea = 5;

            if (Math.abs(angle) < 45)
                hitArea = 8;
            else if (Math.abs(angle) > 135)
                hitArea = 2;
            else if (isLeft)
                hitArea = 4;
            else
                hitArea = 6;

            return hitArea;
        }

        private AjduestHitPos(ballPos:Vector3, hitDIr: Vector3 , rect:ut.Math.Rect) : Vector3 {
            //ball size 0.3 * 0.5
            let halfBallSize = 0.075;
            let checkPoints = new Array<Vector3>();
            checkPoints.push(new Vector3(ballPos.x - halfBallSize, ballPos.y - halfBallSize));

            checkPoints.push(new Vector3(ballPos.x - halfBallSize, ballPos.y + halfBallSize));       
 
            checkPoints.push(new Vector3(ballPos.x + halfBallSize, ballPos.y + halfBallSize));    
            
            checkPoints.push(new Vector3(ballPos.x + halfBallSize, ballPos.y - halfBallSize));
            
            let stepOffset = hitDIr.clone().multiplyScalar(-0.01);

            let resCheckPoint = new Vector3();

            let stepAmount = -2;

            CoreUtils.DrawDebugPoint(this.world, ballPos, new ut.Core2D.Color(0,0,0,1));
 
            while(checkPoints.length > 0) {
                for(let i = checkPoints.length - 1; i >= 0; i--) {
                    let point = checkPoints[i];

                    if(!CoreUtils.isPointInRect(point, rect)) {
                        checkPoints.splice(i,1);
                        
                        continue;
                    }
    
                    resCheckPoint.x = point.x;

                    resCheckPoint.y = point.y;
 
                    point.add(stepOffset);
                }

                //默认一定会有一个point在范围内
                stepAmount ++;  
            }

            ballPos.addScaledVector(stepOffset, stepAmount);
            
            CoreUtils.DrawDebugPoint(this.world, resCheckPoint, new ut.Core2D.Color(1,0,0,1));

            return resCheckPoint;
        }
    }
}


