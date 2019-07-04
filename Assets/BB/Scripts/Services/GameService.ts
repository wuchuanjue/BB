
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

            let gameReferences = world.getConfigData(GameReferences);

            gameReferences.hitBlockAudioEntity = world.getEntityByName("HitBlockAudio");

            gameReferences.receivePropAudioEntity = world.getEntityByName("ReceivePropAudio");

            ut.EntityGroup.instantiate(world, GameService.Game_EG_NAME);

            ut.EntityGroup.instantiate(world, "BB.UIMain");

            GameService.blockPrefabEntity = world.getEntityByName("Block");

            gameReferences.platformEntity = world.getEntityByName("Platform");

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
                                transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y - layoutInfo.gameContentRect.height * 0.5, 0);
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
                                transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y + layoutInfo.gameContentRect.height * 0.5, 0);
                                spriteOptions.size = new Vector2(layoutInfo.canvasSize.x, spriteOptions.size.y);
                                break;
                        }
                    });
            }

            {
                //platform
                world.forEach([Platform, ut.Core2D.TransformLocalPosition, ut.Core2D.Sprite2DRendererOptions, TouchMovement]
                    , (platform, transformPos, spriteOptions, touchMovement) => {
                        transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y - layoutInfo.gameContentRect.height * 0.5 + 1);

                        touchMovement.moveRange = new ut.Math.Rect(0, 0, layoutInfo.canvasSize.x, 0);

                        touchMovement.size = new Vector2(spriteOptions.size.x, 0);
                    });
            }

            {
                //ball
                // GameService.SpawnIdleBall(world, gameContext, gameReferences.platformEntity);

                // for(let i = 0; i < 30; i++) {
                GameService.SpawnBall(world, gameContext, 
                    new Vector3(0, layoutInfo.gameContentRect.y - layoutInfo.gameContentRect.height * 0.5 + 2), GameService.GenRandomDir(new ut.Math.Range(-20,20))
                );
                // }
            }

            // {

            GameService.SetupTestBlocks(world, layoutInfo, gameContext);

            //     {
            //         let levels = world.getConfigData(Levels);

            //         let json = JSON.parse(levels.level0);

            //         GameService.SetupBlocksFromJson(world, layoutInfo, gameContext, json);
            //     }
            // }

            world.setConfigData(gameReferences);
        }

        static SetupBlocksFromJson(world: ut.World, layoutInfo: LayoutInfo, gameContext: GameContext, json: any) {
            gameContext.blockAmount = 0;

            let blockInfo = new BlockConfig();

            let blocks = json.blocks;

            let collisionBorderInRow: any = {};
            let collisionBorderInCol: any = {};

            for (var i = 0; i < 900; i++) {
                let block = blocks[i];

                blockInfo.row = block.row + 4;

                blockInfo.col = block.col + 2;

                BlockService.CheckCollisionBorderInfo(collisionBorderInRow, collisionBorderInCol, blockInfo.row, blockInfo.col);

                blockInfo.color = new ut.Core2D.Color(block.color.r / 255, block.color.g / 255, block.color.b / 255, 1);

                blockInfo.isWall = false;

                GameService.SpawnBlock(world, layoutInfo, blockInfo);

                gameContext.blockAmount += 1;
            }

            // for (var j = 0; j < 34; j++) {
            //     if (j > 13 && j < 20)
            //         continue;

            for (var j = 0; j < 23; j++) {

                blockInfo.row = 0;

                blockInfo.col = j + 5;

                blockInfo.isWall = true;

                blockInfo.color = new ut.Core2D.Color(0.3, 0.3, 0.3, 1);

                let entity = GameService.SpawnBlock(world, layoutInfo, blockInfo);

                world.addComponent(entity, ut.HitBox2D.Sprite2DRendererHitBox2D);
            }

            for (const key of Object.keys(collisionBorderInRow)) {
                BlockService.OpenBlockCollision(world, Number(key), collisionBorderInRow[key][0]);

                BlockService.OpenBlockCollision(world, Number(key), collisionBorderInRow[key][1]);
            }

            for (const key of Object.keys(collisionBorderInCol)) {
                BlockService.OpenBlockCollision(world, collisionBorderInCol[key][0], Number(key));

                BlockService.OpenBlockCollision(world, collisionBorderInCol[key][1], Number(key));
            }
        }

        static SetupTestBlocks(world: ut.World, layoutInfo: LayoutInfo, gameContext: GameContext) {
            let collisionBorderInRow: any = {};
            let collisionBorderInCol: any = {};

            let blockInfo = new BlockConfig();

            for (var row: number = 0; row < 1; row++) {
                for (var col: number = 0; col < 30; col++) {
                    BlockService.CheckCollisionBorderInfo(collisionBorderInRow, collisionBorderInCol, row, col);

                    blockInfo.col = col;
                    blockInfo.row = row;
                    blockInfo.color = new ut.Core2D.Color(1, 1, 1, 0.05);
                    blockInfo.isWall = true;

                    GameService.SpawnBlock(world, layoutInfo, blockInfo);

                    gameContext.blockAmount += 1;
                }
            }

            for (const key of Object.keys(collisionBorderInRow)) {
                BlockService.OpenBlockCollision(world, Number(key), collisionBorderInRow[key][0]);

                BlockService.OpenBlockCollision(world, Number(key), collisionBorderInRow[key][1]);
            }

            for (const key of Object.keys(collisionBorderInCol)) {
                BlockService.OpenBlockCollision(world, collisionBorderInCol[key][0], Number(key));

                BlockService.OpenBlockCollision(world, collisionBorderInCol[key][1], Number(key));
            }
        }

        static SpawnIdleBall(world: ut.World, gameContext: GameContext, platformEntity: ut.Entity): ut.Entity {
            let entity = GameService.SpawnBall(
                //停住 platform下的局部位置
                world, gameContext, new Vector3(0, 0.2, 0), new Vector3(0, 0, 0)
            );

            world.addComponent(entity, IdleBall);

            let transformNode = new ut.Core2D.TransformNode(platformEntity);

            world.setComponentData(entity, transformNode);

            return entity;
        }

        /**
         * 数据结构待优化. TODO
         * @param world 
         * @param layoutInfo 
         * @param blockInfo 
         */
        static SpawnBlock(world: ut.World, layoutInfo: LayoutInfo, blockConfig: BlockConfig): ut.Entity {
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

            return GameService.CreateBlock(world, BlockService.GenBlockName(blockConfig.row, blockConfig.col), pos, blockConfig);
        }

        static CreateBlock(world: ut.World, id: string, pos: Vector3, blockConfig: BlockConfig): ut.Entity {
            let blockEntity = world.instantiateEntity(GameService.blockPrefabEntity);

            world.setEntityName(blockEntity, id);

            world.usingComponentData(blockEntity, [ut.Core2D.TransformLocalPosition, ut.Core2D.Sprite2DRenderer, Block]
                , (transformPos, spriteRenderer, block) => {
                    transformPos.position = pos;

                    spriteRenderer.color = blockConfig.color;

                    block.blockConfig = blockConfig;
                });

            return blockEntity;
        }

        static CreateBall(world: ut.World): ut.Entity {
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
        static SpawnBall(world: ut.World, gameContext: GameContext, pos: Vector3, dir: Vector3): ut.Entity {
            let ballEntity = GameService.CreateBall(world);

            world.usingComponentData(ballEntity, [Ball, BB.Movement, ut.Core2D.TransformLocalPosition]
                , (ball, movement, transformPos) => {
                    movement.speed = gameContext.ballSpeed;

                    movement.dir = dir.normalize();

                    transformPos.position = pos;
                });
 
            gameContext.ballCutAmount += 1;

            return ballEntity;
        }

        static GenRandomDir(rRange: ut.Math.Range): Vector3 {

            let randomEular = rRange.start + Math.random() * (rRange.end - rRange.start);

            let VECTOR_FORWARD = new Vector3(0, 0, 1);

            return new Vector3(0, 1, 0).applyAxisAngle(VECTOR_FORWARD, Math.PI / 180 * randomEular);
        }

        static SpawnProp(world: ut.World, gameContext: GameContext, propType: PropType, pos: Vector3): void {
            let propEntity = ut.EntityGroup.instantiate(world, "BB.Prop")[0];

            world.usingComponentData(propEntity, [Prop, Movement, ut.Core2D.TransformLocalPosition, ut.Core2D.Sprite2DRenderer]
                , (prop, moment, tranformPos, spriteRenderer) => {
                    moment.speed = gameContext.giftSpeed;

                    moment.dir = new Vector3(0, -1, 0);

                    tranformPos.position = pos;

                    prop.type = propType;

                    spriteRenderer.sprite = world.getEntityByName(`assets/sprites/Default/Prop_${propType}`);
                });
        }
 
        static ReceiveProp(world: ut.World, prop: Prop, gameContext: GameContext): void {
            switch (prop.type) {
                case PropType.expand:
                    SkillServices.SplitBall(world, gameContext);
                    break;
                case PropType.shoot3:
                    SkillServices.ShootThreeBall(world, gameContext);
                    break;
            }
        }

        static LoseBall(world: ut.World, ballEntity: ut.Entity, gameContext: GameContext): void {
            gameContext.ballCutAmount -= 1;

            world.destroyEntity(ballEntity);
        }

    }
}
