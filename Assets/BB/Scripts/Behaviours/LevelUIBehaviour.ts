
namespace BB {

    export class LevelUIBehaviourFilter extends ut.EntityFilter {
        ui: LevelUI;
    }
 
    export class LevelUIBehaviour extends ut.ComponentBehaviour {

        data: LevelUIBehaviourFilter;

        ChoiseLevelButton(lvl:number) : void {
            let context = this.world.getConfigData(GameContext);
 
            context.cutLvl = lvl;

            this.world.setConfigData(context);

            GameService.SendStateCmd(this.world, GameState.Setup);
        }
  
        OnEntityUpdate(): void {
        
            if(UIService.DetectMouseInteraction(this.world,this.data.ui.leftButton).clicked) {
                
            }
            else if(UIService.DetectMouseInteraction(this.world,this.data.ui.rightButton).clicked) {
                 
            }
            else if(UIService.DetectMouseInteraction(this.world,this.data.ui.playButton).clicked) {
                
            }
        }
    }
}
