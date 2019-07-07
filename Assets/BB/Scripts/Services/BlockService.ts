namespace BB {
    export class BlockService {
        static GenBlockName(row: number, col: number): string {
            return `block_${col}_${row}`;
        }

        static GetBlockFromLocation(world: ut.World, row: number, col: number): ut.Entity {
            return world.getEntityByName(BlockService.GenBlockName(row, col));
        }

        static TestMarkBlock(world: ut.World, blockEntity: ut.Entity, randomColor: boolean = false): void {
            let spriteRenderer = world.getComponentData(blockEntity, ut.Core2D.Sprite2DRenderer);

            if (randomColor)
                spriteRenderer.color = new ut.Core2D.Color(Math.random(), Math.random(), 0, 0.2);
            else
                spriteRenderer.color = new ut.Core2D.Color(1, 0, 0, 0.1);

            world.setComponentData(blockEntity, spriteRenderer);
        }

        static AddBlockEntityCollision(world: ut.World, entity: ut.Entity): void {
            if (!world.hasComponent(entity, ut.HitBox2D.Sprite2DRendererHitBox2D)) {
                world.addComponent(entity, ut.HitBox2D.Sprite2DRendererHitBox2D);
                //test
                // BlockService.TestMarkBlock(world, entity);
            }
        }

        /**
         * 
         * @param world 
         * @param row 
         * @param col 
         * @param area 方向
         */
        static AddBlockCollision(world: ut.World, row: number, col: number, area: number): void {
            let entity = world.getEntityByName(BlockService.GenBlockName(row, col));

            if (!world.exists(entity))
                return;

            if(!world.hasComponent(entity, AreaLocks)) {
                world.addComponent(entity, AreaLocks);
            }

            let areaLocks = world.getComponentData(entity, AreaLocks);

            switch(area) {
                case 2:
                    areaLocks.lock2 = false;
                    break;
                case 4:
                    areaLocks.lock4 = false;
                    break;
                case 8:
                    areaLocks.lock8 = false;
                    break;
                case 6:
                    areaLocks.lock6 = false;
                    break;
            }

            BlockService.AddBlockEntityCollision(world, entity);

            world.setComponentData(entity, areaLocks);
        }

        static AddAroundBlockCollision(world: ut.World, block: Block): void {
            BlockService.AddBlockCollision(world, block.blockConfig.row + 1, block.blockConfig.col, 2);
            BlockService.AddBlockCollision(world, block.blockConfig.row - 1, block.blockConfig.col, 8);
            BlockService.AddBlockCollision(world, block.blockConfig.row, block.blockConfig.col + 1, 4);
            BlockService.AddBlockCollision(world, block.blockConfig.row, block.blockConfig.col - 1, 6);
        }

        static UpdateBlocksCollision(world: ut.World, testBlockCache: any): void {
            for (const key in testBlockCache) {
                if (testBlockCache.hasOwnProperty(key)) {
                    let keyArr = key.split('_');
                    let col = Number(keyArr[0]);
                    let row = Number(keyArr[1]);

                    const entity = testBlockCache[key];

                    let top = testBlockCache[`${col}_${row + 1}`];
                    let bottom = testBlockCache[`${col}_${row - 1}`];
                    let right = testBlockCache[`${col + 1}_${row}`];
                    let left = testBlockCache[`${col - 1}_${row}`];

                    let areaLocks = new AreaLocks();

                    areaLocks.lock2 = areaLocks.lock4 = areaLocks.lock6 = areaLocks.lock8 = true;
 
                    let needCollision = false;

                    if (top == undefined) {
                        areaLocks.lock8 = false;

                        needCollision = true;
                    }

                    if (bottom == undefined) {
                        areaLocks.lock2 = false;

                        needCollision = true;
                    }

                    if (right == undefined) {
                        areaLocks.lock6 = false;

                        needCollision = true;
                    }

                    if (left == undefined) {
                        areaLocks.lock4 = false;

                        needCollision = true;
                    }

                    world.addComponentData(entity, areaLocks);

                    if(needCollision)
                        BlockService.AddBlockEntityCollision(world, entity);
                }
            }
        }
    }
}
