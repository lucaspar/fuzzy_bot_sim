
function update() {

    clock++;

    updateSensors();
    updateControl();

    if (clock%20 == 0) {
        updateText();
    }

    autoDrive();

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
            sensors[k].distance = intersection.distance * 1.5;

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

    const TURNING_FORCE = 400;

    if ( input && vehicle ) {

        let effective_turning = TURNING_FORCE * input.steering;

        if ( input.direction !== null ) {
            input.steering += input.direction / 50;
            if ( input.steering < -1 ) input.steering = -1;
            if ( input.steering > 1 ) input.steering = 1;

            effective_turning = TURNING_FORCE * input.steering;

            vehicle.applyEngineForce( effective_turning, 0 );
            vehicle.applyEngineForce( -effective_turning, 1 );
        }
        else {
            input.steering *= 0.95;
            vehicle.applyEngineForce( effective_turning, 0);
            vehicle.applyEngineForce( -effective_turning, 1 );
        }

        // for steerable wheels:
        //vehicle.setSteering( input.steering, 0 );
        //vehicle.setSteering( input.steering, 1 );

        if ( input.power === true ) {
            vehicle.setBrake( 0 );
            vehicle.applyEngineForce( 10 );
        }
        else if ( input.power === false ) {
            vehicle.applyEngineForce( 0 );
            vehicle.setBrake( 3 );
        }
        else if (input.direction === null && input.power === null) {
            vehicle.applyEngineForce( 0 );
        }
    }

}

//==============================================================================

function updateText() {

    const VIEW_CLASS        = "view-title";
    const SENSORS_CLASS     = "sim-data"
    const PX                = "px";
    const base_height       = 50
    const base_width        = 0;

    let canvas          = $('#canvas')
    let canvas_height   = canvas.height();
    let canvas_width    = canvas.width();

    // remove all titles if any (used for window size changes)
    let view_title      = $("." + VIEW_CLASS);
    let sensor_data     = $("." + SENSORS_CLASS);

    if (view_title.length == 0) {

        // create view titles
        for (let ii = 0; ii < views.length; ++ii ) {
            let view = views[ii];
            view_title = $('<div></div>');
            view_title.addClass(VIEW_CLASS);
            view_title.css({
                position: 'absolute',
                bottom: view.boundaries.bottom * canvas_height + base_height + PX,
                left: view.boundaries.left * canvas_width + base_width + PX
            });
            canvas.append(view_title);
        }
    }

    // update view titles
    if (clock%60 == 0) {
        for (let ii = 0; ii < views.length; ++ii ) {
            let view = views[ii];
            let title = view.name || "Camera #" + (ii+1);
            if(view_title[ii]){
                view_title[ii].innerHTML = title;
            }
        }
    }

    if(sensor_data.length == 0) {
        sensor_data = $('<div></div>');
        sensor_data.addClass(SENSORS_CLASS);
        sensor_data.css({
            position: 'absolute',
            top: 50 + PX
        });
        canvas.append(sensor_data);
    }

    // update sensors data
    let data = "<p>ENVIRONMENT DATA:</p>";
    for (let k=0; k<sensors.length; k++) {
        let s = sensors[k];
        data += s.type + " sensor #" + sensors[k].id + ": " + Math.floor(sensors[k].distance) + "<br>";
    }
    let arrow = "";
    switch(fuzzyDir) {
        case -30: arrow = "&lt--"; break;
        case -15: arrow = "&lt-"; break;
        case 0: arrow = "/\\"; break;
        case 15: arrow = "-&gt"; break;
        case 30: arrow = "--&gt"; break;
    }
    data += "<br>Fuzzy output: " + fuzzyDir + " " + arrow;
    sensor_data.each(function(){$(this).html(data);});

}

//==============================================================================

function updateWindowSize() {
    if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight-100 ) {
        windowWidth  = window.innerWidth;
    	windowHeight = window.innerHeight-100;
    	renderer.setSize ( windowWidth, windowHeight );
        $(".view-title").remove();
    }
}
