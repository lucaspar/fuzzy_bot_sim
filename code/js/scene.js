'use strict';

function setRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setClearColor( 0xdddddd );
    renderer.setSize( window.innerWidth, 600 );
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
}

//===========================================================================================

function setLights(scene) {

    var light = new THREE.DirectionalLight( 0xFFFFFF, 1 );

    light.position.set( 90, 90, 0 );
    light.target.position.copy( scene.position );
    light.castShadow            = true;
    light.shadow.camera.left    = -100;                     // for area of 200 x 200
    light.shadow.camera.top     = -100;
    light.shadow.camera.right   = 100;
    light.shadow.camera.bottom  = 100;
    light.shadow.camera.near    = 20;
    light.shadow.camera.far     = 200;
    light.shadow.bias           = -.001
    light.shadow.mapSize.width  = light.shadow.mapSize.height = 2048;

    var helper = new THREE.CameraHelper( light.shadow.camera );         // debug helper
    scene.add( helper );

    var ambientLight = new THREE.AmbientLight( 0x404040 );              // ambient light
    scene.add( ambientLight );

    scene.add( light );                                                 // directional light
    //scene.add( new THREE.HemisphereLight( 0xccccff, 0xccffcc, 0.3 ) );  // env light
}

//==============================================================================

function setCameras() {
    for (var ii = 0; ii < views.length; ++ii ) {
        var view = views[ii];
        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.set( view.position.x, view.position.y, view.position.z );
        camera.lookAt( scene.position );
        view.camera = camera;
    }
}

function setCameraBack() {
    cameraBack = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    cameraBack.position.set( 0, 3, -15 );
    cameraBack.lookAt( scene.position );
}

function setCameraTop() {
    cameraTop = new THREE.OrthographicCamera(
        window.innerWidth/-2, window.innerWidth/2,
        window.innerHeight/2, window.innerHeight/-2,
        -100, 1000
    );
    cameraTop.zoom = 2.4;
    cameraTop.updateProjectionMatrix();
    cameraTop.position.set( 0, 10, 0 );
    cameraTop.lookAt( scene.position );
}

function setCameraIso() {
    cameraIso = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    cameraIso.position.set( 45, 90, 45 );
    cameraIso.lookAt( scene.position );
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

function createGround() {

    var loader = new THREE.TextureLoader();

    var ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ map: loader.load( 'scene/pattern.png' ) }),
        1,  // high friction
        0.4 // low restitution
    );
    ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
    ground_material.map.repeat.set( 15, 15 );

    //var hmSource = "scene/s01.bin"
    //heightMap(hmSource, 1);	not working :/

    var noise_gen = new SimplexNoise;
    var ground_geometry = new THREE.PlaneGeometry( 200, 200, 50, 50 );
    for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
        var vertex = ground_geometry.vertices[i];
        vertex.z = noise_gen.noise( vertex.x / 50, vertex.y / 50 ) * 0;
    }
    ground_geometry.computeFaceNormals();
    ground_geometry.computeVertexNormals();

    var ground = new Physijs.HeightfieldMesh(
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

    var car_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xff6666 }),
        1.0,    // friction
        1.0     // restitution
    );

    var wheel_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0x444444 }),
        0.3,    // friction
        0.1     // restitution
    );
    var scaleFactor = 1.4;
    var wheel_geometry = new THREE.CylinderGeometry( 1.4, 1.4, 0.6, 64 );

    // Loading car model from json:
    var json_loader = new THREE.JSONLoader();
    json_loader.load( "models/mustang.js", function( car, car_materials ){

        car.body = new Physijs.BoxMesh(
            car,
            new THREE.MeshFaceMaterial( car_materials )
        );
        var scaleFactor = 1.4;
        car.body.scale.set(scaleFactor, scaleFactor, scaleFactor);
        car.body.position.y = 10;
        car.body.rotation.y = - Math.PI / 2;
        car.body.castShadow = car.body.receiveShadow = true;

        var vehicle = new Physijs.Vehicle(car.body, new Physijs.VehicleTuning(
            10.88,
            1.83,
            0.28,
            500,
            10.5,
            6000
        ));
        car.body.add(cameraBack);
        car.body.add(light);
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
        car.wheel_fl_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 });
        car.wheel_fl_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 });

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

        car.wheel_fr_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 });
        car.wheel_fr_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 });

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
        document.addEventListener( 'keydown', function(ev) { keydown(car, ev) } );
        document.addEventListener( 'keyup',   function(ev) {   keyup(car, ev) } );
    });
}
