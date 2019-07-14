
namespace BB {

    export class GameUIBehaviourFilter extends ut.EntityFilter {
        ui:GameUI;
    }

    export class GameUIBehaviour extends ut.ComponentBehaviour {

        data: GameUIBehaviourFilter;

        UpdateIcons(gameContext:GameContext):void {
            let life = gameContext.cutLife;

            if(life == this.data.ui.lifeIcons.length)
                return;

            console.log(`UpdateLifeIcons life:${life}`);

            while(life != this.data.ui.lifeIcons.length) {
                if(life > this.data.ui.lifeIcons.length) {
                    let lifeIconPrefab = this.data.ui.lifeIcons[0];
    
                    let recttransform = this.world.getComponentData(lifeIconPrefab, ut.UILayout.RectTransform);
    
                    if(lifeIconPrefab == null || !this.world.exists(lifeIconPrefab)) {
                        console.error("todo");
     
                        return;
                    }
     
                    let icon =  this.world.instantiateEntity(lifeIconPrefab);
    
                    this.data.ui.lifeIcons.push(icon);
                    
                    this.world.setEntityName(icon, `lifeIcon${this.data.ui.lifeIcons.length}`);
    
                    recttransform.anchoredPosition = new Vector2(recttransform.anchoredPosition.x + (recttransform.sizeDelta.x + 10) * (this.data.ui.lifeIcons.length - 1), recttransform.anchoredPosition.y);
    
                    this.world.setOrAddComponentData(icon,recttransform);
                }
                else {
                    this.world.destroyEntity(this.data.ui.lifeIcons.pop());
                }
            }
        }
  
        // this method is called for each entity matching the GameUIBehaviourFilter signature, every frame it's enabled
        OnEntityUpdate():void { 
            let gameContext = this.world.getConfigData(GameContext);

            if(UIService.DetectMouseInteraction(this.world, this.data.ui.pauseBtn).clicked) {
                GameService.EnterState(this.world, gameContext, GameState.Pause);

                this.world.setConfigData(gameContext);
            }
  
            this.UpdateIcons(gameContext);
  
            this.world.usingComponentData(this.data.ui.testMsg, [ut.Text.Text2DRenderer] , (textRenderer)=>{
                textRenderer.text = `ball:${gameContext.ballCutAmount}   block:${gameContext.blockAmount}`;
            });
        }
    }
}
