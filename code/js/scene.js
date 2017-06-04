'use strict';

function setRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( 0xdddddd );
    renderer.setSize( window.innerWidth, 600 );
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
}

//==============================================================================

function setScene() {
    scene = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3( 0, -98, 0 ));
    scene.addEventListener(
        'update',
        function() {
            scene.simulate( undefined, 2 );
        }
    );
    setLights(scene);
}

//==============================================================================

function setLights(scene) {

    let ambientLight    = new THREE.AmbientLight( 0x404040 );
    let envLight        = new THREE.HemisphereLight( 0xccccff, 0xccffcc, 0.3 )
    let light           = new THREE.DirectionalLight( 0xFFFFFF, 1 );
    let helper          = new THREE.CameraHelper( light.shadow.camera );

    light.position.set( 90, 90, 0 );
    light.target.position.copy( scene.position );
    light.castShadow            = true;
    light.shadow.camera.left    = -100;                 // for area of 200 x 200
    light.shadow.camera.top     = -100;
    light.shadow.camera.right   = 100;
    light.shadow.camera.bottom  = 100;
    light.shadow.camera.near    = 20;
    light.shadow.camera.far     = 200;
    light.shadow.bias           = -.001
    light.shadow.mapSize.width  = light.shadow.mapSize.height = 4096;

    scene.add( ambientLight );
    scene.add( light );
    //scene.add( helper );
    //scene.add( envLight );
}

//==============================================================================

function setCameras() {
    for (let ii = 0; ii < views.length; ++ii ) {
        let view = views[ii];
        if(view.projection == "ortho") {
            let frustrum = view.frustrum || { w:950, h:350 };
            camera = new THREE.OrthographicCamera(
                -frustrum.w, frustrum.w, frustrum.h, -frustrum.h, 0, 10000
            );
            camera.zoom = view.zoom || 1.0;
            camera.updateProjectionMatrix();
        }
        else {
            let fov = view.fov || 50;
            camera = new THREE.PerspectiveCamera( fov,
                window.innerWidth / window.innerHeight,
                1, 10000
            );
        }
        camera.position.set( view.position.x, view.position.y, view.position.z );
        camera.lookAt( scene.position );
        view.camera = camera;
    }
}

//==============================================================================

function createGround() {

    const HEIGHT_MULT = 0;      // 0 = flat terrain

    let loader = new THREE.TextureLoader();

    let ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ map: loader.load( 'scene/pattern.png' ) }),
        1,  // high friction
        0.4 // low restitution
    );
    ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
    ground_material.map.repeat.set( 15, 15 );

    //let hmSource = "scene/s01.bin"
    //heightMap(hmSource, 1);           // heightMaps not working :/

    let noise_gen = new SimplexNoise;
    let ground_geometry = new THREE.PlaneGeometry( 200, 200, 50, 50 );
    for ( let i = 0; i < ground_geometry.vertices.length; i++ ) {
        let vertex = ground_geometry.vertices[i];
        vertex.z = noise_gen.noise( vertex.x / 50, vertex.y / 50 ) * HEIGHT_MULT;
    }
    ground_geometry.computeFaceNormals();
    ground_geometry.computeVertexNormals();

    let ground = new Physijs.HeightfieldMesh(
        ground_geometry,
        ground_material,
        0, // mass
        50,
        50
    );
    ground.rotation.x = Math.PI / -2;
    ground.receiveShadow = true;

    scene.add( ground );
}

//==============================================================================

