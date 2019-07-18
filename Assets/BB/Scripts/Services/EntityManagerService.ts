namespace BB {
    export class EntityManagerService {
        static SpawnIdleBall(world: ut.World, gameContext: GameContext): ut.Entity {
            let entity = EntityManagerService.SpawnBall(
                //停住 platform下的局部位置
                world, gameContext, new Vector3(0, 0.2, 0), new Vector3(0, 0, 0)
            );

            world.addComponent(entity, IdleBall);

            let transformNode = new ut.Core2D.TransformNode(world.getConfigData(GameReferences).platformEntity);

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

            if (Math.abs(randomEular) == 90 || Math.abs(randomEular) == 180 || Math.abs(randomEular) == 0) {
                console.warn("test GenRandomDir  randomEular:" + randomEular);
                randomEular += 1;
            }

            let VECTOR_FORWARD = new Vector3(0, 0, 1);

            return new Vector3(0, 1, 0).applyAxisAngle(VECTOR_FORWARD, Math.PI / 180 * randomEular);
        }

        static SpawnProp(world: ut.World, gameContext: GameContext, propType: PropType, pos: Vector3): void {
            gameContext.propAmount += 1;

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

        static ResetPlatform(world: ut.World, gameContext: BB.GameContext, layoutInfo: LayoutInfo) : void {
            world.usingComponentData(world.getConfigData(GameReferences).platformEntity, [ut.Core2D.TransformLocalPosition, ut.Core2D.Sprite2DRendererOptions, TouchMovement],
                (transformPos, spriteOptions, touchMovement) => {
                    transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y - layoutInfo.gameContentRect.height * 0.5 + 2);

                    touchMovement.moveRange = new ut.Math.Rect(0, 0, layoutInfo.gameContentRect.width, 0);

                    touchMovement.size = new Vector2(spriteOptions.size.x, 0);
                });
        }

        static SetupGameEntitys(world: ut.World, gameContext: BB.GameContext, layoutInfo: LayoutInfo): void {
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
                world.forEach([ut.Entity, Border, ut.Core2D.TransformLocalPosition]
                    , (entity, border, transformPos) => {
                        let spriteOptions = world.getComponentData(entity, ut.Core2D.Sprite2DRendererOptions);

                        switch (border.Dir) {
                            case 2:
                                transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y - layoutInfo.gameContentRect.height * 0.5, 0);
                                spriteOptions.size = new Vector2(layoutInfo.gameContentRect.width, spriteOptions.size.y);
                                break;
                            case 4:
                                transformPos.position = new Vector3(layoutInfo.gameContentRect.x - layoutInfo.gameContentRect.width * 0.5 - spriteOptions.size.x * 0.5, 0, 0);
                                spriteOptions.size = new Vector2(spriteOptions.size.x, layoutInfo.gameContentRect.height);
                                break;
                            case 6:
                                transformPos.position = new Vector3(layoutInfo.gameContentRect.x + layoutInfo.gameContentRect.width * 0.5 + spriteOptions.size.x * 0.5, 0, 0);
                                spriteOptions.size = new Vector2(spriteOptions.size.x, layoutInfo.gameContentRect.height);
                                break;
                            case 8:
                                transformPos.position = new Vector3(0, layoutInfo.gameContentRect.y + layoutInfo.gameContentRect.height * 0.5, 0);
                                spriteOptions.size = new Vector2(layoutInfo.gameContentRect.width, spriteOptions.size.y);
                                break;
                        }

                        world.setComponentData(entity, spriteOptions);
                    });
            }
 
            {
                //todo 改成动态加载
                let levelConfig = world.getConfigData(LevelConfig);

                let json: any;

                console.assert(gameContext.cutLvl > 0 && gameContext.cutLvl <= levelConfig.levels.length);

                json = JSON.parse(levelConfig.levels[gameContext.cutLvl - 1]);

                EntityManagerService.SetupBlocksFromJson(world, layoutInfo, gameContext, json);
            }


            world.setConfigData(gameReferences);
        }

        static SetupBlocksFromJson(world: ut.World, layoutInfo: LayoutInfo, gameContext: GameContext, json: any) {
            gameContext.blockAmount = 0;

            let palettes = json.palette;

            //是否开启碰撞考虑放到配置文件中 TODO
            let blockCache = {};

            let doSetupBlocks = (blockList: any, isWall: boolean, ) => {
                if (blockList == undefined || blockList == null)
                    return;

                let blockInfo = new BlockConfig();

                for (const key in blockList) {
                    if (blockList.hasOwnProperty(key)) {
                        const block = blockList[key];

                        blockInfo.row = block.row;

                        blockInfo.col = block.col;

                        const blockColor = palettes[block.palette];

                        blockInfo.color = new ut.Core2D.Color(blockColor.r / 255, blockColor.g / 255, blockColor.b / 255, 1);

                        blockInfo.isWall = isWall;

                        blockCache[`${blockInfo.col}_${blockInfo.row}`] = EntityManagerService.SpawnBlock(world, layoutInfo, blockInfo);

                        if (!isWall)
                            gameContext.blockAmount += 1;
                    }
                }
            };

            doSetupBlocks(json.blocks, false);

            doSetupBlocks(json.borders, true);

            BlockService.UpdateBlocksCollision(world, blockCache);
        }

        static ClearGameEntitys(world: ut.World): void {
            EntityManagerService.ClearProps(world);

            ut.EntityGroup.destroyAll(world, "BB.Game");
            ut.EntityGroup.destroyAll(world, "BB.Ball")
        }
    }
}