namespace BB {
    export class CoreUtils {
        // /**
        //  * 正交投影
        //  * @param world  
        //  * @param screenPos  屏幕坐标
        //  * @param camera 摄像机
        //  */
        // public static ScreenPosToWorldPos(world : ut.World, screenPos : Vector2, camera : ut.Core2D.Camera2D) : Vector3 {
        //     return new v
        // }

        public static Lerp(from: number, to: number, val: number): number {
            return from * (1 - val) + to * val;
        }

        /**
         * Const function.
         * @param point 
         * @param rect 
         */
        public static isPointInRect(point: Vector3, rect: ut.Math.Rect): boolean {
            // console.log(`point:${point.x},${point.y}  rect:${rect.x},${rect.y},${rect.width},${rect.height}`);

            let halfWidth = rect.width * 0.5;

            let halfHeight = rect.height * 0.5;

            if (
                point.x > (rect.x - halfWidth)
                &&
                point.x < (rect.x + halfWidth)
                &&
                point.y > (rect.y - halfHeight)
                &&
                point.y < (rect.y + halfHeight)
            ) {
                return true;
            }

            return false;
        }

        public static DrawDebugPoint(world: ut.World, pos: Vector3, color: ut.Core2D.Color): void {
            let entity = ut.EntityGroup.instantiate(world, "BB.DebugQuad")[0];

            world.usingComponentData(entity, [ut.Core2D.TransformLocalPosition,ut.Core2D.TransformLocalScale,ut.Core2D.Sprite2DRenderer]
                ,(transPos,transScale,sprite2DRenderer)=>{
                    transPos.position = pos;

                    transScale.scale = new Vector3(0.005,0.005,1);

                    sprite2DRenderer.color = color;
            });
        }
    }
}