
namespace BB {
    @ut.executeAfter(ut.HitBox2D.HitBox2DSystem)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class HitSystem extends ut.ComponentSystem {
        OnUpdate(): void {
            let gameContex = this.world.getConfigData(GameContext);

            if (gameContex.state != GameState.Play && gameContex.state != GameState.LevelFinish)
                return;

            this.ForeachBallHit(gameContex);

            this.ForeachPropHit(gameContex);

            this.world.setConfigData(gameContex);
        }

        private ForeachPropHit(gameContex: GameContext): void {
            // let propNeedRemove : Array<Entity>

            this.world.forEach([ut.Entity, Prop, ut.HitBox2D.HitBoxOverlapResults], (propEntity, prop, overlapResults) => {
                let overlaps = overlapResults.overlaps;

                if (overlaps.length == 0)
                    return;

                let target = overlaps[0].otherEntity;

                if (!this.world.exists(target))
                    return;

                let removeProp = false;

                if (this.world.hasComponent(target, Platform)) {
                    SkillServices.TriggerSkillFromProp(this.world, prop, gameContex);  

                    SoundService.PlaySoundReceiveProp();    //SoundService.PlaySound(this.world, this.world.getConfigData(GameReferences).receivePropAudioEntity);

                    removeProp = true;
                }
                else if (this.world.hasComponent(target, Border)) {
                    let border = this.world.getComponentData(target, Border);

                    if (border.Dir == 2) {
                        removeProp = true;
                    }
                }

                if(removeProp && this.world.exists(propEntity)) {
                    this.world.destroyEntity(propEntity);

                    if(gameContex.propAmount > 0)
                        gameContex.propAmount -= 1;
                }
            });
        }

        private ForeachBallHit(gameContex: GameContext) : void {
            let hitSound = false;

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
 
                        let movement = this.world.getComponentData(ballEntity, BB.Movement);

                        let ballHitBox = this.world.getComponentData(ballEntity, ut.HitBox2D.RectHitBox2D);

                        if (i == 0 && this.world.hasComponent(target, BB.Border)) {
                            ball.preHitEntity = target.index;

                            let border = this.world.getComponentData(target, BB.Border);

                            if (border.Dir == 2) {
                                //lose ball; 
                                GameService.LoseBall(this.world, ballEntity, gameContex);

                                return;
                            }

                            hitSound = true;

                            if (border.Dir == 4 || border.Dir == 6)
                                movement.dir.x = -movement.dir.x;
                            else if (border.Dir == 2 || border.Dir == 8)
                                movement.dir.y = -movement.dir.y;

                            // console.log(`hit border. hit area:${hitArea}`);
                        }
                        else if (this.world.hasComponent(target, Block)) {
                            let blockTransformPos = this.world.getComponentData(target, ut.Core2D.TransformLocalPosition);

                            if(i == 0) {
                                ball.preHitEntity = target.index;

                                hitSound = true;
    
                                let blockTransScale = this.world.getComponentData(target, ut.Core2D.TransformLocalScale);
    
                                let hitPoint = this.AjduestHitPos(ballTrans.position, ballHitBox.box as ut.Math.Rect, movement.dir
                                    , new ut.Math.Rect(blockTransformPos.position.x, blockTransformPos.position.y, blockTransScale.scale.x + 0.01, blockTransScale.scale.y + 0.01)
                                );
    
                                let areaLocks = this.world.getComponentData(target, AreaLocks);
    
                                let hitArea = this.CalcBlockHitArea(blockTransformPos.position, blockTransScale.scale, hitPoint, areaLocks);
     
                                // console.log(`hit block area:${hitArea}`);

                                // CoreUtils.DrawDebugPoint(this.world, hitPoint, new ut.Core2D.Color(1,0,0,1));

                                if (hitArea == 4 || hitArea == 6) {
                                    movement.dir.x = -movement.dir.x;
                                }
                                else if (hitArea == 2 || hitArea == 8)
                                    movement.dir.y = -movement.dir.y;
                                else 
                                    movement.dir = movement.dir.multiplyScalar(-1);
                            }
                            
                            DamageService.AtkBlock(target, blockTransformPos.position, ball, this.world, gameContex);
                        }
                        else if (this.world.hasComponent(target, Platform)) {
                            //Hit platform
                            ball.preHitEntity = target.index;

                            let upDir = new Vector3(0, 1, 0);

                            let platformTransformPos = this.world.getComponentData(target, ut.Core2D.TransformLocalPosition);
 
                            let hitOffset = ballTrans.position.x - platformTransformPos.position.x;

                            let platformWidth = this.world.hasComponent(target, ut.Core2D.Sprite2DRendererOptions) 
                                ? this.world.getComponentData(target, ut.Core2D.Sprite2DRendererOptions).size.x
                                : this.world.getComponentData(target, ut.Core2D.TransformLocalScale).scale.x;
 
                            //角度范围正负x
                            let angle = hitOffset / (platformWidth * 0.5) * 50;

                            angle = -angle;

                            movement.dir = upDir.applyAxisAngle(new Vector3(0, 0, 1), Math.PI / 180 * angle).normalize();

                            hitSound = true;
                        }

                        BallService.UpdateHitRectByMoment(ballHitBox, movement);

                        this.world.setComponentData(ballEntity, ballHitBox);

                        this.world.setComponentData(ballEntity, movement);
                    }
                });

            if (hitSound && gameContex.state == GameState.Play) {
                    SoundService.PlaySoundHit();        //SoundService.PlaySound(this.world, this.world.getConfigData(GameReferences).hitBlockAudioEntity);
            }
        }

        private CalcBlockHitArea(blockPos: Vector3, blockSize: Vector3, checkPos: Vector3, areaLocks: AreaLocks): number {
            let checkDir = new Vector3().subVectors(checkPos, blockPos).normalize();

            let isLeft = checkPos.x <= blockPos.x;

            let isBottom = checkPos.y <= blockPos.y;

            let bottomDot = checkDir.dot(new Vector3(0,-1,0));

            let leftDot = checkDir.dot(new Vector3(-1,0,0));

            let dots:Array<number> = new Array();

            let hitAreas:Array<number> = new Array();

            if(!areaLocks.lock2 && isBottom) {
                dots.push(bottomDot);

                hitAreas.push(2);
            }

            if(!areaLocks.lock4 && isLeft) {
                dots.push(leftDot);

                hitAreas.push(4);
            }

            if(!areaLocks.lock8 && !isBottom) {
                dots.push(-bottomDot);

                hitAreas.push(8);
            }

            if(!areaLocks.lock6 && !isLeft) {
                dots.push(-leftDot);

                hitAreas.push(6);
            }

            if(hitAreas.length == 1)
                return hitAreas[0];

            if(hitAreas.length == 2)
                return dots[0] > dots[1] ? hitAreas[0] : hitAreas[1];

            return 5;
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
 
            //球位置调整逻辑待整理
            // ballPos.addScaledVector(stepOffset, stepAmount);
 
            return resCheckPoint;
        }
    }
}


