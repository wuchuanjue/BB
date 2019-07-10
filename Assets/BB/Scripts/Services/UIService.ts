namespace BB {
    export class UIService {
        static Show(world:ut.World, ui:string) {
            if(world.exists(world.getEntityByName(ui)))
                return;

             ut.EntityGroup.instantiate(world,"BB." + ui);
        }

        static Hide(world:ut.World, ui:string) {
            if(!world.exists(world.getEntityByName(ui)))
                return;

            ut.EntityGroup.destroyAll(world,"BB." + ui);
        }
    }
}