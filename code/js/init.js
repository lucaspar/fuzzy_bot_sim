'use strict';

Physijs.scripts.worker = 'js/physijs/physijs_worker.js'
let windowWidth, windowHeight, mouseX, mouseY;
let renderer, scene, stats, camera;

let views = [
    {
        name: "Back view",
        attach: true,
        boundaries: {
            left: 0,
            bottom: 0,
            width: 0.7,
            height: 1.0,
        },
        fov: 60,
        background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
        position: {
            x: 0,
            y: 3,
            z: -10
        },
    },
    {
        name: "Isometric view",
        attach: true,
        boundaries: {
            left: 0.7,
            bottom: 0.5,
            width: 0.3,
            height: 0.5,
        },
        fov: 15,
        background: new THREE.Color().setRGB( 0.5, 0.7, 0.7 ),
        position: {
            x: -20,
            y: 10,
            z: 20
        },
        projection: "perspective"
    },
    {
        name: "Top view",
        attach: false,
        boundaries: {
            left: 0.7,
            bottom: 0,
            width: 0.3,
            height: 0.5,
        },
        background: new THREE.Color().setRGB( 0.7, 0.5, 0.5 ),
        position: {
            x: 1,
            y: 100,
            z: 0
        },
        projection: "ortho",
        frustrum: {
            w: 510,
            h: 510
        },
        zoom: 5
    }
];

function init() {

    stats = new Stats();

    setRenderer();
    setScene();
    setCameras();

    createGround();
    //createVehicle();
    createBot();
    createText();

    let container = document.getElementById( 'canvas' )
    container.appendChild( renderer.domElement );
    container.appendChild( stats.dom );

    // TODO: add camera updates on mouse drag

    scene.simulate();
    animate();

};

function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - windowWidth / 2 );
    mouseY = ( event.clientY - windowHeight / 2 );
}

function updateSize() {

    if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight-100 ) {
        windowWidth  = window.innerWidth;
    	windowHeight = window.innerHeight-100;
    	renderer.setSize ( windowWidth, windowHeight );

        createText();       // update screen text for new position
    }
}

function animate (delta, renderer) {
    render();
    stats.update();
    requestAnimationFrame( animate );
};

function render() {

    updateSize();

    for ( let ii = 0; ii < views.length; ++ii ) {

        let view = views[ii];
        camera = view.camera;

        //view.updateCamera( camera, scene, mouseX, mouseY );

        let left   = Math.floor( windowWidth  * view.boundaries.left );
        let bottom = Math.floor( windowHeight * view.boundaries.bottom );
        let width  = Math.floor( windowWidth  * view.boundaries.width );
        let height = Math.floor( windowHeight * view.boundaries.height );

        renderer.setViewport( left, bottom, width, height );
        renderer.setScissor( left, bottom, width, height );
        renderer.setScissorTest( true );
        renderer.setClearColor( view.background );

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.render( scene, camera );
    }
}

window.onload = init;
