
namespace BB {

    export class LevelPassUIBehaviourFilter extends ut.EntityFilter {
        ui: LevelPassUI;
    }
 
    export class LevelPassUIBehaviour extends ut.ComponentBehaviour {

        data: LevelPassUIBehaviourFilter;
        
        // this method is called for each entity matching the PassLevelUIBehaviourFilter signature, every frame it's enabled
        OnEntityUpdate():void { 
            if(UIService.DetectMouseInteraction(this.world, this.data.ui.nextButton).clicked) {
                let lvlAmount = this.world.getConfigData(Levels).levelAmount;

                let context = this.world.getConfigData(GameContext);

                context.cutLvl += 1;

                if(lvlAmount < context.cutLvl) {
                    //最后一关？ 暂时重复
                    context.cutLvl = 1;
                }

                this.world.setConfigData(context);

                GameService.SendStateCmd(this.world, GameState.Setup);
            }
            else if(UIService.DetectMouseInteraction(this.world, this.data.ui.homeButton).clicked) {
                GameService.SendStateCmd(this.world, GameState.Menu);
            }
            else if(UIService.DetectMouseInteraction(this.world, this.data.ui.replayButton).clicked) {
                GameService.SendStateCmd(this.world, GameState.Setup);
            }
        }
    }
}
