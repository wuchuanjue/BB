namespace BB {
    export class LayoutFitScreenService {
        /**
         * 计算自适应屏幕的fov,rect等
         */
        public static CalcLayoutInfos(displayInfo : ut.Core2D.DisplayInfo, layoutInfo:LayoutInfo) : void {
            let canvasResolution = new Vector2(displayInfo.width, displayInfo.height);
            
            //TODO 待提出到config
            let designResolution = new Vector2(900, 1600);
            
            let gameResolutionRect = new ut.Math.Rect(0,-45, 880, 1480);
            
            let blocksResolution = new Vector2(880, 985);
 
            //方块间隔
            let blockSpacingResolution = 4;     

            let canvasRatio = canvasResolution.x / canvasResolution.y;
          
            let designRatio = designResolution.x / designResolution.y;

            let designCameraOFov = 5;
            let designSize = new Vector2(0, 0);

            designSize.y = designCameraOFov * 2; 

            designSize.x = designSize.y * designRatio;

            layoutInfo.resolutionToSize = designSize.x / designResolution.x; 
 
            if(canvasRatio < designRatio) {
                //更窄
                layoutInfo.halfVerticalSize = designCameraOFov / (canvasRatio / designRatio);
            }
            else {
                layoutInfo.halfVerticalSize = designCameraOFov;
            }
            
            let canvasSize = new Vector2(0, layoutInfo.halfVerticalSize * 2);

            canvasSize.x = canvasSize.y * canvasRatio;

            layoutInfo.canvasSize = canvasSize;

            //game contect
            layoutInfo.gameContentRect = new ut.Math.Rect(
                gameResolutionRect.x * layoutInfo.resolutionToSize,
                gameResolutionRect.y * layoutInfo.resolutionToSize, 
                gameResolutionRect.width * layoutInfo.resolutionToSize, 
                gameResolutionRect.height * layoutInfo.resolutionToSize
            );
            
            //block靠上
            let blockContentRect = new ut.Math.Rect(0,0, blocksResolution.x * layoutInfo.resolutionToSize, blocksResolution.y * layoutInfo.resolutionToSize);
            
            blockContentRect.y = (layoutInfo.gameContentRect.y + layoutInfo.gameContentRect.height * 0.5 - blockContentRect.height * 0.5);
            
            layoutInfo.blockContentRect = blockContentRect;

            //改为动态更新
            //layoutInfo.blockSize = blockResolution * layoutInfo.resolutionToSize;

            layoutInfo.blockSpacing = blockSpacingResolution * layoutInfo.resolutionToSize;
        }

        /**
         * 方块尺寸允许动态改变，不同的关卡可以指定不一样的block size
         */
        public static UpdateBlockSizeConfig(blockResolution:number, layoutInfo:LayoutInfo) : void {
            layoutInfo.blockSize = blockResolution * layoutInfo.resolutionToSize;
        }
    }
}