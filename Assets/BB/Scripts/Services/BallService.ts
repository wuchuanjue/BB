namespace BB {
    export class BallService {
        static UpdateHitRectByMoment(refHitBoxRect:ut.HitBox2D.RectHitBox2D, moment:Movement) : void {
            let frontPos = new Vector3().addScaledVector(moment.dir, moment.speed * 0.04);

            let boxRect = refHitBoxRect.box as ut.Math.Rect;

            boxRect.x = frontPos.x - boxRect.width * 0.5;

            boxRect.y = frontPos.y - boxRect.height * 0.5;

            refHitBoxRect.box = boxRect;
        }
    }
}