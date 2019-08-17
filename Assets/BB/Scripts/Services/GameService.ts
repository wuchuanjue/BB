 
namespace BB {

    /** New System */
    export class GameService {
        static ballPrefabEntity: ut.Entity;

        static blockPrefabEntity: ut.Entity;

        static IsGameState(world: ut.World, state: GameState): boolean {
            let gameContext = world.getConfigData(BB.GameContext);

            return gameContext.state == state;
        } 

        static Test(world:ut.World) : void {
            console.log("test--------");
  
        }

        static Init(world: ut.World, gameContext: BB.GameContext): void {

            SoundService.Init();

            let displayInfo = world.getConfigData(ut.Core2D.DisplayInfo);

            let layoutInfo = world.getConfigData(LayoutInfo);

            let gameReferences = world.getConfigData(GameReferences);
 
            gameReferences.mainCamera = world.getEntityByName("MainCamera");

            //TODO 获取玩家当前关卡
            gameContext.cutLvl = 1;

            world.setConfigData(gameReferences);

            LayoutFitScreenService.CalcLayoutInfos(displayInfo, layoutInfo);

            world.setConfigData(layoutInfo);

            GameService.FitScreenCamera(world, layoutInfo);

            GameService.SendStateCmd(world, GameState.Menu);
        }

        /**
         * 测试布局
         * @param world 
         * @param gameContext 
         */
        static TestInitLayout(world: ut.World, gameContext: BB.GameContext): void {
            let displayInfo = world.getConfigData(ut.Core2D.DisplayInfo);

            let layoutInfo = world.getConfigData(LayoutInfo);

            LayoutFitScreenService.CalcLayoutInfos(displayInfo, layoutInfo);

            world.setConfigData(layoutInfo);

            GameService.FitScreenCamera(world, layoutInfo);

            ut.EntityGroup.instantiate(world, "BB.FitScreenTest"); //test

            world.forEach([ut.Entity, TestContentDisplay, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale, ut.Core2D.Sprite2DRenderer]
                , (entity, contentDisplay, transormPos, transormScale, spriteRenderer) => {
                    var targetRect: ut.Math.Rect;

                    switch (contentDisplay.tag) {
                        case "Games":
                            targetRect = layoutInfo.gameContentRect;
                            break;
                        case "Blocks":
                            targetRect = layoutInfo.blockContentRect;
                            break;
                        case "Canvas":
                            targetRect = new ut.Math.Rect(0, 0, layoutInfo.canvasSize.x, layoutInfo.canvasSize.y);
                            break;
                        default:
                            console.error("TestInitLayout error. no exist tag:" + contentDisplay.tag);
                            break;
                    }

                    // spriteRenderer.color = targetColor;
                    transormPos.position = new Vector3(targetRect.x, targetRect.y, 0);
                    transormScale.scale = new Vector3(targetRect.width, targetRect.height, 1);
                });

            gameContext.state = GameState.Test;
        }

        private static FitScreenCamera(world: ut.World, layoutInfo: LayoutInfo): void {
            world.forEach([ut.Entity, CameraFitScreen, ut.Core2D.Camera2D], (entity, cameraFitScreen, camera2D) => {
                camera2D.halfVerticalSize = layoutInfo.halfVerticalSize;

            });
        }

        static LoseBall(world: ut.World, ballEntity: ut.Entity, gameContext: GameContext): void {
            if(gameContext.ballCutAmount > 0)
                gameContext.ballCutAmount -= 1;

            world.destroyEntity(ballEntity);
        }

        static ShootBall(world: ut.World, ballEntity: ut.Entity): void {
            let wPos = ut.Core2D.TransformService.computeWorldPosition(world, ballEntity);

            world.usingComponentData(ballEntity, [ut.Core2D.TransformNode, ut.Core2D.TransformLocalPosition, Movement, ut.HitBox2D.RectHitBox2D]
                , (transformNode, transofrmPos, movement, hitBox2D) => {
                    transformNode.parent = undefined;

                    transofrmPos.position = wPos;

                    movement.dir = EntityManagerService.GenRandomDir(new ut.Math.Range(-5,5));

                    BallService.UpdateHitRectByMoment(hitBox2D, movement);
                });
        }
 
        static SendStateCmd(world:ut.World, gameState:GameState) : void {
            let cmd = new StateChangeCmd();

            cmd.stateWhat = gameState;

            world.setOrAddComponentData(world.getConfigEntity(), cmd);
        }

