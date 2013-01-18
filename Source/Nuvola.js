function Nuvola(instanceFromStage, stage, loader) {

    var stage = stage;
    var loader = loader;
    var instanceFromStage = instanceFromStage;

    var States = {
        left: 0,
        right: 1
    }

    var state = States.left;
    if (Math.random() < 0.5 ) {
        state = States.right;
    }

    var originalPosition = instanceFromStage.getPosition().i;
    var randomOffset = Math.random()*10 + 5;

    var calcoloMin = originalPosition - randomOffset;
    if (calcoloMin < 1) {
        calcoloMin = 1;
    };

    var calcoloMax = originalPosition + randomOffset;
    var maxTilesInStage = stage.getView().getWidth()/16 - 9;
    if (calcoloMax > maxTilesInStage) {
        calcoloMax = maxTilesInStage;
    };

    var RangeSpostamento = {
        min: calcoloMin,
        max: calcoloMax
    }

    var velocity = Math.random()*0.9 + 0.1;

    /*
    var nuvolaSize = {
        x: 0,
        y: -0.6,
        w: 2.4,
        h: 2
    };

    var nuvola = instanceFromStage.getEntity();
    nuvola.getRealBoundingBox().i0 = nuvolaSize.x;
    nuvola.getRealBoundingBox().j0 = nuvolaSize.y;
    nuvola.getRealBoundingBox().iSpan = nuvolaSize.w;
    nuvola.getRealBoundingBox().jSpan = nuvolaSize.h;
    */

    //

    this.update = function(delta) {

        var xPip = instanceFromStage.getPosition().i;

        if (xPip > RangeSpostamento.min && state == States.left) {
            instanceFromStage.getPosition().i -= delta * velocity;

        } else if (xPip <= RangeSpostamento.min && state == States.left) {
            state = States.right;
            //instanceFromStage = instanceFromStage.replaceWith(pipistrello_dx);

        } else if (xPip < RangeSpostamento.max && state == States.right) {
            instanceFromStage.getPosition().i += delta * velocity;

        } else if (xPip >= RangeSpostamento.max && state == States.right) {
            state = States.left;
            //instanceFromStage = instanceFromStage.replaceWith(pipistrello_sx);
        }
    };

    //Per il debug
    this.drawBoundingBox = function(context) {
        instanceFromStage.drawBoundingBox(stage.getView(), context)
    };
}

Nuvola.keys = {
    id_nuvola_grande: "nuvola-grande",
    id_nuvola_media: "nuvola-media",
    id_nuvola_piccola: "nuvola-piccola"
};