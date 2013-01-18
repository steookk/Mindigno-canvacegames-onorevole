function Iena(instanceFromStage, gravity, stage, loader) {

    var stage = stage;
    var loader = loader;
    var instanceFromStage = instanceFromStage;
    instanceFromStage.getAcceleration().j = gravity;

    var vita = 100;
    var danno = 1.5;

    var velocity = 18;
    var spostamento = velocity * 1;
    var distanzaDaPersonaggio = 1;

    var ienaSize = {
        x: 1,
        y: -16.4,
        w: 11.6,
        h: 19
    };
    var gap = 2.3

    //
    var iena_ferma = stage.getEntity({
        id: Iena.keys.id_ferma
    });
    iena_ferma.getRealBoundingBox().i0 = ienaSize.x;
    iena_ferma.getRealBoundingBox().j0 = ienaSize.y;
    iena_ferma.getRealBoundingBox().iSpan = ienaSize.w;
    iena_ferma.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_cammina = stage.getEntity({
        id: Iena.keys.id_cammina
    });
    iena_cammina.getRealBoundingBox().i0 = ienaSize.x;
    iena_cammina.getRealBoundingBox().j0 = ienaSize.y;
    iena_cammina.getRealBoundingBox().iSpan = ienaSize.w;
    iena_cammina.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_indietreggia = stage.getEntity({
        id: Iena.keys.id_indietreggia
    });
    iena_indietreggia.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_indietreggia.getRealBoundingBox().j0 = ienaSize.y;
    iena_indietreggia.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_indietreggia.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_pre_colpita = stage.getEntity({
        id: Iena.keys.id_pre_colpita
    });
    iena_pre_colpita.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_pre_colpita.getRealBoundingBox().j0 = ienaSize.y;
    iena_pre_colpita.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_pre_colpita.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_colpita_pugno = stage.getEntity({
        id: Iena.keys.id_colpita_pugno
    });
    iena_colpita_pugno.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_colpita_pugno.getRealBoundingBox().j0 = ienaSize.y;
    iena_colpita_pugno.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_colpita_pugno.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_colpita_calcio = stage.getEntity({
        id: Iena.keys.id_colpita_calcio
    });
    iena_colpita_calcio.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_colpita_calcio.getRealBoundingBox().j0 = ienaSize.y;
    iena_colpita_calcio.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_colpita_calcio.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_minacciata = stage.getEntity({
        id: Iena.keys.id_minacciata
    });
    iena_minacciata.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_minacciata.getRealBoundingBox().j0 = ienaSize.y;
    iena_minacciata.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_minacciata.getRealBoundingBox().jSpan = ienaSize.h;
    //

    //
    var iena_ferita_ferma = stage.getEntity({
        id: Iena.keys.id_ferita_ferma
    });
    iena_ferita_ferma.getRealBoundingBox().i0 = ienaSize.x;
    iena_ferita_ferma.getRealBoundingBox().j0 = ienaSize.y;
    iena_ferita_ferma.getRealBoundingBox().iSpan = ienaSize.w;
    iena_ferita_ferma.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_cammina = stage.getEntity({
        id: Iena.keys.id_ferita_cammina
    });
    iena_ferita_cammina.getRealBoundingBox().i0 = ienaSize.x;
    iena_ferita_cammina.getRealBoundingBox().j0 = ienaSize.y;
    iena_ferita_cammina.getRealBoundingBox().iSpan = ienaSize.w;
    iena_ferita_cammina.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_indietreggia = stage.getEntity({
        id: Iena.keys.id_ferita_indietreggia
    });
    iena_ferita_indietreggia.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_indietreggia.getRealBoundingBox().j0 = ienaSize.y;
    iena_ferita_indietreggia.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_indietreggia.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_pre_colpita = stage.getEntity({
        id: Iena.keys.id_ferita_pre_colpita
    });
    iena_ferita_pre_colpita.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_pre_colpita.getRealBoundingBox().j0 = ienaSize.y;
    iena_ferita_pre_colpita.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_pre_colpita.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_colpita_pugno = stage.getEntity({
        id: Iena.keys.id_ferita_colpita_pugno
    });
    iena_ferita_colpita_pugno.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_colpita_pugno.getRealBoundingBox().j0 = ienaSize.y;
    iena_ferita_colpita_pugno.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_colpita_pugno.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_colpita_calcio = stage.getEntity({
        id: Iena.keys.id_ferita_colpita_calcio
    });
    iena_ferita_colpita_calcio.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_colpita_calcio.getRealBoundingBox().j0 = ienaSize.y;
    iena_ferita_colpita_calcio.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_colpita_calcio.getRealBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_minacciata = stage.getEntity({
        id: Iena.keys.id_ferita_minacciata
    });
    iena_ferita_minacciata.getRealBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_minacciata.getRealBoundingBox().j0 = ienaSize.y;
    iena_ferita_minacciata.getRealBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_minacciata.getRealBoundingBox().jSpan = ienaSize.h;
    //

    var iene_ferma = [iena_ferma, iena_ferita_ferma];
    var iene_cammina = [iena_cammina, iena_ferita_cammina];
    var iene_indietreggia = [iena_indietreggia, iena_ferita_indietreggia];
    var iene_pre_colpita = [iena_pre_colpita, iena_ferita_pre_colpita];
    var iene_colpita_pugno = [iena_colpita_pugno, iena_ferita_colpita_pugno];
    var iene_colpita_calcio = [iena_colpita_calcio, iena_ferita_colpita_calcio];
    var iene_minacciata = [iena_minacciata, iena_ferita_minacciata];
    //

    var tileMap = stage.getTileMap();
    this.update = function(delta, personaggio) {

        if (vita <= 0) {
            return;
        }

        var indexPersonaggio = (vita >= 50) ? 0 : 1;
        var personaggioState = personaggio.getState();

        var collideConPersonaggio = this.collideConPersonaggio(personaggio);

        if (personaggioState == Personaggio.states.cammina_sx) {
            
            //Cammina verso Barbareschi mantenendo una certa distanza
            var personaggioInstance = personaggio.getInstanceFromStage();
            var personaggioBox = personaggioInstance.getEntity().getRealBoundingBox();

            if (instanceFromStage.getPosition().i - distanzaDaPersonaggio > personaggioInstance.getPosition().i + personaggioBox.i0 + personaggioBox.iSpan) {
                instanceFromStage.getPosition().i -= spostamento*delta;

                instanceFromStage = instanceFromStage.replaceWith(iene_cammina[indexPersonaggio]);
            }
        
        } else if (personaggioState == Personaggio.states.cammina_dx) {

            //Retrocede da Barbareschi
            instanceFromStage.getPosition().i += spostamento*delta;
            instanceFromStage = instanceFromStage.replaceWith(iene_indietreggia[indexPersonaggio]);
        
        } else if (personaggioState == Personaggio.states.fermo_verso_sx) {

            instanceFromStage = instanceFromStage.replaceWith(iene_ferma[indexPersonaggio]);
        
        } else if (personaggioState == Personaggio.states.fermo_verso_dx) {

            if (collideConPersonaggio) {
                instanceFromStage = instanceFromStage.replaceWith(iene_pre_colpita[indexPersonaggio]);
            } else {
                instanceFromStage = instanceFromStage.replaceWith(iene_minacciata[indexPersonaggio]);
            }
        
        } else if (personaggioState == Personaggio.states.attacco_pugno_verso_dx) {

            //Se Barbareschi sta attaccando verso destra e c'è una collisione con la iena
            if (collideConPersonaggio) {
                instanceFromStage = instanceFromStage.replaceWith(iene_colpita_pugno[indexPersonaggio]);
            }

        } else if (personaggioState == Personaggio.states.attacco_calcio_verso_dx) {

            //Se Barbareschi sta attaccando verso destra e c'è una collisione con la iena
            if (collideConPersonaggio) {
                instanceFromStage = instanceFromStage.replaceWith(iene_colpita_calcio[indexPersonaggio]);
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
        var gapDistanza = 1;
        if (instanceFromStage.getPosition().i < personaggioInstance.getPosition().i + personaggioBox.iSpan + gapDistanza) {
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

Iena.keys = {
    id_ferma: "iena-ferma",
    id_cammina: "iena-cammina",
    id_indietreggia: "iena-indietreggia",
    id_pre_colpita: "iena-pre-colpita",
    id_colpita_pugno: "iena-colpita-pugno",
    id_colpita_calcio: "iena-colpita-calcio",
    id_minacciata: "iena-minacciata",

    id_ferita_ferma: "iena-ferita-ferma",
    id_ferita_cammina: "iena-ferita-cammina",
    id_ferita_indietreggia: "iena-ferita-indietreggia",
    id_ferita_pre_colpita: "iena-ferita-pre-colpita",
    id_ferita_colpita_pugno: "iena-ferita-colpita-pugno",
    id_ferita_colpita_calcio: "iena-ferita-colpita-calcio",
    id_ferita_minacciata: "iena-ferita-minacciata"
};