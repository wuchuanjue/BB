
namespace BB {
 
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class TestSystem extends ut.ComponentSystem {
        OnUpdate(): void {

        //     let layoutInfo = this.world.getConfigData(LayoutInfo);

        //     //Fit screen test. 
        //     this.world.forEach([ut.Entity, CameraFitScreen, ut.Core2D.Camera2D], (entity, cameraFitScreen, camera2D) => {
        //         camera2D.halfVerticalSize = layoutInfo.halfVerticalSize;
        //     });

        //     //----------------------------------------rect&pos---------------------------------------------------

        //     this.world.forEach([ut.Entity, TestContentDisplay, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale, ut.Core2D.Sprite2DRenderer]
        //         , (entity, contentDisplay, transormPos, transormScale, spriteRenderer) => {
        //             var targetRect: ut.Math.Rect;

        //             switch (contentDisplay.tag) {
        //                 case "Games":

        //                     targetRect = layoutInfo.gameContentRect;
        //                     break;
        //                 case "Blocks":

        //                     targetRect = layoutInfo.blockContentRect;
        //                     break;
        //             }

        //             // spriteRenderer.color = targetColor;
        //             transormPos.position = new Vector3(targetRect.x, targetRect.y, 0);
        //             transormScale.scale = new Vector3(targetRect.width, targetRect.height, 1);
        //         });
        }
    }
}
