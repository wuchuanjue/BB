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
 
        /**
         * UIControl 监听按钮事件在发布版下有bug。 临时解决，在update中监听click。
         * @param world 
         * @param entity 
         */
        static DetectMouseInteraction(world:ut.World, entity:ut.Entity) : ut.UIControls.MouseInteraction {
            return world.getComponentData(entity, ut.UIControls.MouseInteraction);
        }
    }
}