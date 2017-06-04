'use strict';

Physijs.scripts.worker = 'js/physijs/physijs_worker.js'
let windowWidth, windowHeight, mouseX, mouseY;
let renderer, scene, stats, camera;
let views;

//==============================================================================

function init() {

    stats = new Stats();

    setRenderer();
    setScene();
    setCameras();

    createGround();
    createObstacles();
    //createVehicle();
    createBot();
    createText();

    let container = document.getElementById( 'canvas' )
    container.appendChild( renderer.domElement );
    container.appendChild( stats.dom );

    scene.simulate();
    animate();

};

//==============================================================================

function updateSize() {
    if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight-100 ) {
        windowWidth  = window.innerWidth;
    	windowHeight = window.innerHeight-100;
    	renderer.setSize ( windowWidth, windowHeight );

        createText();       // update screen text for new position
    }
}

//==============================================================================

function animate (delta, renderer) {
    render();
    stats.update();
    requestAnimationFrame( animate );
};

//==============================================================================

function render() {

    updateSize();

    for ( let ii = 0; ii < views.length; ++ii ) {

        let view = views[ii];
        camera = view.camera;

        //console.log(scene.getObjectByName( 'bot', true ))

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

//==============================================================================

// START:
$.getJSON('js/views.json', function(response){
    views = response;
    window.onload = init;
 })
