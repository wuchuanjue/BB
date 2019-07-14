
namespace BB {

    export class PauseUIBehaviourFilter extends ut.EntityFilter {
        ui: PauseUI;
    }
 
    export class PauseUIBehaviour extends ut.ComponentBehaviour {

        data: PauseUIBehaviourFilter;
 
        // this method is called for each entity matching the PauseUIBehaviourFilter signature, every frame it's enabled
        OnEntityUpdate():void { 
            if(UIService.DetectMouseInteraction(this.world, this.data.ui.continueBtn).clicked) {
                GameService.SendStateCmd(this.world, GameState.Play);
            }
            else if(UIService.DetectMouseInteraction(this.world, this.data.ui.homeBtn).clicked) {
                GameService.SendStateCmd(this.world, GameState.Menu);
            }
            else if(UIService.DetectMouseInteraction(this.world, this.data.ui.replayBtn).clicked) {
                GameService.SendStateCmd(this.world, GameState.Setup);
            }
        }
    }
}
