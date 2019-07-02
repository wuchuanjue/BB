namespace BB {
    export class BlockService {
        static GenBlockName(row:number, col:number) : string {
            return `block_${col}_${row}`;
        }

        static GetBlockFromLocation(world:ut.World, row:number, col:number) : ut.Entity {
            return world.getEntityByName(BlockService.GenBlockName(row, col));
        }
    }
}
