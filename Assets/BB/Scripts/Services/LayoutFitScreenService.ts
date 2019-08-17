namespace BB {
    export class LayoutFitScreenService {
        /**
         * 计算自适应屏幕的fov,rect等
         */
        public static CalcLayoutInfos(displayInfo: ut.Core2D.DisplayInfo, layoutInfo: LayoutInfo): void {
            //屏幕分辨率
            let screenResolution = new Vector2(displayInfo.width, displayInfo.height);

            //设计分辨率
            const designResolution = new Vector2(360, 640);

            const DESIGN_CAMERA_OFOV = 5;

            //屏幕宽高比
            let screenRatio = screenResolution.x / screenResolution.y;

            //设计宽高比
            let designRatio = designResolution.x / designResolution.y;
             
            if (screenRatio < designRatio) {
                //更窄
                layoutInfo.halfVerticalSize = DESIGN_CAMERA_OFOV / (screenRatio / designRatio);

                layoutInfo.designToScreen = screenResolution.x / designResolution.x;
            }
            else {
                layoutInfo.halfVerticalSize = DESIGN_CAMERA_OFOV;

                layoutInfo.designToScreen = screenResolution.y / designResolution.y;
            }

            //全屏尺寸
            layoutInfo.canvasSize = new Vector2(0, layoutInfo.halfVerticalSize * 2);

            layoutInfo.canvasSize.x = layoutInfo.canvasSize.y * screenRatio;

            //分辨率转世界尺寸
            layoutInfo.resolutionToSize = layoutInfo.canvasSize.x / screenResolution.x;

            //console.log(`designToScreen:${designToScreen}   screenRatio:${screenRatio}  `);
 
            
            // console.log(`canvas size:${layoutInfo.canvasSize.x},${layoutInfo.canvasSize.y}`);
            // console.log(`gameContentRect:${layoutInfo.gameContentRect.x},${layoutInfo.gameContentRect.y},${layoutInfo.gameContentRect.width},${layoutInfo.gameContentRect.height}`);
        }

        public static UpdateContent(layoutInfo: LayoutInfo, blockAmountX:number, blockAmountY:number) {
            const BLOCK_PADDING = 1;

            const GAME_CONTENT_RESOLUTION_RECT = new ut.Math.Rect(0, -25, 352, 580);

            let gameContentResolutionRect = new ut.Math.Rect(
                Math.floor(GAME_CONTENT_RESOLUTION_RECT.x * layoutInfo.designToScreen),
                Math.floor(GAME_CONTENT_RESOLUTION_RECT.y * layoutInfo.designToScreen),
                Math.floor(GAME_CONTENT_RESOLUTION_RECT.width * layoutInfo.designToScreen),
                Math.floor(GAME_CONTENT_RESOLUTION_RECT.height * layoutInfo.designToScreen)
            );

            let blockPaddingResolution = Math.ceil(BLOCK_PADDING * layoutInfo.designToScreen);

            let blockResolution = Math.floor(gameContentResolutionRect.width / blockAmountX - blockPaddingResolution);

            //console.log(`gameContentR.width:${gameContentResolutionRect.width}   blockR:${blockResolution}    blockPaddingR:${blockPaddingResolution}`);

            //重新调整 gameContent 尺寸
            gameContentResolutionRect.width = (blockResolution + blockPaddingResolution) * blockAmountX - blockPaddingResolution;

            //block content 相对 game content 靠上
            let blockContentResolutionRect = new ut.Math.Rect(
                0,
                0,
                gameContentResolutionRect.width,
                (blockResolution + blockPaddingResolution) * blockAmountY - blockPaddingResolution
            );

            blockContentResolutionRect.y = (gameContentResolutionRect.y + gameContentResolutionRect.height * 0.5 - blockContentResolutionRect.height * 0.5);

            //-----------------------------------convert to world size---------------------------------------------
            layoutInfo.gameContentRect = new ut.Math.Rect(
                gameContentResolutionRect.x * layoutInfo.resolutionToSize,
                gameContentResolutionRect.y * layoutInfo.resolutionToSize,
                gameContentResolutionRect.width * layoutInfo.resolutionToSize,
                gameContentResolutionRect.height * layoutInfo.resolutionToSize
            );

            layoutInfo.blockContentRect = new ut.Math.Rect(
                blockContentResolutionRect.x * layoutInfo.resolutionToSize,
                blockContentResolutionRect.y * layoutInfo.resolutionToSize,
                blockContentResolutionRect.width * layoutInfo.resolutionToSize,
                blockContentResolutionRect.height * layoutInfo.resolutionToSize
            );

            layoutInfo.blockSize = blockResolution * layoutInfo.resolutionToSize;

            layoutInfo.blockSpacing = blockPaddingResolution * layoutInfo.resolutionToSize;

        }
    }
}