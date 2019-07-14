
namespace BB {

    @ut.executeAfter(ut.Shared.UserCodeStart)
    @ut.executeAfter(ut.HTML.InputHandler)
    @ut.executeBefore(HitSystem)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class TouchMovementSystem extends ut.ComponentSystem {

        OnUpdate(): void {
            this.simulateTouchSystem();
        }

        private simulateTouchSystem(): void {
            let gameContex = this.world.getConfigData(GameContext);

            if(gameContex.state != GameState.Play)
                return;

            this.world.forEach([BB.TouchMovement, ut.Core2D.TransformLocalPosition]
                , (touchMovement, transform) => {

                    if(gameContex.uiTouchOver) {
                        return;
                    }

                    if (ut.Core2D.Input.getMouseButtonDown(0)) {
                        this.MoveStart(touchMovement);

                        return;
                    }

                    if (ut.Core2D.Input.getMouseButton(0)) {
                        this.Moving(touchMovement, transform);

                        this.AdjuestPostion(touchMovement, transform);
                    }
                });
        }

        private MoveStart(touchMovement: BB.TouchMovement): void {
            touchMovement.startWPos = this.GetPointerWorldPosition(this.world, this.world.getConfigData(GameReferences).mainCamera);
            touchMovement.deltaWPos = touchMovement.startWPos;
        }

        private Moving(touchMovement: BB.TouchMovement, transform: ut.Core2D.TransformLocalPosition): void {
            let pointerPos = this.GetPointerWorldPosition(this.world, this.world.getConfigData(GameReferences).mainCamera);

            let offsetPos = pointerPos.clone().sub(touchMovement.deltaWPos);

            offsetPos.x = BB.CoreUtils.Lerp(0, offsetPos.x, touchMovement.axisFilter.x);
            offsetPos.y = BB.CoreUtils.Lerp(0, offsetPos.y, touchMovement.axisFilter.y);

            transform.position = transform.position.add(offsetPos);

            touchMovement.deltaWPos = pointerPos;
        }

        private GetPointerWorldPosition(world: ut.World, cameraEntity: ut.Entity): Vector3 {
            let displayInfo = world.getConfigData(ut.Core2D.DisplayInfo);
            let displaySize = new Vector2(displayInfo.width, displayInfo.height);
            let inputPosition = ut.Runtime.Input.getInputPosition();

            return ut.Core2D.TransformService.windowToWorld(world, cameraEntity, inputPosition, displaySize);
        }

        private AdjuestPostion(touchMovement: BB.TouchMovement, transform: ut.Core2D.TransformLocalPosition): void {
            //暂时未计算Y方向范围
            let moveRange = touchMovement.moveRange;
            let minPosX = moveRange.x - moveRange.width * 0.5 + touchMovement.size.x * 0.5;
            let maxPosX = moveRange.x + moveRange.width * 0.5 - touchMovement.size.x * 0.5;
            let adjuestPos = transform.position;

            adjuestPos.x = Math.max(adjuestPos.x, minPosX);
            adjuestPos.x = Math.min(adjuestPos.x, maxPosX);

            transform.position = adjuestPos;
        }
    }
}


        // let pointerWorldPosition = InputService.getPointerWorldPosition(this.world, this.world.getEntityByName("GridCamera"));
        // let pointerDown = ut.Runtime.Input.getMouseButtonDown(0) || (ut.Runtime.Input.touchCount() == 1 && ut.Runtime.Input.getTouch(0).phase == ut.Core2D.TouchState.Began);
        // let pointerPressed = ut.Runtime.Input.getMouseButton(0) || (ut.Runtime.Input.touchCount() == 1 &&
        //     (ut.Runtime.Input.getTouch(0).phase == ut.Core2D.TouchState.Stationary || ut.Runtime.Input.getTouch(0).phase == ut.Core2D.TouchState.Moved));
