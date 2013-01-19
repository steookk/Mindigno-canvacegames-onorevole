$.getJSON('Barbareschi.json', function (response) {
    var loader = new Canvace.Loader('Media');

    loader.onComplete(function () {

        //Riga di codice per rimediare al funzionamento su tutti i browser
        Canvace.RenderLoop.setLoop('interval');

        var canvas = $('canvas#canvas').get(0);
        var stage = new Canvace.Stage(response, canvas);
        
        var view = stage.getView();
        //Ridisegno la view nella pagina html in modo da visualizzarsi correttamente al centro
        view.dragTo(0, 600);

        ///
        
        var personaggioInstance = stage.getInstance({
            id: Personaggio.keys.id_normal_right
        });
        var gravity = -30;
        var personaggio = new Personaggio(personaggioInstance, gravity, stage, loader);
    
        //

        var ienaInstance = stage.getInstance({
            id: Iena.keys.id_ferma
        });
        var iena = new Iena(ienaInstance, gravity, stage, loader);

        var cameramanInstance = stage.getInstance({
            id: Cameraman.keys.id_fermo
        });
        var cameraman = new Cameraman(cameramanInstance, gravity, stage, loader);

        //

        var nuvolaInstance_g = stage.getInstance({
            id: Nuvola.keys.id_nuvola_grande
        });
        var nuvolaGrande = new Nuvola(nuvolaInstance_g, stage, loader);

        var nuvolaInstance_m = stage.getInstance({
            id: Nuvola.keys.id_nuvola_media
        });
        var nuvolaMedia = new Nuvola(nuvolaInstance_m, stage, loader);

        var nuvolaInstance_p = stage.getInstance({
            id: Nuvola.keys.id_nuvola_piccola
        });
        var nuvolaPiccola = new Nuvola(nuvolaInstance_p, stage, loader);

        ///

        var keyboard = new Canvace.Keyboard(window);
        
        //Handle keyboard pressing

        keyboard.onKeyDown(KeyEvent.DOM_VK_RIGHT, function() {
        	personaggio.goRight();
        })
        keyboard.onKeyUp(KeyEvent.DOM_VK_RIGHT, function() {
        	personaggio.stayNormal();
        })

        //

        keyboard.onKeyDown(KeyEvent.DOM_VK_LEFT, function() {
        	personaggio.goLeft();
        })
        keyboard.onKeyUp(KeyEvent.DOM_VK_LEFT, function() {
        	personaggio.stayNormal();
        })

        //
        
        var counter = 0;
        var counterSoundBarbareschi = 0;
        var counterSoundIena = 0;
        var giocoFinito = false;
        keyboard.onKeyDown(KeyEvent.DOM_VK_SPACE, function() {

            if (!giocoFinito) {

                personaggio.attack();

                //Solo quando è pari quindi salta un colpo
                if (counter%3 == 2) {
                    counterSoundBarbareschi = counterSoundBarbareschi%(frasiBarbareschi.length);
                    loader.playSound(frasiBarbareschi[counterSoundBarbareschi]);
                    counterSoundBarbareschi++;
                }

                if (counter%15 == 5 && iena.getVita() > 15) {

                    counterSoundIena = counterSoundIena%(frasiIena .length);
                    loader.playSound(frasiIena[counterSoundIena]);
                    counterSoundIena++;
                }

                counter++;
                
                var personaggioCollideIena = iena.danneggiaSeCollide(personaggio);
                var personaggioCollideCameraman = cameraman.danneggiaSeCollide(personaggio);

                if (personaggioCollideIena || personaggioCollideCameraman) {
                    loader.playSound("Cazzotto");
                }

                setTimeout(personaggio.stayNormal, 150);
            }
        })

        keyboard.onKeyUp(KeyEvent.DOM_VK_SPACE, function() {
            
            var vitaIena = iena.getVita();
            var vitaCameraman = cameraman.getVita();

            if (vitaIena <= 0 && vitaCameraman <= 0 && !giocoFinito) {

                loader.playSound("Fine");
                personaggio.vincita();

                $('#ringraziamenti').animate({
                    top: 100
                });

                giocoFinito = true;
            }
        })

        //

        keyboard.onKeyDown(KeyEvent.DOM_VK_UP, function() {
        })
        keyboard.onKeyUp(KeyEvent.DOM_VK_UP, function() {
        })

        keyboard.onKeyDown(KeyEvent.DOM_VK_DOWN, function() {
        })
        keyboard.onKeyUp(KeyEvent.DOM_VK_DOWN, function() {
        })

        //

        var loop = new Canvace.RenderLoop(stage, stage, loader, function(delta) {

        	personaggio.update(delta);

            iena.update(delta, personaggio);
            cameraman.update(delta, personaggio);

            nuvolaGrande.update(delta);
            nuvolaMedia.update(delta);
            nuvolaPiccola.update(delta);
        });
  
        //Per visualizzare le bounding box e verificare la collision detection.
        loop.getRenderer().addEffect({
            isOver: function() {
                return false;
            },
            postProcess: function(context) {

                /*
                personaggio.drawBoundingBox(context);

                iena.drawBoundingBox(context);
                cameraman.drawBoundingBox(context);
                */

                /*
                nuvolaGrande.drawBoundingBox(context);
                nuvolaMedia.drawBoundingBox(context);
                nuvolaPiccola.drawBoundingBox(context);
                */
            }
        });
        //

        //Non funziona su alcuni browser come Safari.
        Canvace.onVisibilityChange(function(hidden) {
            if (hidden) {
                loop.suspend();
            } else {
                loop.run();
            }
        });

        //Lancio l'esecuzione
        loop.run();
        //Avvio la riproduzione del suono di inizio.
        loader.playSound("RaggiungiamoInSicilia");
    });
    
    //Definisco le chiavi per richiamare i suoni.
    loader.loadAssets(response, {
        "RaggiungiamoInSicilia": ["Sounds/Iena/RaggiungiamoInSicilia.ogg", "Sounds/Iena/RaggiungiamoInSicilia.mp3"],
        "Fine": ["Sounds/Fine.ogg", "Sounds/Fine.mp3"],

        "Cazzotto": ["Sounds/Effetti/Cazzotto.ogg", "Sounds/Effetti/Cazzotto.mp3"],
        
        "Cretino": ["Sounds/Barbareschi/Cretino.ogg", "Sounds/Barbareschi/Cretino.mp3"],
        "Cretino_2": ["Sounds/Barbareschi/Cretino_2.ogg", "Sounds/Barbareschi/Cretino_2.mp3"],
        "Imbecille": ["Sounds/Barbareschi/Imbecille.ogg", "Sounds/Barbareschi/Imbecille.mp3"],
        "Imbecille_2": ["Sounds/Barbareschi/Imbecille_2.ogg", "Sounds/Barbareschi/Imbecille_2.mp3"],
        "Fascistello": ["Sounds/Barbareschi/Fascistello.ogg", "Sounds/Barbareschi/Fascistello.mp3"],
        "Teppistello": ["Sounds/Barbareschi/Teppistello.ogg", "Sounds/Barbareschi/Teppistello.mp3"],
        "Vergogna": ["Sounds/Barbareschi/Vergogna.ogg", "Sounds/Barbareschi/Vergogna.mp3"],

        "100per100delle_assenze": ["Sounds/Iena/100per100delle_assenze.ogg", "Sounds/Iena/100per100delle_assenze.mp3"],
        "Assente_al_parlamento": ["Sounds/Iena/Assente_al_parlamento.ogg", "Sounds/Iena/Assente_al_parlamento.mp3"],
        "Perche_mi_mena": ["Sounds/Iena/Perche_mi_mena.ogg", "Sounds/Iena/Perche_mi_mena.mp3"],
        "Perche_non_si_dimette": ["Sounds/Iena/Perche_non_si_dimette.ogg", "Sounds/Iena/Perche_non_si_dimette.mp3"],
        "Fregato_il_cellulare": ["Sounds/Iena/Fregato_il_cellulare.ogg", "Sounds/Iena/Fregato_il_cellulare.mp3"]    
    });

    var frasiBarbareschi = ["Cretino", "Cretino_2", "Imbecille", "Imbecille_2", "Fascistello", "Teppistello", "Vergogna"];
    var frasiIena = ["100per100delle_assenze", "Perche_mi_mena", "Assente_al_parlamento", "Perche_non_si_dimette", "Perche_mi_mena", "Fregato_il_cellulare"];
});
