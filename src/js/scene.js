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
    scene.addEventListener('update', function(ev) { update(); } );
    scene.setGravity(new THREE.Vector3( 0, -98, 0 ));
    scene.simulate();

    if (collidableMeshList === undefined){   collidableMeshList = [];   }
    if (projections === undefined) {         projections = [];          }

}

//==============================================================================

function setLights() {

    let ambientLight    = new THREE.AmbientLight( 0xffffff, 0.4 );
    let headlight       = new THREE.SpotLight( 0xFF0000, 1 );
    let sun             = new THREE.DirectionalLight( 0xFFFFFF, 1 );
    let helper          = new THREE.CameraHelper( sun.shadow.camera );

    sun.position.set( -90, 90, -90 );
    sun.target                  = scene;
    sun.castShadow              = true;
    sun.shadow.camera.left      = -142;     // 142 ~ 100 * sqrt(2): for area of 200 x 200
    sun.shadow.camera.top       = -142;
    sun.shadow.camera.right     = 142;
    sun.shadow.camera.bottom    = 142;
    sun.shadow.camera.near      = 0;
    sun.shadow.camera.far       = 300;
    sun.shadow.bias             = -.001
    sun.shadow.mapSize.width    = sun.shadow.mapSize.height = 4096;

    headlight.position.set( 0,0,5 );
    headlight.castShadow = false;

    scene.add( sun );
    scene.add( ambientLight );
    //scene.add( helper );
    //scene.add( headlight );
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
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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
    collidableMeshList.push( ground );
}

//==============================================================================

function createVehicle() {

    console.log("Refactor me, please");

    /*
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
    */
}

//==============================================================================

function createObstacles() {

    const NUM_BOXES = 20;

    let wall_geometry, wall, boxHeight = 5, boxWidth = 4;
    let wall_material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        wireframe: false,
        wireframeLinewidth: 2.0,
        roughness: 0.5,
        metalness: 0.5
    });

    // create random walls
    for(let ii = 0; ii<NUM_BOXES; ii++){
        let boxLength = randInt(15, 45);
        build(boxLength, randInt(-90,90), randInt(-90,90), Math.random() >= 0.5)
    }

    // create map boundaries
    build(200, 0, -100);
    build(200, 0, 100);
    build(200, -100, 0, true);
    build(200, 100, 0, true);

    // generate random integer between min and max
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // build a box given its length and location
    function build(boxLength, posX, posZ, rotate=false) {
        wall_geometry = new THREE.BoxGeometry(boxLength, boxHeight, boxWidth);
        wall = new Physijs.BoxMesh( wall_geometry, wall_material, 0 );
        wall.castShadow = true;
        wall.receiveShadow = true;
        if(rotate) {
            wall.rotation.y = Math.PI / -2;
        }
        wall.position.set( posX, boxHeight/2, posZ );

        scene.add(wall);
        collidableMeshList.push(wall);
    }
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
        wireframeLinewidth: 3, color: 0x444444 }),
        2.0,    // friction
        0.1     // restitution
    );
    let scaleFactor = 1.4;
    let wheel_geometry = new THREE.SphereGeometry( 1.0, 16, 16);

    // load bot model from json:
    let json_loader = new THREE.ObjectLoader();
    json_loader.load( "models/bot.json", function( bot, bot_materials ){

        body = new Physijs.CylinderMesh(
            bot.geometry,
            new THREE.MeshStandardMaterial({
                color: 0x2194ce,
                wireframe: false,
                wireframeLinewidth: 2.0,
                roughness: 0.5,
                metalness: 0.5}),
            50
        );

        let scaleFactor = 1.5;
        body.scale.set(scaleFactor, scaleFactor, scaleFactor);
        body.position.y = 5;
        body.castShadow = body.receiveShadow = true;

        vehicle = new Physijs.Vehicle(body, new Physijs.VehicleTuning(
            100.88,
            10.83,
            0.28,
            500,
            10.5,
            6000
        ));

        // attach cameras to bot
        for (let ii = 0; ii < views.length; ii++){
            if (views[ii].attach) {
                body.add(views[ii].camera);
            }
        }

        scene.add( vehicle );

        // add wheels
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
                !(i % 2)
            );
        }

        input = {
            power: null,
            direction: null,
            steering: 0
        };

        document.addEventListener('keydown', function(ev) { bot_keydown(ev); } );
        document.addEventListener('keyup',   function(ev) {   bot_keyup(ev); } );

        autoDrive();        // autonomous drive
    });
}

//==============================================================================

function createSensors(visible = true) {

    const TRACE_LENGTH  = 5;

    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.1;

    sensors = [];
    let sensorsDir = []
    sensorsDir.push( new THREE.Vector3( 1, 0, 1 ).normalize() );    // 45deg left
    sensorsDir.push( new THREE.Vector3( 0, 0, 1 ).normalize() );    // ahead
    sensorsDir.push( new THREE.Vector3( -1, 0, 1 ).normalize() );   // 45deg right

    for (let k=0; k<sensorsDir.length; k++) {
        sensors[k] = {
            id:         k,
            direction:  sensorsDir[k],
            distance:   null,
            type:       "IR"
        }
    }

    if (visible) {
        let projectionGeometry = new THREE.SphereGeometry( 0.8, 32, 32 );
        let projectionMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, shading: THREE.FlatShading } );

        for ( let i = 0; i < TRACE_LENGTH * sensors.length; i++ ) {
            let projection = new THREE.Mesh( projectionGeometry, projectionMaterial );
            scene.add( projection );
            projections.push( projection );
        }
    }

}
