
namespace BB {

    export class PassLevelUIBehaviourFilter extends ut.EntityFilter {
        ui: PassLevelUI;
    }

    export class PassLevelUIBehaviour extends ut.ComponentBehaviour {

        data: PassLevelUIBehaviourFilter;

        // ComponentBehaviour lifecycle events
        // uncomment any method you need
        
        // this method is called for each entity matching the PassLevelUIBehaviourFilter signature, once when enabled
        OnEntityEnable():void { 
            let lvlAmount = this.world.getConfigData(Levels).levelAmount;

            let context = this.world.getConfigData(GameContext);
            
            if(lvlAmount == context.cutLvl - 1) {
                console.warn("-----------");
            }

            ut.UIControls.UIControlsService.addOnClickCallback(this.world, this.data.ui.nextButton, (entity: ut.Entity) => {
                 

                this.world.setConfigData(context);
            });

            ut.UIControls.UIControlsService.addOnClickCallback(this.world, this.data.ui.homeButton, (entity: ut.Entity) => {
                
            });
        }
        
        // this method is called for each entity matching the PassLevelUIBehaviourFilter signature, every frame it's enabled
        // OnEntityUpdate():void { }

        // this method is called for each entity matching the PassLevelUIBehaviourFilter signature, once when disabled
        // OnEntityDisable():void { }

    }
}
