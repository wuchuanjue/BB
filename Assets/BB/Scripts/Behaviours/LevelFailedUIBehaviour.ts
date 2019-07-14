
namespace BB {

    export class LevelFailedUIBehaviourFilter extends ut.EntityFilter {
        ui: LevelFailedUI;
    }

    export class LevelFailedUIBehaviour extends ut.ComponentBehaviour {

        data: LevelFailedUIBehaviourFilter;

        // this method is called for each entity matching the LevelFailedUIBehaviourFilter signature, every frame it's enabled
        OnEntityUpdate():void { 
            if(UIService.DetectMouseInteraction(this.world, this.data.ui.homeBtn).clicked) {
                GameService.SendStateCmd(this.world, GameState.Menu);
            } 
            else if(UIService.DetectMouseInteraction(this.world, this.data.ui.replayBtn).clicked) {
                GameService.SendStateCmd(this.world, GameState.Setup);
            }
        }
    }
}
