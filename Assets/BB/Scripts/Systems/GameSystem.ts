
namespace BB {

    @ut.executeAfter(ut.Shared.UserCodeStart)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class GameSystem extends ut.ComponentSystem {

        OnUpdate(): void {
            let context = this.world.getConfigData(GameContext);

            switch (context.state) {
                case GameState.Init:        
                    // GameService.TestInitLayout(this.world, context);
                    GameService.InitGame(this.world, context);
                    // this.Test(context);
                    break;
                case GameState.Menu:
                    context.state = GameState.Loading;
                    break;
                case GameState.Loading:
                    GameService.SetupGameEntitys(this.world, context); 
 
                    context.state = GameState.Play;   
                    break;
                case GameState.Play:
                    
                    break;
                case GameState.Test:
 
                    break;
                default:
                    console.warn('No match state:' + context.state);
            }

            this.world.setConfigData(context);


            
        } 
  
        // private Test(gameContext : GameContext) : void {
        //     gameContext.state = GameState.Test;

        //     // // GameService.TestInitLayout(this.world, context);
        //     // let levels = this.world.getConfigData(BB.Levels);

        //     // let o = JSON.parse(levels.level0);

        //     // console.log(o);

            
            
        //     let type = PropType.expand;
        //     let path = `assets/sprites/Default/Prop_${type}`;
        //     let testEn = this.world.getEntityByName(path);
        //     console.log("en:" + testEn.isNone());
            
            
        // }
        
    }
}


