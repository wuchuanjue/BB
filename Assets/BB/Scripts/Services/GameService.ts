
namespace BB {

    /** New System */
    export class GameService {
        static BLOCK_EG_NAME: string = 'BB.BlockEG';
        // static BALL_EG_NAME: string = "BB.Ball";
        static Game_EG_NAME: string = "BB.Game";

        static mainCameraEntity: ut.Entity;

        static ballPrefabEntity: ut.Entity;

        static blockPrefabEntity: ut.Entity;

        static IsGameState(world: ut.World, state: GameState): boolean {
            let gameContext = world.getConfigData(BB.GameContext);

            return gameContext.state == state;
        }

        static GetMainCameraEntity(): ut.Entity {
            return GameService.mainCameraEntity;
        }

        static InitGame(world: ut.World, gameContext: BB.GameContext): void {
            let displayInfo = world.getConfigData(ut.Core2D.DisplayInfo);

            let layoutInfo = world.getConfigData(LayoutInfo);

            GameService.mainCameraEntity = world.getEntityByName("MainCamera");

            LayoutFitScreenService.CalcLayoutInfos(displayInfo, layoutInfo);

            world.setConfigData(layoutInfo);

            GameService.FitScreenCamera(world, layoutInfo);

            gameContext.state = GameState.Menu;
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
                            targetRect = new ut.Math.Rect(0, 0, layoutInfo.canvasSize.x - 0.1, layoutInfo.canvasSize.y - 0.1);
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

        static ClearGameEntitys(): void {

        }

        static SetupGameEntitys(world: ut.World, gameContext: BB.GameContext): void {
            let layoutInfo = world.getConfigData(LayoutInfo);

            ut.EntityGroup.instantiate(world, GameService.Game_EG_NAME);

            ut.EntityGroup.instantiate(world, "BB.UIMain");

            let platformPos = new Vector3(0, layoutInfo.gameContentRect.y - layoutInfo.gameContentRect.height * 0.5);

            GameService.blockPrefabEntity = world.getEntityByName("Block");

            console.assert(!GameService.blockPrefabEntity.isNone(), "Can not find block prefab.");

            {
                //修改方块原型的尺寸
                let blockPrefabTransformScale = world.getComponentData(GameService.blockPrefabEntity, ut.Core2D.TransformLocalScale);

                blockPrefabTransformScale.scale = new Vector3(layoutInfo.blockSize, layoutInfo.blockSize, 1);

                world.setComponentData(GameService.blockPrefabEntity, blockPrefabTransformScale);
            }

            {
                //border
                world.forEach([ut.Entity, Border, ut.Core2D.TransformLocalPosition, ut.Core2D.Sprite2DRendererOptions]
                    , (entity, border, transformPos, spriteOptions) => {
                        switch (border.Dir) {
                            case 2:
                                transformPos.position = new Vector3(0, -layoutInfo.canvasSize.y * 0.5 - spriteOptions.size.y * 0.5, 0);
                                spriteOptions.size = new Vector2(layoutInfo.canvasSize.x, spriteOptions.size.y);
                                break;
                            case 4:
                                transformPos.position = new Vector3(-layoutInfo.canvasSize.x * 0.5 - spriteOptions.size.x * 0.5, 0, 0);
                                spriteOptions.size = new Vector2(spriteOptions.size.x, layoutInfo.canvasSize.y);
                                break;
                            case 6:
                                transformPos.position = new Vector3(layoutInfo.canvasSize.x * 0.5 + spriteOptions.size.x * 0.5, 0, 0);
                                spriteOptions.size = new Vector2(spriteOptions.size.x, layoutInfo.canvasSize.y);
                                break;
                            case 8:
                                transformPos.position = new Vector3(0, layoutInfo.canvasSize.y * 0.5 + spriteOptions.size.y * 0.5, 0);
                                spriteOptions.size = new Vector2(layoutInfo.canvasSize.x, spriteOptions.size.y);
                                break;
                        }
                    });
            }
 
            let firstBall = null;

            {
                //ball
                firstBall = GameService.SpawnBall(
                    //停住 platform下的局部位置
                    world, gameContext, new Vector3(0,0.2,0), new Vector3(0,0,0)
                ); 

                world.addComponent(firstBall, IdleBall);
            }

            {
                //platform
                world.forEach([ut.Entity, Platform, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale, ut.Core2D.Sprite2DRendererOptions, TouchMovement]
                    , (platformEntity, platform, transformPos, transformScale, spriteOptions, touchMovement) => {
                        transformPos.position = platformPos;

                        touchMovement.moveRange = new ut.Math.Rect(0, 0, layoutInfo.canvasSize.x, 0);

                        touchMovement.size = new Vector2(spriteOptions.size.x, 0);

                        let ballTransformNode = world.getComponentData(firstBall, ut.Core2D.TransformNode);

                        ballTransformNode.parent = platformEntity;
                        
                        world.setComponentData(firstBall, ballTransformNode);
                });
            }

            {
                // //setup blocks
                // //测试block
                // let blockInfo = new BlockInfo();

                // for (var row: number = 0; row < 2; row++) {          //31
                //     for (var col: number = 0; col < 36; col++) {
                //         blockInfo.col = col;
                //         blockInfo.row = row;
                //         blockInfo.color = new ut.Core2D.Color(1, 1, 1, 1);

                //         GameService.SpawnBlock(world, layoutInfo, blockInfo);
                //     }
                // }

                // gameContext.blockAmount = 2 * 36;

                {
                    let levels = world.getConfigData(Levels);

                    let json = JSON.parse(levels.level0);

                    let blocks = json.blocks;

                    gameContext.blockAmount = 0;

                    let blockInfo = new BlockConfig(); 

                    for (var i = 0; i < 900; i++) {
                        let block = blocks[i];

                        // console.log(`row:${block.row} col:${block.col}`);
 
                        blockInfo.row = block.row + 2;

                        blockInfo.col = block.col + 2;

                        blockInfo.color = new ut.Core2D.Color(block.color.r / 255, block.color.g / 255, block.color.b / 255, 1);

                        blockInfo.isWall = false;
 
                        GameService.SpawnBlock(world, layoutInfo, blockInfo);
 
                        gameContext.blockAmount += 1;
                    }

                    for(var j = 0; j < 30; j ++) {
                        // let blockInfo = new BlockConfig(); 

                        blockInfo.row = 0;

                        blockInfo.col = j + 2;

                        blockInfo.isWall = true;

                        blockInfo.color = new ut.Core2D.Color(0.3,  0.3, 0.3, 1);

                        GameService.SpawnBlock(world, layoutInfo, blockInfo);
                    }
                }
            }
        }

        /**
         * 数据结构待优化. TODO
         * @param world 
         * @param layoutInfo 
         * @param blockInfo 
         */
        static SpawnBlock(world: ut.World, layoutInfo: LayoutInfo, blockConfig: BlockConfig): void {
            let rectX = layoutInfo.blockContentRect.x;
            let rectY = layoutInfo.blockContentRect.y;
            let rectW = layoutInfo.blockContentRect.width;
            let rectH = layoutInfo.blockContentRect.height;
            let blockSize = layoutInfo.blockSize;
            let blockSpacing = layoutInfo.blockSpacing;

            //Left bottom origin point.
            let lbOrigin = new Vector3(rectX - rectW * 0.5, rectY - rectH * 0.5);

            let offset = new Vector3(
                blockConfig.col * blockSize + blockConfig.col * blockSpacing,
                blockConfig.row * blockSize + blockConfig.row * blockSpacing
            );

            let pos = lbOrigin.add(offset).add(new Vector3(blockSize * 0.5, blockSize * 0.5, 0));

            GameService.CreateBlock(world, `block_${blockConfig.col}_${blockConfig.row}`, pos, blockConfig);
        }

        static CreateBlock(world: ut.World, id: string, pos: Vector3, blockConfig:BlockConfig): void {
            let blockEntity = world.instantiateEntity(GameService.blockPrefabEntity);

            world.setEntityName(blockEntity, id);
 
            world.usingComponentData(blockEntity, [ut.Core2D.TransformLocalPosition, ut.Core2D.Sprite2DRenderer, Block]
                , (transformPos, spriteRenderer, block) => {
                    transformPos.position = pos;

                    spriteRenderer.color = blockConfig.color;

                    block.blockConfig = blockConfig;
                });
        }

        static CreateBall(world: ut.World) : ut.Entity {
            let ballEntity = ut.EntityGroup.instantiate(world, "BB.Ball")[0];

            world.setEntityName(ballEntity, `ball_${ballEntity.index}_${ballEntity.version}`); 

            return ballEntity;
        }

        /**
         * Spawn a ball entity from ball entity prefab.
         * @param world 
         * @param gameContext 
         * @param pos 
         * @param dir Target moment direction。 No normalized.
         */
        static SpawnBall(world: ut.World, gameContext: GameContext, pos: Vector3, dir: Vector3) : ut.Entity {
            let ballEntity = GameService.CreateBall(world);

            world.setEntityName(ballEntity, `ball_${ballEntity.index}_${ballEntity.version}`);
 
            world.usingComponentData(ballEntity, [Ball, BB.Movement, ut.Core2D.TransformLocalPosition]
                , (ball, movement, transformPos) => {
                    movement.speed = gameContext.ballSpeed;

                    movement.dir = dir.normalize();

                    GameService.MovementTeleport(transformPos, movement, pos);
                });

            gameContext.ballCutAmount += 1;

            return ballEntity;
        }
 
        static GenRandomDir(rRange: ut.Math.Range): Vector3 {

            let randomEular = rRange.start + Math.random() * (rRange.end - rRange.start);

            let VECTOR_FORWARD = new Vector3(0, 0, 1);

            return new Vector3(0, 1, 0).applyAxisAngle(VECTOR_FORWARD, Math.PI / 180 * randomEular);
        }

        static CreateProp(world: ut.World, gameContext: GameContext, propType: PropType, pos: Vector3): void {
            let propEntity = ut.EntityGroup.instantiate(world, "BB.Prop")[0];

            world.usingComponentData(propEntity, [Prop, Movement, ut.Core2D.TransformLocalPosition]
                , (prop, moment, tranformPos) => {
                    moment.speed = gameContext.giftSpeed;

                    moment.dir = new Vector3(0, -1, 0);

                    tranformPos.position = pos;

                    prop.type = propType;
                });
        }

        static MovementTeleport(transformPos: ut.Core2D.TransformLocalPosition, movement: Movement, pos: Vector3) {
            movement.prePos = pos;

            transformPos.position = pos;
        }

        static ReceiveProp(world:ut.World, prop:Prop, gameContext: GameContext) : void {
            switch(prop.type) {
                case PropType.expand:
                    SkillServices.IncreasBall(world, gameContext);
                    break;
            }
        }

        static LoseBall(world:ut.World, ballEntity:ut.Entity, gameContext:GameContext) : void {
            gameContext.ballCutAmount -= 1;

            world.destroyEntity(ballEntity);
        }
    }
}
