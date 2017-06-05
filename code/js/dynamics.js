
function update() {

    updateSensors();
    updateControl();
    updateText();

    scene.simulate( undefined, 3 );

}

//==============================================================================

function updateSensors () {

    if (projectionsIndex === undefined) { projectionsIndex = 0; }
    if (!sensors) {
        console.log("Call createSensors() first");
        return;
    }

    let botRotation = new THREE.Matrix4().extractRotation( body.matrix );
    // apply bot's rotation to sensors
    for (let k = 0; k < sensors.length; k++){

        // apply bot's rotation to sensor directions
        let direction = sensors[k].direction.clone();
        direction.applyMatrix4( botRotation );
        raycaster.set( body.position, direction );

        // get intersections
        let intersections = raycaster.intersectObjects( collidableMeshList );
        let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

        // update sensor projections
        if ( intersection ) {
            sensors[k].distance = intersection.distance;

            projections[ projectionsIndex ].position.copy( intersection.point );
            projections[ projectionsIndex ].scale.set( 1, 1, 1 );
            projectionsIndex = ( projectionsIndex + 1 ) % projections.length;
        }
    }

    // draw projections
    for ( var i = 0; i < projections.length; i++ ) {
        var projection = projections[ i ];
        projection.scale.multiplyScalar( 0.98 );
        projection.scale.clampScalar( 0.01, 1 );
    }

}

//==============================================================================

function updateControl () {

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
            vehicle.setBrake( 0 );
            vehicle.applyEngineForce( 100 );
        }
        else if ( input.power === false ) {
            vehicle.applyEngineForce( 0 );
            vehicle.setBrake( 10 );
        }

        else if (input.direction === null && input.power === null) {
            vehicle.applyEngineForce( 0 );
        }
    }

}

//==============================================================================

function updateText() {

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

//==============================================================================

function updateWindowSize() {
    if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight-100 ) {
        windowWidth  = window.innerWidth;
    	windowHeight = window.innerHeight-100;
    	renderer.setSize ( windowWidth, windowHeight );
    }
}