function createVehicle() {

    let car_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xff6666 }),
        1.0,    // friction
        1.0     // restitution
    );

    let wheel_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0x444444 }),
        0.3,    // friction
        0.1     // restitution
    );
    let scaleFactor = 1.4;
    let wheel_geometry = new THREE.CylinderGeometry( 1.4, 1.4, 0.6, 64 );

    // Loading car model from json:
    let json_loader = new THREE.JSONLoader();
    json_loader.load( "models/mustang.json", function( car, car_materials ){

        car.body = new Physijs.BoxMesh(
            car,
            new THREE.MeshFaceMaterial( car_materials )
        );
        let scaleFactor = 1.4;
        car.body.scale.set(scaleFactor, scaleFactor, scaleFactor);
        car.body.position.y = 10;
        car.body.rotation.y = - Math.PI / 2;
        car.body.castShadow = car.body.receiveShadow = true;

        let vehicle = new Physijs.Vehicle(car.body, new Physijs.VehicleTuning(
            10.88,
            1.83,
            0.28,
            500,
            10.5,
            6000
        ));

        // Attach cameras to car
        for (let ii = 0; ii < views.length; ii++){
            if (views[ii].attach) {
                car.body.add(views[ii].camera);
            }
        }

        //car.body.add(headlights);
        scene.add( vehicle );

        // Adding the car wheels
        car.wheel_fl = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500
        );
        car.wheel_fl.rotation.x = Math.PI / 2;
        car.wheel_fl.position.set( -4.5, 7.5, 3.5 );
        car.wheel_fl.receiveShadow = car.wheel_fl.castShadow = true;
        scene.add( car.wheel_fl );

        car.wheel_fl_constraint = new Physijs.DOFConstraint(
            car.wheel_fl, car.body, new THREE.Vector3( -4.5, 7.5, 3.5 )
        );
        scene.addConstraint( car.wheel_fl_constraint );
        car.wheel_fl_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 4, z: 1 });
        car.wheel_fl_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 4, z: 0 });

        car.wheel_fr = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500
        );
        car.wheel_fr.rotation.x = Math.PI / 2;
        car.wheel_fr.position.set( -4.5, 7.5, -3.5 );
        car.wheel_fr.receiveShadow = car.wheel_fr.castShadow = true;
        scene.add( car.wheel_fr );

        car.wheel_fr_constraint = new Physijs.DOFConstraint(
            car.wheel_fr, car.body, new THREE.Vector3( -4.5, 7.5, -3.5 )
        );
        scene.addConstraint( car.wheel_fr_constraint );

        car.wheel_fr_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 4, z: 1 });
        car.wheel_fr_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 4, z: 0 });

        car.wheel_bl = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500
        );
        car.wheel_bl.rotation.x = Math.PI / 2;
        car.wheel_bl.position.set( 4.5, 7.5, 3.5 );
        car.wheel_bl.receiveShadow = car.wheel_bl.castShadow = true;
        scene.add( car.wheel_bl );

        car.wheel_bl_constraint = new Physijs.DOFConstraint(
            car.wheel_bl, car.body, new THREE.Vector3( 4.5, 7.5, 3.5 )
        );
        scene.addConstraint( car.wheel_bl_constraint );

        car.wheel_bl_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
        car.wheel_bl_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });

        car.wheel_br = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500
        );
        car.wheel_br.rotation.x = Math.PI / 2;
        car.wheel_br.position.set( 4.5, 7.5, -3.5 );
        car.wheel_br.receiveShadow = car.wheel_br.castShadow = true;
        scene.add( car.wheel_br );

        car.wheel_br_constraint = new Physijs.DOFConstraint(
            car.wheel_br, car.body, new THREE.Vector3( 4.5, 7.5, -3.5 )
        );
        scene.addConstraint( car.wheel_br_constraint );

        car.wheel_br_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
        car.wheel_br_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });

        // Controls / user interaction
        document.addEventListener('keydown', function(ev) { keydown(car, ev) });
        document.addEventListener('keyup',   function(ev) {   keyup(car, ev) });
    });
}

//==============================================================================

