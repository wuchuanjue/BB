namespace BB {
    export class LayoutFitScreenService {
        /**
         * 计算自适应屏幕的fov,rect等
         */
        public static CalcLayoutInfos(displayInfo : ut.Core2D.DisplayInfo, layoutInfo:LayoutInfo) : void {
            let canvasResolution = new Vector2(displayInfo.width, displayInfo.height);
            
            let designResolution = new Vector2(900, 1600);
            
            let gameResolution = new Vector2(800, 1200);
            
            let blocksResolution = new Vector2(800, 800);

            //方块分辨率
            let blockResolution = 20;

            //方块间隔
            let blockSpacingResolution = 4;     

            let canvasRatio = canvasResolution.x / canvasResolution.y;
          
            let designRatio = designResolution.x / designResolution.y;

            let designCameraOFov = 5;

            let designSize = new Vector2(0, 0);

            designSize.y = designCameraOFov * 2; 

            designSize.x = designSize.y * designRatio;

            let resolutionToSize = designSize.x / designResolution.x;
            
            layoutInfo.halfVerticalSize = designCameraOFov / (canvasRatio / designRatio);

            let canvasSize = new Vector2(0, layoutInfo.halfVerticalSize * 2);

            canvasSize.x = canvasSize.y * canvasRatio;

            layoutInfo.canvasSize = canvasSize;

            //blocks + platform
            layoutInfo.gameContentRect = new ut.Math.Rect(0, 0, gameResolution.x * resolutionToSize, gameResolution.y * resolutionToSize);
            
            let blockContentRect = new ut.Math.Rect(0,0, blocksResolution.x * resolutionToSize, blocksResolution.y * resolutionToSize);
            
            blockContentRect.y = (layoutInfo.gameContentRect.y + layoutInfo.gameContentRect.height * 0.5 - blockContentRect.height * 0.5);
            
            layoutInfo.blockContentRect = blockContentRect;

            layoutInfo.blockSize = blockResolution * resolutionToSize;

            layoutInfo.blockSpacing = blockSpacingResolution * resolutionToSize;
        }
    }
}