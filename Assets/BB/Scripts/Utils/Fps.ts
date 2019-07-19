
namespace BB {

    export class FpsFilter extends ut.EntityFilter {
        fps: FpsDisplay;
        textRenderer: ut.Text.Text2DRenderer
        // entity:ut.Entity
    }
 
    export class Fps extends ut.ComponentBehaviour {

        data: FpsFilter;

        fpsMeasurePeriod:number = 0.5;
        fpsAccumulator:number = 0;
        fpsNextPeriod:number = 0;

        // this method is called for each entity matching the FpsFilter signature, once when enabled
        OnEntityEnable():void { 
            this.fpsNextPeriod = this.scheduler.now() + this.fpsMeasurePeriod;

            console.log("Fps enable.");
        }
        
        // this method is called for each entity matching the FpsFilter signature, every frame it's enabled
        OnEntityUpdate():void { 
            this.fpsAccumulator++;

            if (this.scheduler.now() > this.fpsNextPeriod)
            {
                let currentFps = this.fpsAccumulator / this.fpsMeasurePeriod;

                this.fpsAccumulator = 0;

                this.fpsNextPeriod += this.fpsMeasurePeriod;
                
                this.data.textRenderer.text = currentFps.toString();
            }
        }

        // this method is called for each entity matching the FpsFilter signature, once when disabled
        OnEntityDisable():void { 
            this.data.textRenderer.text = "";
        }

    }
}
