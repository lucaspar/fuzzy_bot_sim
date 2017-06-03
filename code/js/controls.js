function keydown (car, ev) {
    switch( ev.keyCode ) {
        case 65:
        case 37:
            // Left
            car.wheel_fl_constraint.configureAngularMotor( 1, -Math.PI / 3, Math.PI / 3, 5, 200 );
            car.wheel_fr_constraint.configureAngularMotor( 1, -Math.PI / 3, Math.PI / 3, 5, 200 );
            car.wheel_fl_constraint.enableAngularMotor( 1 );
            car.wheel_fr_constraint.enableAngularMotor( 1 );
            break;

        case 68:
        case 39:
            // Right
            car.wheel_fl_constraint.configureAngularMotor( 1, -Math.PI / 3, Math.PI / 3, -5, 200 );
            car.wheel_fr_constraint.configureAngularMotor( 1, -Math.PI / 3, Math.PI / 3, -5, 200 );
            car.wheel_fl_constraint.enableAngularMotor( 1 );
            car.wheel_fr_constraint.enableAngularMotor( 1 );
            break;

        case 87:
        case 38:
            // Up
            car.wheel_bl_constraint.configureAngularMotor( 2, 1, 0, 30, 5000 );
            car.wheel_br_constraint.configureAngularMotor( 2, 1, 0, 30, 5000 );
            car.wheel_bl_constraint.enableAngularMotor( 2 );
            car.wheel_br_constraint.enableAngularMotor( 2 );
            break;

        case 83:
        case 40:
            // Down
            car.wheel_bl_constraint.configureAngularMotor( 2, 1, 0, -30, 5000 );
            car.wheel_br_constraint.configureAngularMotor( 2, 1, 0, -30, 5000 );
            car.wheel_bl_constraint.enableAngularMotor( 2 );
            car.wheel_br_constraint.enableAngularMotor( 2 );
            break;
    }
};

function keyup (car, ev) {
    switch( ev.keyCode ) {

        case 65:
        case 37:
            // Left
            car.wheel_fl_constraint.configureAngularMotor( 1, 0, 0, 5, 200 );
            car.wheel_fr_constraint.configureAngularMotor( 1, 0, 0, 5, 200 );
            car.wheel_fl_constraint.disableAngularMotor( 1 );
            car.wheel_fr_constraint.disableAngularMotor( 1 );
            break;

        case 68:
        case 39:
            // Right
            car.wheel_fl_constraint.configureAngularMotor( 1, 0, 0, -5, 200 );
            car.wheel_fr_constraint.configureAngularMotor( 1, 0, 0, -5, 200 );
            car.wheel_fl_constraint.disableAngularMotor( 1 );
            car.wheel_fr_constraint.disableAngularMotor( 1 );
            break;

        case 87:
        case 38:
            // Up
            car.wheel_bl_constraint.disableAngularMotor( 2 );
            car.wheel_br_constraint.disableAngularMotor( 2 );
            break;

        case 83:
        case 40:
            // Down
            car.wheel_bl_constraint.disableAngularMotor( 2 );
            car.wheel_br_constraint.disableAngularMotor( 2 );
            break;
    }
}
