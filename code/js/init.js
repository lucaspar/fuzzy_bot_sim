'use strict';

Physijs.scripts.worker = 'js/physijs/physijs_worker.js'
let renderer, scene, stats, cameraBack, cameraTop, cameraIso, camera, renderCam, light;
let windowWidth, windowHeight, mouseX, mouseY;

let views = [
    {
        left: 0,
        bottom: 0,
        width: 0.5,
        height: 1.0,
        background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
        position: {
            x: 0,
            y: 3,
            z: -15
        },
        fov: 60
    },
    {
        left: 0.5,
        bottom: 0,
        width: 0.5,
        height: 0.5,
        background: new THREE.Color().setRGB( 0.7, 0.5, 0.5 ),
        position: {
            x: 10,
            y: 10,
            z: -15
        },
        fov: 50
    },
    {
        left: 0.5,
        bottom: 0.5,
        width: 0.5,
        height: 0.5,
        background: new THREE.Color().setRGB( 0.5, 0.7, 0.7 ),
        position: {
            x: 45,
            y: 90,
            z: 45
        },
        fov: 70
    }
];

function init() {

    stats = new Stats();

    setRenderer();
    setScene();
    setCameras();

    createGround();
    createVehicle();

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

    if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
        windowWidth  = window.innerWidth;
    	windowHeight = window.innerHeight;
    	renderer.setSize ( windowWidth, windowHeight );
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
        renderCam = view.camera;

        //view.updateCamera( camera, scene, mouseX, mouseY );

        let left   = Math.floor( windowWidth  * view.left );
        let bottom = Math.floor( windowHeight * view.bottom );
        let width  = Math.floor( windowWidth  * view.width );
        let height = Math.floor( windowHeight * view.height );

        renderer.setViewport( left, bottom, width, height );
        renderer.setScissor( left, bottom, width, height );
        renderer.setScissorTest( true );
        renderer.setClearColor( view.background );

        renderCam.aspect = width / height;
        renderCam.updateProjectionMatrix();

        renderer.render( scene, renderCam );
    }
}

window.onload = init;
