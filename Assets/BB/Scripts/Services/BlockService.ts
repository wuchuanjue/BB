namespace BB {
    export class BlockService {
        static GenBlockName(row:number, col:number) : string {
            return `block_${col}_${row}`;
        }

        static GetBlockFromLocation(world:ut.World, row:number, col:number) : ut.Entity {
            return world.getEntityByName(BlockService.GenBlockName(row, col));
        }

        static TestMarkBlock(world:ut.World, blockEntity: ut.Entity, randomColor:boolean = false) : void {
            let spriteRenderer = world.getComponentData(blockEntity, ut.Core2D.Sprite2DRenderer);

            if(randomColor)
                spriteRenderer.color = new ut.Core2D.Color(Math.random(),Math.random(),0,0.2);
            else
                spriteRenderer.color = new ut.Core2D.Color(1,0,0,0.1);

            world.setComponentData(blockEntity, spriteRenderer);
        }

        static OpenBlockCollision(world: ut.World, row:number, col:number) : void {
            let entity = world.getEntityByName(BlockService.GenBlockName(row, col));

            if(entity.isNone())
                return;

            if(!world.hasComponent(entity, ut.HitBox2D.Sprite2DRendererHitBox2D)) {
                world.addComponent(entity, ut.HitBox2D.Sprite2DRendererHitBox2D);

                //test
                // BlockService.TestMarkBlock(world,entity);
            }
        }

        static OpenBlockCollisionAroundBlock(world: ut.World, block: Block) : void {
            BlockService.OpenBlockCollision(world, block.blockConfig.row + 1, block.blockConfig.col);
            BlockService.OpenBlockCollision(world, block.blockConfig.row - 1, block.blockConfig.col);
            BlockService.OpenBlockCollision(world, block.blockConfig.row, block.blockConfig.col + 1);
            BlockService.OpenBlockCollision(world, block.blockConfig.row, block.blockConfig.col - 1);
        }

        static CheckCollisionBorderInfo(collisionBorderInRow: any, collisionBorderInCol: any, row:number, col:number) : void {
            if (collisionBorderInRow[row] == null) {
                collisionBorderInRow[row] = new Array<number>(2);
            }

            if(collisionBorderInCol[col] == null) {
                collisionBorderInCol[col] = new Array<number>(2);
            }

            let leftMostInRow = collisionBorderInRow[row][0];
            
            let rightMostInRow = collisionBorderInRow[row][1];

            let bottomMostInCol = collisionBorderInCol[col][0];
            
            let topMostInCol = collisionBorderInCol[col][1];

            if (leftMostInRow == undefined || leftMostInRow > col) {
                //left
                collisionBorderInRow[row][0] = col;

                // console.log(`update leftmost in row. row:${row} col:${col}`);
            }
            else if (rightMostInRow == undefined || rightMostInRow < col) {
                //right
                collisionBorderInRow[row][1] = col;

                // console.log(`update rightmost in row. row:${row} col:${col}`);
            }

            if(bottomMostInCol == undefined || bottomMostInCol > row ) {
                collisionBorderInCol[col][0] = row;
            }
            else if(topMostInCol == undefined || topMostInCol < row) {
                collisionBorderInCol[col][1] = row;
            }
        }
    }
}
