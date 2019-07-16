
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
        
            if(UIService.DetectMouseInteraction(this.world,this.data.ui.testButton1Entity).clicked) {
                this.ChoiseLevelButton(1);
            }
            else if(UIService.DetectMouseInteraction(this.world,this.data.ui.testButton2Entity).clicked) {
                this.ChoiseLevelButton(2);
            }
            else if(UIService.DetectMouseInteraction(this.world,this.data.ui.testButton3Entity).clicked) {
                this.ChoiseLevelButton(3);
            }
        }
    }
}
