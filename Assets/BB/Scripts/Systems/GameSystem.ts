
namespace BB {

    @ut.executeBefore(ut.HitBox2D.HitBox2DSystem)
    export class GameSystem extends ut.ComponentSystem {

        OnUpdate(): void {
            let context = this.world.getConfigData(GameContext);

            switch(context.state)
            {
                case GameState.None:
                    GameService.EnterState(this.world, context, GameState.Init);
                    break;
                case GameState.Init:
                    GameService.EnterState(this.world,context, GameState.Menu);
                    break;
                case GameState.Menu:
                    if(context.cutLvl > 0) {
                        GameService.EnterState(this.world, context, GameState.Play);
                    } 
                    break;
                case GameState.LevelFinish:
                    if(context.cutLvl == 0) {
                        GameService.EnterState(this.world, context, GameState.Menu);
                    }

                    break;
            }

            this.world.setConfigData(context);
        }

        private Test(gameContext: GameContext): void {
            gameContext.state = GameState.Test;

            ut.EntityGroup.instantiate(this.world, "BB.UIMain");

            // // GameService.TestInitLayout(this.world, context);
            // let levels = this.world.getConfigData(BB.Levels);

            // let o = JSON.parse(levels.level0);

            // console.log(o);
 


            // let type = PropType.expand;
            // let path = `assets/sprites/Default/Prop_${type}`;
            // let testEn = this.world.getEntityByName(path);
            // console.log("en:" + testEn.isNone());
        }


    }
}


