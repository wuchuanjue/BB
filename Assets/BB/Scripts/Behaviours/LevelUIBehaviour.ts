
namespace BB {

    export class LevelUIBehaviourFilter extends ut.EntityFilter {
        ui: LevelUI;
    }
 
    export class LevelUIBehaviour extends ut.ComponentBehaviour {

        data: LevelUIBehaviourFilter;

        // ChoiseLevelButton(lvl:number) : void {
        //     let context = this.world.getConfigData(GameContext);
 
        //     context.cutLvl = lvl;

        //     this.world.setConfigData(context);

        //     GameService.SendStateCmd(this.world, GameState.Setup);
        // }

        UpdateLevel(lvlOffset:number):void {
            let context = this.world.getConfigData(GameContext);

            context.cutLvl += lvlOffset;

            let levelAmount = this.world.getConfigData(LevelConfig).levels.length;

            if(context.cutLvl < 1) 
                context.cutLvl = levelAmount;
            else if(context.cutLvl > levelAmount)
                context.cutLvl = 1;

            this.world.setConfigData(context);

            GameService.SendStateCmd(this.world, GameState.Setup);
        }
 
        OnEntityUpdate() : void {
            if(UIService.DetectMouseInteraction(this.world,this.data.ui.leftButton).clicked) {
                this.UpdateLevel(-1);
            }
            else if(UIService.DetectMouseInteraction(this.world,this.data.ui.rightButton).clicked) {
                this.UpdateLevel(+1);
            }
            else if(UIService.DetectMouseInteraction(this.world,this.data.ui.playButton).clicked) {
                GameService.SendStateCmd(this.world, GameState.Play);
            }
        }
    }
}
