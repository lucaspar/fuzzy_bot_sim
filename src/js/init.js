'use strict';

Physijs.scripts.worker = 'js/physijs/physijs_worker.js'

let windowWidth, windowHeight, mouseX, mouseY;                  // window
let renderer, scene, stats, camera, views;                      // scene
let collidableMeshList, projections, projectionsIndex, body;    // physics
let clock, input, sensors, vehicle, raycaster, fuzzyDir;        // control

//==============================================================================

function init() {

    stats = new Stats();

    setRenderer();              // canvas renderer, antialias, canvas dimensions
    setScene();                 // scene, gravity, init vars
    setLights();                // sun, ambient light
    setCameras();               // set cameras from views.json

    createGround();             // solid ground with height and texture
    createObstacles();          // random solid boxes and map boundaries
    createBot();                // drivable bot
    createSensors();            // sensors and visualization

    let container = document.getElementById( 'canvas' )
    container.appendChild( renderer.domElement );
    container.appendChild( stats.dom );

    clock = 0;
    animate();

};

//==============================================================================

function animate() {
    updateWindowSize();
    renderScenes();
    stats.update();
    requestAnimationFrame( animate );
};

//==============================================================================

function renderScenes() {
    for ( let ii = 0; ii < views.length; ++ii ) {

        let view = views[ii];
        camera = view.camera;

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
