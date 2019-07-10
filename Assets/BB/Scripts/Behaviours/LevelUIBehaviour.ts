
namespace BB {

    export class LevelUIBehaviourFilter extends ut.EntityFilter {
        uiCanvas: ut.UILayout.UICanvas;
        ui: LevelUI;
    }

    export class LevelUIBehaviour extends ut.ComponentBehaviour {

        data: LevelUIBehaviourFilter;

        static ChoiseLevelButton(world:ut.World, lvl:number, entity:ut.Entity) : void {
            let context = world.getConfigData(GameContext);
 
            context.cutLvl = lvl;

            world.setConfigData(context);

            world.removeComponent(entity, ut.UIControls.MouseInteraction);
 
            console.log(`choise lvl:${lvl} go to state:${context.state}`);
        }
 
        OnEntityEnable(): void {
            console.log(`LevelUIBehaviour::OnEntityEnable`);

            // let textRenderer = this.world.getComponentData(this.data.ui.testButtonTextEntity,ut.Text.Text2DRenderer);

            // this.world.setComponentData(this.data.ui.testButtonTextEntity, textRenderer);

            ut.UIControls.UIControlsService.addOnClickCallback(this.world, this.data.ui.testButton0Entity, (entity: ut.Entity) => {
                LevelUIBehaviour.ChoiseLevelButton(this.world, 1, entity);
            });

            ut.UIControls.UIControlsService.addOnClickCallback(this.world, this.data.ui.testButton1Entity, (entity: ut.Entity) => {
                LevelUIBehaviour.ChoiseLevelButton(this.world, 2, entity);
            });
        }

        // OnEntityUpdate(): void {

        // }

        OnEntityDisable(): void {
            console.log(`LevelUIBehaviour::OnEntityDisable`);
        }
    }
}
