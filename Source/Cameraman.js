function Cameraman(instanceFromStage, gravity, stage, loader) {

    var stage = stage;
    var loader = loader;
    var instanceFromStage = instanceFromStage;
    instanceFromStage.getAcceleration().j = gravity;

    var vita = 100;
    var danno = 3;

    var velocity = 10;
    var spostamento = velocity * 1;
    var distanzaDaPersonaggio = 2;

    var cameramanSize = {
        x: 0,
        y: -16,
        w: 8.3,
        h: 19
    };
    var gap = 0.5;

    //
    var cameraman_fermo = stage.getEntity({
        id: Cameraman.keys.id_fermo
    });
    cameraman_fermo.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_fermo.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_fermo.getRealBoundingBox().iSpan = cameramanSize.w;
    cameraman_fermo.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_cammina = stage.getEntity({
        id: Cameraman.keys.id_cammina
    });
    cameraman_cammina.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_cammina.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_cammina.getRealBoundingBox().iSpan = cameramanSize.w;
    cameraman_cammina.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_indietreggia = stage.getEntity({
        id: Cameraman.keys.id_indietreggia
    });
    cameraman_indietreggia.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_indietreggia.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_indietreggia.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_indietreggia.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_minacciato = stage.getEntity({
        id: Cameraman.keys.id_minacciato
    });
    cameraman_minacciato.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_minacciato.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_minacciato.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_minacciato.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_pre_colpito = stage.getEntity({
        id: Cameraman.keys.id_pre_colpito
    });
    cameraman_pre_colpito.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_pre_colpito.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_pre_colpito.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_pre_colpito.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_colpito_pugno = stage.getEntity({
        id: Cameraman.keys.id_colpito_pugno
    });
    cameraman_colpito_pugno.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_colpito_pugno.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_colpito_pugno.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_colpito_pugno.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_colpito_calcio = stage.getEntity({
        id: Cameraman.keys.id_colpito_calcio
    });
    cameraman_colpito_calcio.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_colpito_calcio.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_colpito_calcio.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_colpito_calcio.getRealBoundingBox().jSpan = cameramanSize.h;
    //

    //
    var cameraman_ferito_fermo = stage.getEntity({
        id: Cameraman.keys.id_ferito_fermo
    });
    cameraman_ferito_fermo.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_ferito_fermo.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_ferito_fermo.getRealBoundingBox().iSpan = cameramanSize.w;
    cameraman_ferito_fermo.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_ferito_cammina = stage.getEntity({
        id: Cameraman.keys.id_ferito_cammina
    });
    cameraman_ferito_cammina.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_ferito_cammina.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_ferito_cammina.getRealBoundingBox().iSpan = cameramanSize.w;
    cameraman_ferito_cammina.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_ferito_indietreggia = stage.getEntity({
        id: Cameraman.keys.id_ferito_indietreggia
    });
    cameraman_ferito_indietreggia.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_ferito_indietreggia.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_ferito_indietreggia.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_ferito_indietreggia.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_ferito_minacciato = stage.getEntity({
        id: Cameraman.keys.id_ferito_minacciato
    });
    cameraman_ferito_minacciato.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_ferito_minacciato.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_ferito_minacciato.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_ferito_minacciato.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_ferito_pre_colpito = stage.getEntity({
        id: Cameraman.keys.id_ferito_pre_colpito
    });
    cameraman_ferito_pre_colpito.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_ferito_pre_colpito.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_ferito_pre_colpito.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_ferito_pre_colpito.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_ferito_colpito_pugno = stage.getEntity({
        id: Cameraman.keys.id_ferito_colpito_pugno
    });
    cameraman_ferito_colpito_pugno.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_ferito_colpito_pugno.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_ferito_colpito_pugno.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_ferito_colpito_pugno.getRealBoundingBox().jSpan = cameramanSize.h;

    var cameraman_ferito_colpito_calcio = stage.getEntity({
        id: Cameraman.keys.id_ferito_colpito_calcio
    });
    cameraman_ferito_colpito_calcio.getRealBoundingBox().i0 = cameramanSize.x;
    cameraman_ferito_colpito_calcio.getRealBoundingBox().j0 = cameramanSize.y;
    cameraman_ferito_colpito_calcio.getRealBoundingBox().iSpan = cameramanSize.w-gap;
    cameraman_ferito_colpito_calcio.getRealBoundingBox().jSpan = cameramanSize.h;
    //

    var cameramans_fermo = [cameraman_fermo, cameraman_ferito_fermo];
    var cameramans_cammina = [cameraman_cammina, cameraman_ferito_cammina];
    var cameramans_indietreggia = [cameraman_indietreggia, cameraman_ferito_indietreggia];
    var cameramans_minacciato = [cameraman_minacciato, cameraman_ferito_minacciato];
    var cameramans_pre_colpito = [cameraman_pre_colpito, cameraman_ferito_pre_colpito];
    var cameramans_colpito_pugno = [cameraman_colpito_pugno, cameraman_ferito_colpito_pugno];
    var cameramans_colpito_calcio = [cameraman_colpito_calcio, cameraman_ferito_colpito_calcio];

    //
    var tileMap = stage.getTileMap();
    this.update = function(delta, personaggio) {

        if (vita <= 0) {
            return;
        }

        var indexPersonaggio = (vita >= 50) ? 0 : 1;
        var personaggioState = personaggio.getState();

        var collideConPersonaggio = this.collideConPersonaggio(personaggio);

        if (personaggioState == Personaggio.states.fermo_verso_dx) {
            instanceFromStage = instanceFromStage.replaceWith(cameramans_fermo[indexPersonaggio]);

        } else if (personaggioState == Personaggio.states.fermo_verso_sx) {

            if (collideConPersonaggio) {
                instanceFromStage = instanceFromStage.replaceWith(cameramans_pre_colpito[indexPersonaggio]);
            } else {
                instanceFromStage = instanceFromStage.replaceWith(cameramans_minacciato[indexPersonaggio]);
            }

        } else if (personaggioState == Personaggio.states.cammina_dx) {

            //Cammina verso Barbareschi mantenendo una certa distanza
            if (instanceFromStage.getPosition().i+cameramanSize.w < personaggio.getInstanceFromStage().getPosition().i-distanzaDaPersonaggio) {
                instanceFromStage.getPosition().i += spostamento*delta;

                instanceFromStage = instanceFromStage.replaceWith(cameramans_cammina[[indexPersonaggio]]);
            }
        
        } else if (personaggioState == Personaggio.states.cammina_sx) {

            //Retrocede da Barbareschi
            instanceFromStage.getPosition().i -= spostamento*delta;
            instanceFromStage = instanceFromStage.replaceWith(cameramans_indietreggia[indexPersonaggio]);

        } else if (personaggioState == Personaggio.states.cammina_sx) {

            instanceFromStage.getPosition().i -= spostamento*delta;
            instanceFromStage = instanceFromStage.replaceWith(cameramans_indietreggia[indexPersonaggio]);

        } else if (personaggioState == Personaggio.states.attacco_pugno_verso_sx) {

            if (collideConPersonaggio) {
                instanceFromStage = instanceFromStage.replaceWith(cameramans_colpito_pugno[indexPersonaggio]);
            }
            
        } else if (personaggioState == Personaggio.states.attacco_calcio_verso_sx) {

            if (collideConPersonaggio) {
                instanceFromStage = instanceFromStage.replaceWith(cameramans_colpito_calcio[indexPersonaggio]);
            }
        }

        personaggio.getInstanceFromStage().collision(instanceFromStage);

        //Controllo che collide con qualche elemento solido della tileMap
        instanceFromStage.tileCollision(tileMap, delta);
    };

    this.danneggiaSeCollide = function(personaggio) {

        var collideConPersonaggio = this.collideConPersonaggio(personaggio);
        if (collideConPersonaggio) {
            vita -= danno;
            return true;
        }

        return false;
    }

    this.collideConPersonaggio = function(personaggio) {

        if (vita <= 0) {
            return false;
        }

        var collide = false;
        var personaggioInstance = personaggio.getInstanceFromStage();
        var personaggioBox = personaggioInstance.getEntity().getRealBoundingBox();
        var entityBox = instanceFromStage.getEntity().getRealBoundingBox();
        var gapDistanza = 2;
        if (instanceFromStage.getPosition().i + entityBox.i0 + entityBox.iSpan + gapDistanza >= personaggioInstance.getPosition().i + personaggioBox.i0) {
            collide = true;
        }

        return collide;
    }

    this.getVita = function() {
        return vita;
    }

    //Per il debug
    this.drawBoundingBox = function(context) {
        instanceFromStage.drawBoundingBox(stage.getView(), context)
    };
}

Cameraman.keys = {
    id_fermo: "cameraman-fermo",
    id_cammina: "cameraman-cammina",
    id_indietreggia: "cameraman-indietreggia",
    id_minacciato: "cameraman-minacciato",
    id_pre_colpito: "cameraman-pre-colpito",
    id_colpito_pugno: "cameraman-colpito-pugno",
    id_colpito_calcio: "cameraman-colpito-calcio",

    id_ferito_fermo: "cameraman-ferito-fermo",
    id_ferito_cammina: "cameraman-ferito-cammina",
    id_ferito_indietreggia: "cameraman-ferito-indietreggia",
    id_ferito_minacciato: "cameraman-ferito-minacciato",
    id_ferito_pre_colpito: "cameraman-ferito-pre-colpito",
    id_ferito_colpito_pugno: "cameraman-ferito-colpito-pugno",
    id_ferito_colpito_calcio: "cameraman-ferito-colpito-calcio"
};