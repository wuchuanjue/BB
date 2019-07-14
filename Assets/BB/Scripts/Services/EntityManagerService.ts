namespace BB {
    export class EntityManagerService {
        static SpawnIdleBall(world: ut.World, gameContext: GameContext, platformEntity: ut.Entity): ut.Entity {
            let entity = EntityManagerService.SpawnBall(
                //停住 platform下的局部位置
                world, gameContext, new Vector3(0, 0.2, 0), new Vector3(0, 0, 0)
            );

            world.addComponent(entity, IdleBall);

            let transformNode = new ut.Core2D.TransformNode(platformEntity);

            world.setComponentData(entity, transformNode);

            return entity;
        }

        /**
         * 
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

            return EntityManagerService.CreateBlock(world, BlockService.GenBlockName(blockConfig.row, blockConfig.col), pos, blockConfig);
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
            let ballEntity = EntityManagerService.CreateBall(world);

            world.usingComponentData(ballEntity, [Ball, BB.Movement, ut.Core2D.TransformLocalPosition, ut.HitBox2D.RectHitBox2D]
                , (ball, movement, transformPos, hitBox2D) => {
                    movement.speed = gameContext.ballSpeed;

                    movement.dir = dir.normalize();

                    transformPos.position = pos;

                    BallService.UpdateHitRectByMoment(hitBox2D, movement);
                });
 
            gameContext.ballCutAmount += 1;

            return ballEntity;
        }

        static GenRandomDir(rRange: ut.Math.Range): Vector3 {
            let randomEular = rRange.start + Math.random() * (rRange.end - rRange.start);

            if(Math.abs(randomEular) == 90 || Math.abs(randomEular) == 180 || Math.abs(randomEular) == 0) {
                console.warn("test GenRandomDir  randomEular:" + randomEular);
                randomEular += 1;
            }

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

        static ClearProps(world: ut.World): void {
            ut.EntityGroup.destroyAll(world, "BB.Prop");
        }

        static SetupGameEntitys(world: ut.World, gameContext: BB.GameContext): void {
            let layoutInfo = world.getConfigData(LayoutInfo);

            ut.EntityGroup.instantiate(world, "BB.Game");
            
            GameService.blockPrefabEntity = world.getEntityByName("Block");
            
            let bgEntity = world.getEntityByName("BG");
            
            let gameReferences = world.getConfigData(GameReferences);
            
            gameReferences.hitBlockAudioEntity = world.getEntityByName("HitBlockAudio");
            
            gameReferences.receivePropAudioEntity = world.getEntityByName("ReceivePropAudio");
            
            gameReferences.platformEntity = world.getEntityByName("Platform");

            console.assert(!bgEntity.isNone(), "Can not find bg entity.");

            console.assert(!GameService.blockPrefabEntity.isNone(), "Can not find block prefab.");

            //gamecontent背景
            world.usingComponentData(bgEntity, [ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale]
                , (transPos, transScale) => {

                    transPos.position = new Vector3(layoutInfo.gameContentRect.x, layoutInfo.gameContentRect.y);

                    transScale.scale = new Vector3(layoutInfo.gameContentRect.width, layoutInfo.gameContentRect.height);
                });

            {
                //修改方块原型的尺寸
                let blockPrefabTransformScale = world.getComponentData(GameService.blockPrefabEntity, ut.Core2D.TransformLocalScale);

                blockPrefabTransformScale.scale = new Vector3(layoutInfo.blockSize, layoutInfo.blockSize, 1);

                world.setComponentData(GameService.blockPrefabEntity, blockPrefabTransformScale);
            }

            {
                //border
                world.forEach([ut.Entity, Border, ut.Core2D.TransformLocalPosition] //ut.Core2D.Sprite2DRendererOptions
                    , (entity, border, transformPos) => {           //spriteOptions
                        let spriteOptions = world.getComponentData(entity, ut.Core2D.Sprite2DRendererOptions);

                        switch (border.Dir) {
                            case 2:
                                transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y - layoutInfo.gameContentRect.height * 0.5, 0);
                                spriteOptions.size = new Vector2(layoutInfo.canvasSize.x, spriteOptions.size.y);
                                break;
                            case 4:
                                transformPos.position = new Vector3(layoutInfo.gameContentRect.x - layoutInfo.gameContentRect.width * 0.5 - spriteOptions.size.x * 0.5, 0, 0);
                                spriteOptions.size = new Vector2(spriteOptions.size.x, layoutInfo.canvasSize.y);
                                break;
                            case 6:
                                transformPos.position = new Vector3(layoutInfo.gameContentRect.x + layoutInfo.gameContentRect.width * 0.5 + spriteOptions.size.x * 0.5, 0, 0);
                                spriteOptions.size = new Vector2(spriteOptions.size.x, layoutInfo.canvasSize.y);
                                break;
                            case 8:
                                transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y + layoutInfo.gameContentRect.height * 0.5, 0);
                                // spriteOptions.size = new Vector2(layoutInfo.canvasSize.x, spriteOptions.size.y);
                                break;
                        }
                    });
            }

            {
                world.usingComponentData(gameReferences.platformEntity, [ut.Core2D.TransformLocalPosition,ut.Core2D.Sprite2DRendererOptions, TouchMovement],
                    (transformPos, spriteOptions, touchMovement)=>{
                        transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y - layoutInfo.gameContentRect.height * 0.5 + 1);

                        touchMovement.moveRange = new ut.Math.Rect(0, 0, layoutInfo.gameContentRect.width, 0);

                        touchMovement.size = new Vector2(spriteOptions.size.x, 0);
                });
            }

            {
                //ball
                EntityManagerService.SpawnIdleBall(world, gameContext, gameReferences.platformEntity);
            }

            {

                // GameService.SetupTestBlocks(world, layoutInfo, gameContext);

                {
                    let levels = world.getConfigData(Levels);

                    let json : any;

                    switch(gameContext.cutLvl) {
                        case 1:
                            json = JSON.parse(levels.level0);
                            break;
                        case 2:
                            json = JSON.parse(levels.level1);
                            break;
                    }
                    

                    EntityManagerService.SetupBlocksFromJson(world, layoutInfo, gameContext, json);
                }
            }

            world.setConfigData(gameReferences);
        }

        static SetupBlocksFromJson(world: ut.World, layoutInfo: LayoutInfo, gameContext: GameContext, json: any) {
            gameContext.blockAmount = 0;

            let blockInfo = new BlockConfig();

            let blocks = json.blocks;

            //是否开启碰撞考虑放到配置文件中 TODO
            let testBlockCache = {};

            for (const key in blocks) {
                if (blocks.hasOwnProperty(key)) {
                    const block = blocks[key];

                    blockInfo.row = block.row;

                    blockInfo.col = block.col;

                    blockInfo.color = new ut.Core2D.Color(block.color.r / 255, block.color.g / 255, block.color.b / 255, 1);

                    blockInfo.isWall = false;

                    testBlockCache[`${blockInfo.col}_${blockInfo.row}`] = EntityManagerService.SpawnBlock(world, layoutInfo, blockInfo);

                    gameContext.blockAmount += 1;
                }
            }

            let borders = json.borders;

            if (borders != undefined) {
                for (const key in borders) {
                    if (borders.hasOwnProperty(key)) {
                        const block = borders[key];

                        blockInfo.row = block.row;

                        blockInfo.col = block.col;

                        blockInfo.color = new ut.Core2D.Color(block.color.r / 255, block.color.g / 255, block.color.b / 255, 1);

                        blockInfo.isWall = true;

                        testBlockCache[`${blockInfo.col}_${blockInfo.row}`] = EntityManagerService.SpawnBlock(world, layoutInfo, blockInfo);
                    }
                }
            }

            BlockService.UpdateBlocksCollision(world, testBlockCache);
        }

        static SetupTestBlocks(world: ut.World, layoutInfo: LayoutInfo, gameContext: GameContext) {
            let blockInfo = new BlockConfig();

            let testBlockCache = {};

            for (var row: number = 0; row < 3; row++) {
                for (var col: number = 0; col < 3; col++) {

                    blockInfo.col = col;
                    blockInfo.row = row;

                    blockInfo.color = new ut.Core2D.Color(1, 1, 1, 1);
                    blockInfo.isWall = true;

                    testBlockCache[`${col}_${row}`] = EntityManagerService.SpawnBlock(world, layoutInfo, blockInfo);

                    gameContext.blockAmount += 1;
                }
            }

            BlockService.UpdateBlocksCollision(world, testBlockCache);
        }

        static ClearGameEntitys(world: ut.World): void {
            EntityManagerService.ClearProps(world);

            ut.EntityGroup.destroyAll(world, "BB.Game");
            ut.EntityGroup.destroyAll(world, "BB.Ball")
        }
    }
}