function createBot() {

    let bot_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xff6666 }),
        4.0,    // friction
        1.0     // restitution
    );

    let wheel_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ wireframe: true,
        wireframeLinewidth: 1.5, color: 0x444444 }),
        4.0,    // friction
        0.1     // restitution
    );
    let scaleFactor = 1.4;
    let wheel_geometry = new THREE.SphereGeometry( 1.4, 16, 16);
    let caster_geometry = new THREE.SphereGeometry(1.2, 16, 16);

    // Loading bot model from json:
    let json_loader = new THREE.ObjectLoader();
    json_loader.load( "models/bot.json", function( bot, bot_materials ){

        console.log(bot);
        bot.body = new Physijs.CylinderMesh(
            bot.geometry,
            new THREE.MeshStandardMaterial({
                color: 0x2194ce,
                wireframe: false,
                wireframeLinewidth: 2.0,
                roughness: 0.5,
                metalness: 0.5}),
            50
        );

        let scaleFactor = 1.7;
        bot.body.scale.set(scaleFactor, scaleFactor, scaleFactor);
        bot.body.position.y = 5;
        bot.body.castShadow = bot.body.receiveShadow = true;

        let vehicle = new Physijs.Vehicle(bot.body, new Physijs.VehicleTuning(
            100.88,
            10.83,
            0.28,
            500,
            10.5,
            6000
        ));

        // Attach cameras to bot
        for (let ii = 0; ii < views.length; ii++){
            if (views[ii].attach) {
                bot.body.add(views[ii].camera);
            }
        }

        //bot.body.add(headlights);
        scene.add( vehicle );

        let dWheel = 2;
        for ( var i = 0; i < 4; i++ ) {
            vehicle.addWheel(wheel_geometry,
                wheel_material,
                new THREE.Vector3(
                		i % 2 === 0 ? -dWheel : dWheel,
                		0,
                		i < 2 ? dWheel : -dWheel
                ),
                new THREE.Vector3( 0, -1, 0 ),
                new THREE.Vector3( -1, 0, 0 ),
                1.4,
                1.4,
                i % 2 ? false : true
            );
        }

        let input = {
            power: null,
            direction: null,
            steering: 0
        };

        scene.addEventListener(
            'update', function() {

                if ( input && vehicle ) {
                    if ( input.direction !== null ) {
                        input.steering += input.direction / 50;
                        if ( input.steering < -1 ) input.steering = -1;
                        if ( input.steering > 1 ) input.steering = 1;

                        vehicle.applyEngineForce( input.steering*1000, 0 );
                        vehicle.applyEngineForce( input.steering*1000*-1, 1 );
                    }
                    else {
                        input.steering *= 0.95;
                        vehicle.applyEngineForce( input.steering*1000, 0);
                        vehicle.applyEngineForce( input.steering*1000*-1, 1 );
                    }

                    // for steerable wheels:
                    //vehicle.setSteering( input.steering, 0 );
                    //vehicle.setSteering( input.steering, 1 );

                    if ( input.power === true ) {
                        vehicle.applyEngineForce( 100 );
                    }
                    else if ( input.power === false ) {
                        vehicle.applyEngineForce( 0 );
                        vehicle.setBrake( 10 );
                    }

                    else if (input.direction === null && input.power === null) {
                        vehicle.applyEngineForce( 0 );
                        vehicle.setBrake( 0 );
                    }
                }

                scene.simulate( undefined, 5 );
            }
        );

        document.addEventListener('keydown', function( ev ) {
            switch ( ev.keyCode ) {
                case 37: // left
                input.direction = 1;
                break;

                case 38: // forward
                input.power = true;
                break;

                case 39: // right
                input.direction = -1;
                break;

                case 40: // back
                input.power = false;
                break;
            }
        });
        document.addEventListener('keyup', function( ev ) {
            switch ( ev.keyCode ) {
                case 37: // left
                input.direction = null;
                break;

                case 38: // forward
                input.power = null;
                break;

                case 39: // right
                input.direction = null;
                break;

                case 40: // back
                input.power = null;
                break;
            }
        });

        /*
        bot.wheel_fl = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            1000
        );
        bot.wheel_fl.rotation.x = Math.PI / 2;
        bot.wheel_fl.position.set( 0, 7.5, 5.5 );
        bot.wheel_fl.receiveShadow = bot.wheel_fl.castShadow = true;
        scene.add( bot.wheel_fl );

        bot.wheel_fl_constraint = new Physijs.DOFConstraint(
            bot.wheel_fl, bot.body, new THREE.Vector3( 0, 7.5, 5.5 )
        );
        scene.addConstraint( bot.wheel_fl_constraint );
        bot.wheel_fl_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 1 });
        bot.wheel_fl_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });

        bot.wheel_fr = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500
        );
        bot.wheel_fr.rotation.x = Math.PI / 2;
        bot.wheel_fr.position.set( 0, 7.5, -5.5 );
        bot.wheel_fr.receiveShadow = bot.wheel_fr.castShadow = true;
        scene.add( bot.wheel_fr );

        bot.wheel_fr_constraint = new Physijs.DOFConstraint(
            bot.wheel_fr, bot.body, new THREE.Vector3( 0, 7.5, -5.5 )
        );
        scene.addConstraint( bot.wheel_fr_constraint );

        bot.wheel_fr_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 1 });
        bot.wheel_fr_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });

        bot.wheel_caster = new Physijs.CylinderMesh(
            caster_geometry,
            wheel_material,
            500
        );
        bot.wheel_caster.rotation.x = Math.PI / 2;
        bot.wheel_caster.position.set( 4.5, 7.5, 0 );
        bot.wheel_caster.receiveShadow = bot.wheel_caster.castShadow = true;
        scene.add( bot.wheel_caster );

        bot.wheel_caster_constraint = new Physijs.DOFConstraint(
            bot.wheel_caster, bot.body, new THREE.Vector3( 2.5, 7.5, 0 )
        );
        scene.addConstraint( bot.wheel_caster_constraint );

        bot.wheel_caster_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
        bot.wheel_caster_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });


        // Controls / user interaction
        document.addEventListener('keydown', function(ev) { bot_keydown(bot, ev) });
        document.addEventListener('keyup',   function(ev) {   bot_keyup(bot, ev) });
        */
    });
}

//==============================================================================

function createText() {

    const CLASS_NAME = "view-title";
    const PX = "px";

    let canvas          = $('#canvas')
    let canvas_height   = canvas.height();
    let canvas_width    = canvas.width();

    // remove all titles if any (used for window size changes)
    $("." + CLASS_NAME).remove();

    // create titles
    for (let ii = 0; ii < views.length; ++ii ) {
        let view = views[ii];

        let base_height = 20, base_width = 0;
        var cam_title = document.createElement('div');
        cam_title.innerHTML = view.name || "Camera #" + (ii+1);
        cam_title.className = CLASS_NAME;
        cam_title.style.position = 'absolute';
        cam_title.style.bottom = view.boundaries.bottom * canvas_height + base_height + PX;
        cam_title.style.left = view.boundaries.left * canvas_width + base_width + PX;

        canvas.append(cam_title);
    }
}
