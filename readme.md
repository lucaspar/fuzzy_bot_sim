## Fuzzy logic controlled robot simulation
### [DEMO](https://lucaspar.com/fuzzy_bot.html)

This is a simulation of a robot controlled by **fuzzy logic**.
It is built in JavaScript and runs in modern browsers, ideally in a machine with a graphics accelerator.

### Project dependencies

* [**jQuery**](https://jquery.com/) - HTML manipulation and event handling
* [**Three.js**](https://threejs.org/) - JavaScript 3D library
* [**Physijs**](https://chandlerprall.github.io/Physijs/) - Physics plugin for Three.js
* [**Stats.js**](https://github.com/mrdoob/stats.js/) - JavaScript performance monitor
* [**Simplex-noise**](http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf) - Noise generation algorithm

### Visão Geral ###

* #### Scene components `scene.js`

    Method              | Description
    --------------------|-------------------------------------------------------
    setRenderer()       | Sets scene renderer
    setScene()          | Sets overall scene and gravity
    setLights()         | Creates lighting components
    setCameras()        | Creates cameras from `views.json` description
    createGround()      | Creates a solid floor and texture
    createObstacles()   | Creates map and obstacles of random sizes and positions
    createBot()         | Creates a robot with body, wheels, physics, and controls
    createSensors()     | Creates and initializes sensors and visualization

* #### Dynamics and system evolution `dynamics.js`

    Method              | Description
    --------------------|-------------------------------------------------------
    update()            | Simulation update loop
    updateSensors()     | Simulates sensors' operations and their projections
    updateControl()     | Bridge between controller and bot actuators
    updateText()        | UI texts update loop
    updateWindowSize()  | Updates canvas on window resize

* #### Bot controls `controls.js`, `fuzzy.js`

    Method              | Description
    --------------------|-------------------------------------------------------
    autoDrive()         | Drives the bot based on fuzzy rules and speed
    fuzzy()             | Applies the set of fuzzy rules from sensor readings
