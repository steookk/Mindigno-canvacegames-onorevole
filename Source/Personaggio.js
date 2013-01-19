function Personaggio (instanceFromStage, gravity, stage, loader) {
	
	var stage = stage;
    var loader = loader;
    var instanceFromStage = instanceFromStage;
	instanceFromStage.getAcceleration().j = gravity;

    var personaggioSize = {
        x: 2.3,
        y: -16.8,
        w: 6,
        h: 17.7
    };

	//
    var personaggio_fermo_dx = stage.getEntity({
    	id: Personaggio.keys.id_normal_right
    });
    personaggio_fermo_dx.getRealBoundingBox().i0 = personaggioSize.x;
    personaggio_fermo_dx.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_fermo_dx.getRealBoundingBox().iSpan = personaggioSize.w; 
    personaggio_fermo_dx.getRealBoundingBox().jSpan = personaggioSize.h;

    var personaggio_fermo_sx = stage.getEntity({
    	id: Personaggio.keys.id_normal_left
    });
    personaggio_fermo_sx.getRealBoundingBox().i0 = 5.5;
    personaggio_fermo_sx.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_fermo_sx.getRealBoundingBox().iSpan = personaggioSize.w;
    personaggio_fermo_sx.getRealBoundingBox().jSpan = personaggioSize.h;
    //
    
    var personaggio_cammina_dx = stage.getEntity({
    	id: Personaggio.keys.id_cammina_right
    });
    personaggio_cammina_dx.getRealBoundingBox().i0 = personaggioSize.x;
    personaggio_cammina_dx.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_cammina_dx.getRealBoundingBox().iSpan = personaggioSize.w;
    personaggio_cammina_dx.getRealBoundingBox().jSpan = personaggioSize.h;
    
    var personaggio_cammina_sx = stage.getEntity({
        id: Personaggio.keys.id_cammina_left
    });
    personaggio_cammina_sx.getRealBoundingBox().i0 = 5.5;
    personaggio_cammina_sx.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_cammina_sx.getRealBoundingBox().iSpan = personaggioSize.w;
    personaggio_cammina_sx.getRealBoundingBox().jSpan = personaggioSize.h;
    //

    var personaggio_attacco_pugno_dx = stage.getEntity({
        id: Personaggio.keys.id_attack_pugno_right
    });
    personaggio_attacco_pugno_dx.getRealBoundingBox().i0 = personaggioSize.x;
    personaggio_attacco_pugno_dx.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_attacco_pugno_dx.getRealBoundingBox().iSpan = personaggioSize.w;
    personaggio_attacco_pugno_dx.getRealBoundingBox().jSpan = personaggioSize.h;

    var personaggio_attacco_pugno_sx = stage.getEntity({
        id: Personaggio.keys.id_attack_pugno_left
    });
    personaggio_attacco_pugno_sx.getRealBoundingBox().i0 = 5.5;
    personaggio_attacco_pugno_sx.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_attacco_pugno_sx.getRealBoundingBox().iSpan = personaggioSize.w;
    personaggio_attacco_pugno_sx.getRealBoundingBox().jSpan = personaggioSize.h;
    //

    var personaggio_attacco_calcio_dx = stage.getEntity({
        id: Personaggio.keys.id_attack_calcio_right
    });
    personaggio_attacco_calcio_dx.getRealBoundingBox().i0 = personaggioSize.x;
    personaggio_attacco_calcio_dx.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_attacco_calcio_dx.getRealBoundingBox().iSpan = personaggioSize.w;
    personaggio_attacco_calcio_dx.getRealBoundingBox().jSpan = personaggioSize.h;

    var personaggio_attacco_calcio_sx = stage.getEntity({
        id: Personaggio.keys.id_attack_calcio_left
    });
    personaggio_attacco_calcio_sx.getRealBoundingBox().i0 = 5.5;
    personaggio_attacco_calcio_sx.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_attacco_calcio_sx.getRealBoundingBox().iSpan = personaggioSize.w;
    personaggio_attacco_calcio_sx.getRealBoundingBox().jSpan = personaggioSize.h;
    //

    var personaggio_esulta = stage.getEntity({
        id: Personaggio.keys.id_esulta
    });
    personaggio_esulta.getRealBoundingBox().i0 = 5.5;
    personaggio_esulta.getRealBoundingBox().j0 = personaggioSize.y;
    personaggio_esulta.getRealBoundingBox().iSpan = personaggioSize.w;
    personaggio_esulta.getRealBoundingBox().jSpan = personaggioSize.h;
    //

    var state = Personaggio.states.fermo_verso_sx;
    instanceFromStage = instanceFromStage.replaceWith(personaggio_fermo_sx);

    //
    this.stayNormal = function() {

        if (state == Personaggio.states.esulta) {
            return;
        }

        if (state == Personaggio.states.fermo_verso_dx || state == Personaggio.states.cammina_dx || state == Personaggio.states.attacco_pugno_verso_dx || state == Personaggio.states.attacco_calcio_verso_dx) {
            instanceFromStage = instanceFromStage.replaceWith(personaggio_fermo_dx);
            state = Personaggio.states.fermo_verso_dx;
        } else {
            instanceFromStage = instanceFromStage.replaceWith(personaggio_fermo_sx);
            state = Personaggio.states.fermo_verso_sx;
        }
        
        instanceFromStage.getUniformVelocity().i = 0;
    };

    this.goRight = function() {

        if (state == Personaggio.states.esulta) {
            return;
        }

    	instanceFromStage = instanceFromStage.replaceWith(personaggio_cammina_dx);
    	instanceFromStage.getUniformVelocity().i = 15;
        state = Personaggio.states.cammina_dx;
    };

    this.goLeft = function() {

        if (state == Personaggio.states.esulta) {
            return;
        }

    	instanceFromStage = instanceFromStage.replaceWith(personaggio_cammina_sx);
    	instanceFromStage.getUniformVelocity().i = -15;
        state = Personaggio.states.cammina_sx;
    };

    var tiratoPugno = true;
    this.attack = function() {

        if (state == Personaggio.states.esulta) {
            return;
        }

        if (state == Personaggio.states.attacco_pugno_verso_dx || state == Personaggio.states.attacco_calcio_verso_dx || state == Personaggio.states.fermo_verso_dx || state == Personaggio.states.cammina_dx) {

            if (tiratoPugno) {
                instanceFromStage = instanceFromStage.replaceWith(personaggio_attacco_pugno_dx);
                state = Personaggio.states.attacco_pugno_verso_dx;
            } else {
                instanceFromStage = instanceFromStage.replaceWith(personaggio_attacco_calcio_dx);
                state = Personaggio.states.attacco_calcio_verso_dx;
            }

        } else {

            if (tiratoPugno) {
                instanceFromStage = instanceFromStage.replaceWith(personaggio_attacco_pugno_sx);
                state = Personaggio.states.attacco_pugno_verso_sx;
            } else {
                instanceFromStage = instanceFromStage.replaceWith(personaggio_attacco_calcio_sx);
                state = Personaggio.states.attacco_calcio_verso_sx;
            }
        }

        tiratoPugno = !tiratoPugno;
        instanceFromStage.getUniformVelocity().i = 0;
    };

    var tileMap = stage.getTileMap();
    this.update = function(delta) {

    	instanceFromStage.tileCollision(tileMap, delta);
    };

    this.getInstanceFromStage = function() {
        return instanceFromStage;
    };

    this.getState = function() {
        return state;
    };
    
    this.vincita = function() {
        state = Personaggio.states.esulta;
        instanceFromStage = instanceFromStage.replaceWith(personaggio_esulta);
    }

    //Per il debug
    this.drawBoundingBox = function(context) {
    	instanceFromStage.drawBoundingBox(stage.getView(), context)
    };
}

Personaggio.keys = {
    id_normal_left: "barbareschi-sx",
	id_normal_right: "barbareschi-dx",
    id_cammina_left: "barbareschi-cammina-sx",
    id_cammina_right: "barbareschi-cammina-dx",
    id_attack_pugno_left: "barbareschi-pugno-sx",
    id_attack_pugno_right: "barbareschi-pugno-dx",
    id_attack_calcio_left: "barbareschi-calcio-sx",
    id_attack_calcio_right: "barbareschi-calcio-dx",
    id_esulta: "barbareschi-esulta"
};

Personaggio.states = {
    fermo_verso_dx: 0,
    fermo_verso_sx: 1,
    cammina_dx: 2,
    cammina_sx: 3,
    attacco_pugno_verso_dx: 4,
    attacco_calcio_verso_dx: 5,
    attacco_pugno_verso_sx: 6,
    attacco_calcio_verso_sx: 7,
    esulta: 8
};
