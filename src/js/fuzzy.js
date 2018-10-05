
// Given a sensor array sensors, returns new angle of orientation for the robot
// Params: sensors {type: numbers array, length: 3};
function fuzzy(sensors) {

    const MP = 0, P = 1, L = 2, ML = 3;                 // distance (inputs)
    const ME = -30, E = -15, R = 0, D = 15, MD = 30;    // angle    (outputs)

    const NUM_INPUT_CURVES = 4;                         // number of input curves
    const rules =                                       // set of rules
        [
            [
                [MD,D,D,MD],
                [R,D,D,MD],
                [R,D,D,MD],
                [R,D,D,MD]
            ],
            [
                [ME,D,D,MD],
                [E,D,D,MD],
                [E,R,D,D],
                [E,R,D,D]
            ],
            [
                [ME,E,MD,MD],
                [E,E,D,D],
                [ME,ME,R,R],
                [ME,E,R,R]
            ],
            [
                [ME,ME,ME,MD],
                [E,E,E,D],
                [ME,E,R,R],
                [ME,E,R,R]
            ]
        ];

    let width = 85;                 // 255 / 3
    let weights = [];
    let fuzzy_distances = [];       // the fuzzified distance read by each sensor
    for (let s=0; s<sensors.length; s++) {
        let sw = [];

        // fuzzify
        sw = getWeights(sensors[s], NUM_INPUT_CURVES, width)
        weights.push(sw);

        // aggregation
        fuzzy_distances.push( sw.indexOf( Math.max.apply(Math, sw) ) );
    }

    // defuzzy and return
    let s1 = fuzzy_distances[0];
    let s2 = fuzzy_distances[1];
    let s3 = fuzzy_distances[2];
    let defuzzy = rules[s1][s2][s3];

    return defuzzy;

    /*
    total_weights = [];
    max_weight = 0;
    max_indexes = {};
    output = 0;
    for (let x=0; x<NUM_INPUT_CURVES; x++){
        total_weights[x] = [];

        for (let y=0; y<NUM_INPUT_CURVES; y++){
            total_weights[x][y] = [];

            for (let z=0; z<NUM_INPUT_CURVES; z++){
                total_weights[x][y][z] = weights[0][x] * weights[0][y] * weights[0][z];
                total_weights[x][y][z] += weights[1][x] * weights[1][y] * weights[1][z];
                total_weights[x][y][z] += weights[2][x] * weights[2][y] * weights[2][z];
                total_weights[x][y][z] /= 3;    // normalize
                output += rules[x][y][z] * total_weights[x][y][z];
                if (total_weights[x][y][z] > max_weight) {
                    max_weight = total_weights[x][y][z];
                    max_indexes.x = x;
                    max_indexes.y = y;
                    max_indexes.z = z;
                }
            }
        }
    }
    console.log("max_weight: " + max_weight);
    console.log("max*max_weight: " + rules[max_indexes.x][max_indexes.y][max_indexes.z]*max_weight);
    console.log("output: " + output);

    for (let s=0; s<sensors.length; s++) {
        console.log("S" + s + ": " + weights[s]);
    }

    */

}

// Given a @value and a base @width, returns @num_curves activation weights
// using a triangular function, where the sum of weights is always 1.
function getWeights(value, num_curves, width) {

    const DEBUG = false;
    let peaks = [];
    let weights = [];
    let distances = [];

    // get peaks of curves
    for (let c=0; c<num_curves; c++) {
        peaks[c] = c*width;
    }

    // calculate weights based on the distance to peaks
    for (let c=0; c<num_curves; c++) {
        distances[c] = Math.abs(peaks[c] - value);
        weights[c] = 1 - Math.min((distances[c] / width), 1);
    }

    if (DEBUG) {
        function add(a,b){return a+b};
        console.log("dist:\t\t" + distances);
        console.log("peaks:\t\t" + peaks);
        console.log("weights:\t" + weights);
        console.log("w. sum:\t\t" + weights.reduce(add, 0));
    }

    return weights;
}
