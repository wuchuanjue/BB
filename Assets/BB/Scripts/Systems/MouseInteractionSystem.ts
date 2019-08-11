
namespace BB {

    /** New System */
    @ut.executeAfter(ut.UIControls.MouseInteractionSystem)
    export class MouseInteractionSystem extends ut.ComponentSystem {
        
        OnUpdate():void {
            let uiMouseOver = false;
            let uiMouseClick = false;

            this.world.forEach([ut.UIControls.MouseInteraction],(mouseInteraction)=>{
                if(mouseInteraction.over) {
                    // console.log("mouse over");

                    uiMouseOver = true;
                }
                
                if(mouseInteraction.clicked) {
                    //sound 
                    uiMouseClick = true;
                }
            });

            let gameContext = this.world.getConfigData(GameContext);

            if(gameContext.uiTouchOver != uiMouseOver) {
                gameContext.uiTouchOver = uiMouseOver;

                this.world.setConfigData(gameContext);
            }

            if(uiMouseClick) {
                SoundService.PlaySoundUI();
            }
        }
    }
}
