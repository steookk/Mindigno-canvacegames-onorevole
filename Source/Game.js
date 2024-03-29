$(function () {
    var adaptCanvasSize = (function (initialWidth, initialHeight) {
        var container = $('#container');

        return function () {
            var ratio = Math.min(
                window.innerWidth / initialWidth,
                window.innerHeight / initialHeight);

            container.css({
                width: Math.floor(ratio * initialWidth) - 4,
                height: Math.floor(ratio * initialHeight) - 4
            });
        };
    })(800, 600);

    if (Canvace.mobileBrowser) {
        window.addEventListener('resize', adaptCanvasSize, false);
        window.addEventListener('orientationchange', adaptCanvasSize, false);
        adaptCanvasSize();
    }

    (function (ignored) {
        $('#canvas').on(ignored, false);
        $(document.body).on(ignored, false);
    })('gesturestart gesturemove gestureend contextmenu');

    $.getJSON('Barbareschi.json', function (response) {
        var loader = new Canvace.Loader('Media');

            loader.onProgress(function(progress) {

                $('#progress').css('width', (progress/100)*299);
            });

            loader.onComplete(function () {

            if (!DEBUG) {
                mixpanel.track("Finito di caricare il gioco", {"version": version});
            }
            loader.playSound("Intro");

            //Riga di codice per rimediare al funzionamento su tutti i browser
            Canvace.RenderLoop.setLoop('interval');

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

            var nuvole;
            //if (Canvace.mobileBrowser) {
            if (false) {
                //Facciamo in modo che non vengano mai rimosse. Almeno per ora.
                nuvolaGrande.getInstanceFromStage().remove();
                nuvolaMedia.getInstanceFromStage().remove();
                nuvolaPiccola.getInstanceFromStage().remove();

                nuvole = [];

            } else {
                nuvole = [nuvolaGrande, nuvolaMedia, nuvolaPiccola];
            }
            
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

            var giocoFinito = false;
            var giocoIniziato = false;
            var attack = (function () {

                var counter = 0;
                var counterSoundBarbareschi = 0;
                var counterSoundIena = 0;

                return function() {
                    if (!giocoFinito) {

                        personaggio.attack();

                        //Solo quando è pari quindi salta un colpo
                        if (counter%3 == 2) {
                            counterSoundBarbareschi = counterSoundBarbareschi%(frasiBarbareschi.length);
                            loader.playSound(frasiBarbareschi[counterSoundBarbareschi]);
                            counterSoundBarbareschi++;
                        }

                        if (counter%15 == 5 && iena.getVita() > 10) {

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
                };
            })();

            var leftGauge = $('#energy-bars div.left.gauge');
            var rightGauge = $('#energy-bars div.right.gauge');
            var checkLife = function() {
                var vitaIena = iena.getVita();
                var vitaCameraman = cameraman.getVita();

				leftGauge.css('backgroundSize', ~~(vitaCameraman) + '% 100%');
				rightGauge.css('backgroundSize', ~~(vitaIena) + '% 100%');

                var ienaMorta = (vitaIena <= 0);
                var cameramanMorto = (vitaCameraman <= 0);

                if (cameramanMorto) {
                    leftGauge.hide();
                }
                if (ienaMorta) {
                    rightGauge.hide();
                }

                if (ienaMorta && cameramanMorto && !giocoFinito) {
                    winGame();
                }
            };

            var winGame = function () {
                if (!DEBUG) {
                    mixpanel.track("Gioco finito", {"version": version});
                }

                giocoFinito = true;
                personaggio.vincita();
                $('#win-screen').css('display', 'table');

                loader.playSound("Fine");
                setTimeout(function () {
                    loader.playSound("Fregato_il_cellulare");
                }, 2000);
            };

            keyboard.onKeyDown(KeyEvent.DOM_VK_SPACE, attack);
            keyboard.onKeyUp(KeyEvent.DOM_VK_SPACE, checkLife);

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

            canvas.addEventListener('touchstart', (function (left, center, right) {
                var slices = 5;

                var left = arguments[0];
                var center = arguments[1];
                var right = arguments[2];

                return function (event) {
                    var rect = canvas.getBoundingClientRect();
                    var width = (rect.right - rect.left);
                    var height = (rect.bottom - rect.top);

                    var touches = event.targetTouches;
                    for (var i = 0; i < touches.length; ++i) {
                        var touchX = touches.item(i).clientX - rect.left;

                        if (touchX < (width / slices)) {
                            left();
                        } else if (touchX < (slices - 1) * (width / slices)) {
                            center();
                        } else {
                            right();
                        }
                    }

                    event.preventDefault();
                    return false;
                };
            })(function () {
                personaggio.goLeft();
            }, function () {
                attack();
            }, function () {
                personaggio.goRight();
            }), false);

            canvas.addEventListener('touchend', function (event) {
                var attackingStates = [
                    Personaggio.states.attacco_pugno_verso_sx,
                    Personaggio.states.attacco_pugno_verso_dx,
                    Personaggio.states.attacco_calcio_verso_sx,
                    Personaggio.states.attacco_calcio_verso_dx,
                ];

                if (-1 === attackingStates.indexOf(personaggio.getState())) {
                    personaggio.stayNormal();
                }

                checkLife();

                event.preventDefault();
                return false;
            }, false);

            //

            var loop = new Canvace.RenderLoop(stage, stage, loader, function(delta) {

                personaggio.update(delta);

                iena.update(delta, personaggio);
                cameraman.update(delta, personaggio);

                for (var i = 0; i < nuvole.length; i++) {
                    nuvole[i].update(delta);
                };
            });

            /*
            //Per visualizzare le bounding box e verificare la collision detection.
            loop.getRenderer().addEffect({
                isOver: function() {
                    return false;
                },
                postProcess: function(context) {

                    personaggio.drawBoundingBox(context);

                    iena.drawBoundingBox(context);
                    cameraman.drawBoundingBox(context);

                    for (var i = 0; i < nuvole.length; i++) {
                        nuvole[i].drawBoundingBox(context);
                    };
                }
            });
            */
            //

            //Non funziona su alcuni browser come Safari.
            Canvace.onVisibilityChange(function (hidden) {
                if (giocoIniziato) {
                    if (hidden) {
                        loop.suspend();
                    } else {
                        loop.run();
                    }
                }
            });

            $('#play').click(function() {
                if (!DEBUG) {
                    mixpanel.track("Premuto play", {"version": version});
                }

                giocoIniziato = true;

                $('#menu').hide();
                $('#energy-bars').show();

                //Lancio l'esecuzione
                loop.run();
                //Avvio la riproduzione del suono di inizio.
                loader.playSound("RaggiungiamoInSicilia");
            });

            setTimeout(function() {
                $('#batteria').hide();
            }, 250);

            setTimeout(function() {
                $('#play').css('display', 'inline-block');
            }, 1500);
            
        });
        
        //Definisco le chiavi per richiamare i suoni.
        loader.loadAssets(response, {
            "Intro": ["Sounds/Intro.ogg", "Sounds/Intro.mp3"],
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
        var frasiIena = ["100per100delle_assenze", "Perche_mi_mena", "Assente_al_parlamento", "Perche_non_si_dimette"];
    });
});
