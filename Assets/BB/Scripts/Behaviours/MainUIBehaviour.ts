
namespace BB {

    export class MainUIBehaviourFilter extends ut.EntityFilter {
        ui:MainUI;
    }

    export class MainUIBehaviour extends ut.ComponentBehaviour {

        data: MainUIBehaviourFilter;
         
        OnEntityUpdate():void { 
            this.world.usingComponentData(this.data.ui.textEntity, [ut.Text.Text2DStyle,ut.UIControls.MouseInteraction,ut.Text.Text2DRenderer]
                , (style, mouseInteraction, textRenderer)=>{
                    style.color = mouseInteraction.down ? new ut.Core2D.Color(0.3,0.3,0.3,1) : new ut.Core2D.Color(1,1,1,1);
 
                    if(ut.Core2D.Input.getMouseButtonUp(0)) {
                        GameService.SendStateCmd(this.world, GameState.Setup);
                    }
            })
        }
    }
}
