
namespace BB {

    @ut.executeAfter(ut.Shared.UserCodeStart)
    @ut.executeAfter(ut.HitBox2D.HitBox2DSystem)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class HitSystem extends ut.ComponentSystem {

        // OnUpdate(): void {
        //     if (!GameService.IsGameState(this.world, GameState.Play))
        //         return;

        //     this.world.forEach([ut.Entity, Ball, ut.Core2D.TransformLocalPosition], (ballEntity, ball, transformPos) => {
        //         let prePos = ball.prePos;

        //         let cutPos = transformPos.position;

        //         ball.prePos = transformPos.position;

        //         let hitRayCast = ut.HitBox2D.HitBox2DService.rayCast(this.world, prePos, cutPos, GameService.GetMainCameraEntity());

        //         if (hitRayCast.entityHit == null || hitRayCast.entityHit.isNone()) {

        //             return;
        //         }

        //         if (!this.world.exists(hitRayCast.entityHit))
        //             return;

        //         let targetEntityName = this.world.getEntityName(hitRayCast.entityHit);

        //         // console.log(`hit entity 0: ${targetEntityName}`);

        //         if (ball.preHitEntity == targetEntityName) {
        //             //碰撞到同一个物体
        //             return;
        //         }

        //         // console.log(`hit entity 1: ${targetEntityName}`);

        //         ball.preHitEntity = targetEntityName;

        //         let hitArea = 5;

        //         let hitPos = new Vector3();

        //         hitPos.subVectors(cutPos, prePos).multiplyScalar(hitRayCast.t).add(prePos);

        //         let movement = this.world.getComponentData(ballEntity, BB.Movement);

        //         if (this.world.hasComponent(hitRayCast.entityHit, BB.Block)) {
        //             let block = this.world.getComponentData(hitRayCast.entityHit, BB.Block);

        //             DamageService.AtkBlock(hitRayCast.entityHit, ball, this.world);
        //         }
        //         else if (this.world.hasComponent(hitRayCast.entityHit, BB.Border)) {
        //             let border = this.world.getComponentData(hitRayCast.entityHit, BB.Border);

        //             hitArea = border.Dir;

        //             if (hitArea == 5) {
        //                 //Ball dead

        //             }
        //         }

        //         ball.prePos = transformPos.position = hitPos;

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

                    if (ball.preHitEntity == target.index) {
                        return;
                    }

                    ball.preHitEntity = target.index;

                    let hitArea = 5;

                    let movement = this.world.getComponentData(ballEntity, BB.Movement);

                    // let cutToPre = new Vector3().subVectors(movement.prePos,ballTrans.position);

                    // let teleportPos = new Vector3().addVectors(ballTrans.position, cutToPre.multiplyScalar(3));

                    GameService.MovementTeleport(ballTrans, movement, movement.prePos);        //

                    if (this.world.hasComponent(target, BB.Border)) {
                        let border = this.world.getComponentData(target, BB.Border);

                        if (border.Dir == 2) {
                            //lose ball;
                            GameService.LoseBall(this.world, ballEntity, gameContex);

                            return;
                        }

                        hitArea = border.Dir;

                        hitSound = "border";

                        // console.log(`hit border. hit area:${hitArea}`);
                    }
                    else if (this.world.hasComponent(target, Block)) {
                        hitSound = "block";

                        let blockTransformPos = this.world.getComponentData(target, ut.Core2D.TransformLocalPosition);

                        hitArea = this.CalcRectHitInfo(blockTransformPos.position.clone(), ballTrans.position.clone(), movement.dir.clone());

                        // console.log(`hit block. hit area:${hitArea}`);

                        // // if(hitArea == 4 || hitArea == 6) {
                        //     DamageService.MarkBlock(this.world,target);
                        //     this.scheduler.pause();
                        // // }
                        // // else {
                        // //     DamageService.AtkBlock(target, blockTransformPos.position, ball, this.world, gameContex);
                        // // }

                        DamageService.AtkBlock(target, blockTransformPos.position, ball, this.world, gameContex);
                    }
                    else if (this.world.hasComponent(target, Platform)) {
                        let upDir = new Vector3(0, 1, 0);

                        let platformTransformPos = this.world.getComponentData(target, ut.Core2D.TransformLocalPosition);

                        let platformSpriteOptions = this.world.getComponentData(target, ut.Core2D.Sprite2DRendererOptions);

                        let hitOffset = movement.prePos.x - platformTransformPos.position.x;

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

            this.world.forEach([ut.Entity, Prop, ut.HitBox2D.HitBoxOverlapResults], (propEntity, prop, overlapResults) => {
                let overlaps = overlapResults.overlaps;

                if (overlaps.length == 0)
                    return;

                let target = overlaps[0].otherEntity;

                if (!this.world.exists(target))
                    return;

                if (this.world.hasComponent(target, Platform)) {
                    GameService.ReceiveProp(this.world, prop, gameContex);

                    this.world.destroyEntity(propEntity);

                    SoundService.PlaySound(this.world, this.world.getConfigData(GameReferences).receivePropAudioEntity);
                }
                else if (this.world.hasComponent(target, Border)) {
                    let border = this.world.getComponentData(target, Border);

                    if (border.Dir == 2) {
                        this.world.destroyEntity(propEntity);
                    }
                }
            });

            this.world.setConfigData(gameContex);

        }

        /**
         * 直接返回上一个位置
         * @param blockPos 
         * @param ballPos 
         * @param ballDirection 
         */
        private CalcRectHitInfo(blockPos: Vector3, ballPos: Vector3, ballDirection: Vector3): number {
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
    }
}


