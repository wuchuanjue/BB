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

        public static Lerp(from:number, to:number, val:number) : number {
            return from * (1 - val) + to * val;
        } 
 
        
    }
}