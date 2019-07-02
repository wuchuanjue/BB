
namespace BB {
    
    /**
     * 
     */
    @ut.executeAfter(ut.Shared.UserCodeStart)
    @ut.executeBefore(ut.Shared.UserCodeEnd)
    export class SkillSystem extends ut.ComponentSystem {
        
        //TODO 只能触发一个skill，待更改
        OnUpdate():void {
            this.world.forEach([ut.Entity, SkillTrigger],(entity, skillTrigger)=>{
                switch(skillTrigger.fromProp) {
                    case PropType.expand:
                        SkillServices.IncreasBall(this.world, this.world.getConfigData(GameContext));
                        break;
                }

                this.world.removeComponent(entity, SkillTrigger);
            });
        }
    }
}
