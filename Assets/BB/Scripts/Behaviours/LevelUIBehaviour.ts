
namespace BB {

    export class LevelUIBehaviourFilter extends ut.EntityFilter {
        ui: LevelUI;
    }
 
    export class LevelUIBehaviour extends ut.ComponentBehaviour {

        data: LevelUIBehaviourFilter;

        ChoiseLevelButton(lvl:number, entity?:ut.Entity) : void {
            let context = this.world.getConfigData(GameContext);
 
            context.cutLvl = lvl;

            this.world.setConfigData(context);

            GameService.SendStateCmd(this.world, GameState.Setup);
        }
  
        OnEntityUpdate(): void {
            let mouseInteraction0 = this.world.getComponentData(this.data.ui.testButton0Entity, ut.UIControls.MouseInteraction);
            let MouseInteraction1 = this.world.getComponentData(this.data.ui.testButton1Entity, ut.UIControls.MouseInteraction);

            if(mouseInteraction0.clicked) {
                this.ChoiseLevelButton(1, this.data.ui.testButton0Entity);
            }
            else if(MouseInteraction1.clicked) {
                this.ChoiseLevelButton(2, this.data.ui.testButton1Entity);
            }
        }
    }
}
