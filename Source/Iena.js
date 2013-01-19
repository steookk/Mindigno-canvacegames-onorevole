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
    iena_ferma.getBoundingBox().i0 = ienaSize.x;
    iena_ferma.getBoundingBox().j0 = ienaSize.y;
    iena_ferma.getBoundingBox().iSpan = ienaSize.w;
    iena_ferma.getBoundingBox().jSpan = ienaSize.h;

    var iena_cammina = stage.getEntity({
        id: Iena.keys.id_cammina
    });
    iena_cammina.getBoundingBox().i0 = ienaSize.x;
    iena_cammina.getBoundingBox().j0 = ienaSize.y;
    iena_cammina.getBoundingBox().iSpan = ienaSize.w;
    iena_cammina.getBoundingBox().jSpan = ienaSize.h;

    var iena_indietreggia = stage.getEntity({
        id: Iena.keys.id_indietreggia
    });
    iena_indietreggia.getBoundingBox().i0 = ienaSize.x+gap;
    iena_indietreggia.getBoundingBox().j0 = ienaSize.y;
    iena_indietreggia.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_indietreggia.getBoundingBox().jSpan = ienaSize.h;

    var iena_pre_colpita = stage.getEntity({
        id: Iena.keys.id_pre_colpita
    });
    iena_pre_colpita.getBoundingBox().i0 = ienaSize.x+gap;
    iena_pre_colpita.getBoundingBox().j0 = ienaSize.y;
    iena_pre_colpita.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_pre_colpita.getBoundingBox().jSpan = ienaSize.h;

    var iena_colpita_pugno = stage.getEntity({
        id: Iena.keys.id_colpita_pugno
    });
    iena_colpita_pugno.getBoundingBox().i0 = ienaSize.x+gap;
    iena_colpita_pugno.getBoundingBox().j0 = ienaSize.y;
    iena_colpita_pugno.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_colpita_pugno.getBoundingBox().jSpan = ienaSize.h;

    var iena_colpita_calcio = stage.getEntity({
        id: Iena.keys.id_colpita_calcio
    });
    iena_colpita_calcio.getBoundingBox().i0 = ienaSize.x+gap;
    iena_colpita_calcio.getBoundingBox().j0 = ienaSize.y;
    iena_colpita_calcio.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_colpita_calcio.getBoundingBox().jSpan = ienaSize.h;

    var iena_minacciata = stage.getEntity({
        id: Iena.keys.id_minacciata
    });
    iena_minacciata.getBoundingBox().i0 = ienaSize.x+gap;
    iena_minacciata.getBoundingBox().j0 = ienaSize.y;
    iena_minacciata.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_minacciata.getBoundingBox().jSpan = ienaSize.h;
    //

    //
    var iena_ferita_ferma = stage.getEntity({
        id: Iena.keys.id_ferita_ferma
    });
    iena_ferita_ferma.getBoundingBox().i0 = ienaSize.x;
    iena_ferita_ferma.getBoundingBox().j0 = ienaSize.y;
    iena_ferita_ferma.getBoundingBox().iSpan = ienaSize.w;
    iena_ferita_ferma.getBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_cammina = stage.getEntity({
        id: Iena.keys.id_ferita_cammina
    });
    iena_ferita_cammina.getBoundingBox().i0 = ienaSize.x;
    iena_ferita_cammina.getBoundingBox().j0 = ienaSize.y;
    iena_ferita_cammina.getBoundingBox().iSpan = ienaSize.w;
    iena_ferita_cammina.getBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_indietreggia = stage.getEntity({
        id: Iena.keys.id_ferita_indietreggia
    });
    iena_ferita_indietreggia.getBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_indietreggia.getBoundingBox().j0 = ienaSize.y;
    iena_ferita_indietreggia.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_indietreggia.getBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_pre_colpita = stage.getEntity({
        id: Iena.keys.id_ferita_pre_colpita
    });
    iena_ferita_pre_colpita.getBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_pre_colpita.getBoundingBox().j0 = ienaSize.y;
    iena_ferita_pre_colpita.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_pre_colpita.getBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_colpita_pugno = stage.getEntity({
        id: Iena.keys.id_ferita_colpita_pugno
    });
    iena_ferita_colpita_pugno.getBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_colpita_pugno.getBoundingBox().j0 = ienaSize.y;
    iena_ferita_colpita_pugno.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_colpita_pugno.getBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_colpita_calcio = stage.getEntity({
        id: Iena.keys.id_ferita_colpita_calcio
    });
    iena_ferita_colpita_calcio.getBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_colpita_calcio.getBoundingBox().j0 = ienaSize.y;
    iena_ferita_colpita_calcio.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_colpita_calcio.getBoundingBox().jSpan = ienaSize.h;

    var iena_ferita_minacciata = stage.getEntity({
        id: Iena.keys.id_ferita_minacciata
    });
    iena_ferita_minacciata.getBoundingBox().i0 = ienaSize.x+gap;
    iena_ferita_minacciata.getBoundingBox().j0 = ienaSize.y;
    iena_ferita_minacciata.getBoundingBox().iSpan = ienaSize.w-gap;
    iena_ferita_minacciata.getBoundingBox().jSpan = ienaSize.h;
    //

    var iene_ferma = [iena_ferma, iena_ferita_ferma];
    var iene_cammina = [iena_cammina, iena_ferita_cammina];
    var iene_indietreggia = [iena_indietreggia, iena_ferita_indietreggia];
    var iene_pre_colpita = [iena_pre_colpita, iena_ferita_pre_colpita];
    var iene_colpita_pugno = [iena_colpita_pugno, iena_ferita_colpita_pugno];
    var iene_colpita_calcio = [iena_colpita_calcio, iena_ferita_colpita_calcio];
    var iene_minacciata = [iena_minacciata, iena_ferita_minacciata];
    //

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
            var personaggioBox = personaggioInstance.getEntity().getBoundingBox();

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
        instanceFromStage.tileCollision();
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
        var personaggioBox = personaggioInstance.getEntity().getBoundingBox();
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
