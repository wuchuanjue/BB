
namespace BB {
    @ut.executeAfter(ut.HitBox2D.HitBox2DSystem)
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

                    for (let i = 0; i < overlaps.length; i++) {

                        let target = overlaps[i].otherEntity;

                        if (!this.world.exists(target))
                            return;

                        if (ball.preHitEntity == target.index) {
                            return;
                        }

                        if(i == 0)
                            ball.preHitEntity = target.index;
 
                        let movement = this.world.getComponentData(ballEntity, BB.Movement);

                        let ballHitBox = this.world.getComponentData(ballEntity, ut.HitBox2D.RectHitBox2D);

                        if (i == 0 && this.world.hasComponent(target, BB.Border)) {
                            let border = this.world.getComponentData(target, BB.Border);

                            if (border.Dir == 2) {
                                //lose ball; 
                                GameService.LoseBall(this.world, ballEntity, gameContex);

                                return;
                            }

                            hitSound = "border";

                            if (border.Dir == 4 || border.Dir == 6)
                                movement.dir.x = -movement.dir.x;
                            else if (border.Dir == 2 || border.Dir == 8)
                                movement.dir.y = -movement.dir.y;

                            // console.log(`hit border. hit area:${hitArea}`);
                        }
                        else if (this.world.hasComponent(target, Block)) {
                            let blockTransformPos = this.world.getComponentData(target, ut.Core2D.TransformLocalPosition);

                            if(i == 0) {
                                hitSound = "block";
    
                                let blockTransScale = this.world.getComponentData(target, ut.Core2D.TransformLocalScale);
    
                                let hitPoint = this.AjduestHitPos(ballTrans.position, ballHitBox.box as ut.Math.Rect, movement.dir
                                    , new ut.Math.Rect(blockTransformPos.position.x, blockTransformPos.position.y, blockTransScale.scale.x + 0.01, blockTransScale.scale.y + 0.01)
                                );
    
                                let areaLocks = this.world.getComponentData(target, AreaLocks);
    
                                let hitArea = this.CalcBlockHitArea(blockTransformPos.position, blockTransScale.scale, hitPoint, areaLocks);
     
                                if (hitArea == 4 || hitArea == 6)
                                    movement.dir.x = -movement.dir.x;
                                else if (hitArea == 2 || hitArea == 8)
                                    movement.dir.y = -movement.dir.y;
                                else 
                                    movement.dir = movement.dir.multiplyScalar(-1);
                            }
                            
                            DamageService.AtkBlock(target, blockTransformPos.position, ball, this.world, gameContex);
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

                        BallService.UpdateHitRectByMoment(ballHitBox, movement);

                        this.world.setComponentData(ballEntity, ballHitBox);

                        this.world.setComponentData(ballEntity, movement);
                    }
                });


            if (hitSound != "none") {
                SoundService.PlaySound(this.world, this.world.getConfigData(GameReferences).hitBlockAudioEntity);
            }

            this.ForeachPropHit(gameContex);

            this.world.setConfigData(gameContex);
        }

        private ForeachPropHit(gameContex: GameContext): void {
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
 
        private CalcBlockHitArea(blockPos: Vector3, blockSize: Vector3, checkPos: Vector3, areaLocks: AreaLocks): number {
            let isLeft = checkPos.x <= blockPos.x;

            let isBottom = checkPos.y <= blockPos.y;

            if (isLeft && isBottom) {
                //lb
                if (areaLocks.lock2)
                    return 4;
                else
                    return 2;
            }

            if (isLeft && !isBottom) {
                //lt
                if (areaLocks.lock4)
                    return 8;
                else
                    return 4;
            }

            if (!isLeft && !isBottom) {
                //rt
                return areaLocks.lock8 ? 6 : 8;
            }

            //rb
            return areaLocks.lock6 ? 2 : 6;
        }

        private AjduestHitPos(ballPos: Vector3, ballHitBoxRect: ut.Math.Rect, hitDIr: Vector3, blockRect: ut.Math.Rect): Vector3 {
            let halfBallSize = ballHitBoxRect.width * 0.5;

            let checkPoints = new Array<Vector3>();

            //ballHitBoxRect 左下角原点
            let ballHitBoxPos = new Vector3(ballPos.x + ballHitBoxRect.x + halfBallSize, ballPos.y + ballHitBoxRect.y + halfBallSize);

            checkPoints.push(new Vector3(ballHitBoxPos.x - halfBallSize, ballHitBoxPos.y - halfBallSize));

            checkPoints.push(new Vector3(ballHitBoxPos.x - halfBallSize, ballHitBoxPos.y + halfBallSize));

            checkPoints.push(new Vector3(ballHitBoxPos.x + halfBallSize, ballHitBoxPos.y + halfBallSize));

            checkPoints.push(new Vector3(ballHitBoxPos.x + halfBallSize, ballHitBoxPos.y - halfBallSize));

            let stepOffset = hitDIr.clone().multiplyScalar(-0.01);

            let resCheckPoint = new Vector3(ballPos.x, ballPos.y);

            let stepAmount = -2;

            // CoreUtils.ClearDebugPoints(this.world);

            // CoreUtils.DrawDebugPoint(this.world, checkPoints[0], new ut.Core2D.Color(0,0,0,1));
            // CoreUtils.DrawDebugPoint(this.world, checkPoints[1], new ut.Core2D.Color(0,0,0,1));
            // CoreUtils.DrawDebugPoint(this.world, checkPoints[2], new ut.Core2D.Color(0,0,0,1));
            // CoreUtils.DrawDebugPoint(this.world, checkPoints[3], new ut.Core2D.Color(0,0,0,1));

            // CoreUtils.DrawDebugPoint(this.world, new Vector3(ballHitBoxPos.x, ballHitBoxPos.y, 0), new ut.Core2D.Color(0,0,0,1));

            while (checkPoints.length > 0) {
                for (let i = checkPoints.length - 1; i >= 0; i--) {
                    let point = checkPoints[i];

                    if (!CoreUtils.isPointInRect(point, blockRect)) {
                        checkPoints.splice(i, 1);

                        continue;
                    }

                    point.add(stepOffset);

                    resCheckPoint.x = point.x;

                    resCheckPoint.y = point.y;
                }

                //默认一定会有一个point在范围内
                stepAmount++;
            }

            // console.log(`-----stepAmount:${stepAmount}`);

            //球位置调整逻辑待整理
            // ballPos.addScaledVector(stepOffset, stepAmount);

            // CoreUtils.DrawDebugPoint(this.world, resCheckPoint, new ut.Core2D.Color(1,0,0,1));

            return resCheckPoint;
        }
    }
}