        private static ResetState_Setup(world: ut.World, context: GameContext) : void {
            EntityManagerService.ClearGameEntitys(world);

            let layoutInfo = world.getConfigData(LayoutInfo);

            let lvlConfig = world.getConfigData(LevelConfig);
 
            world.setConfigData(layoutInfo);

            EntityManagerService.SetupBlockEntitys(world, context, layoutInfo);
        }
 
        private static EnterState_Setup(world: ut.World, context: GameContext, preState: GameState) : void {
            console.info(`Setup game. cutLvl:${context.cutLvl}   cutLife:${context.cutLife}`);

            switch(preState) {
                case GameState.Menu:
                    UIService.Show(world, "LevelUI"); 

                    UIService.Hide(world, "MainUI");

                    break;
                case GameState.LevelFinish:
                case GameState.Pause:
                        //Replay or Next level.
                        UIService.Hide(world, "PauseUI");

                        UIService.Hide(world,"LevelPassUI");

                        UIService.Hide(world,"LevelFailedUI"); 

                        UIService.Hide(world, "GameUI");
        
                        GameService.SendStateCmd(world, GameState.Play);

                    break;
                default:
                    console.warn(`preState error. preState:${preState}`);
                    break;
            }

            GameService.ResetState_Setup(world, context);
        }

        private static EnterState_Play(world: ut.World, context: GameContext, preState: GameState): void {
            switch (preState) {
                case GameState.Setup:
                    context.cutLife = context.defaultLife;
                    
                    context.propTimeFlagSec = context.propAmount = context.ballCutAmount = 0;

                    EntityManagerService.SetupGamePlayEntitys(world, context, world.getConfigData(LayoutInfo));

                    UIService.Hide(world, "LevelUI"); 
                    
                    UIService.Show(world, "GameUI");

                    break;
                case GameState.Pause:
                    UIService.Hide(world, "PauseUI");
                    
                    break;
                default:
                    console.warn(`preState error. preState:${preState}`);
                    break;
            }
        }

        private static EnterState_Menu(world: ut.World, context: GameContext, preState: GameState) {
            UIService.Show(world, "MainUI");
            
            switch (preState) {
                case GameState.Pause:
                case GameState.LevelFinish:
                    EntityManagerService.ClearGameEntitys(world);

                    UIService.Hide(world, "PauseUI");

                    UIService.Hide(world,"LevelPassUI");

                    UIService.Hide(world,"LevelFailedUI"); 

                    UIService.Hide(world, "GameUI");

                    break;
                case GameState.Init:
                    UIService.Hide(world, "MainUI");

                    break;
            }

            UIService.Show(world, "MainUI");
        }

        private static EnterState_LevelFinish(world: ut.World, context: GameContext, preState: GameState) {
            let gameRes = world.getComponentData(world.getConfigData(GameReferences).platformEntity, GameResult);

            EntityManagerService.ClearProps(world);

            if(gameRes.passLevel) {
                //win
                UIService.Show(world,"LevelPassUI"); 
            } else {
                //lose
                UIService.Show(world, "LevelFailedUI");
            }

            world.removeComponent(world.getConfigData(GameReferences).platformEntity, GameResult);
        }

        static ResetState(world: ut.World, context: GameContext) : void {
            switch(context.state) {
                case GameState.Setup:
                    GameService.ResetState_Setup(world, context);
                    break;
            }
        }

        static EnterState(world: ut.World, context: GameContext, nextState: GameState): void {
            console.info(`Enter state:${context.state} - ${nextState}`);

            if (nextState == context.state) {
                GameService.ResetState(world, context);
                return;
            }

            let preState = context.state;

            context.state = nextState;

            switch (context.state) {
                case GameState.Init:
                    GameService.Init(world, context);
                    break;

                case GameState.Menu: 
                    GameService.EnterState_Menu(world, context, preState);
                    break;

                case GameState.Loading:
                    break;

                case GameState.Setup:
                    GameService.EnterState_Setup(world, context, preState);
                    break;

                case GameState.Play:
                    GameService.EnterState_Play(world, context, preState);
                    break;

                case GameState.LevelFinish:
                    GameService.EnterState_LevelFinish(world, context, preState);
                    break;

                case GameState.Pause:
                    UIService.Show(world, "PauseUI");
                    break;

                case GameState.Test:
                    //test
                    GameService.Test(world);

                    GameService.TestInitLayout(world, context);
                    
                    break;

                default:
                    console.warn('No match state:' + context.state);
            }
        }
    }
}

 