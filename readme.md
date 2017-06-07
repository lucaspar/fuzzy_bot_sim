[Simulador de um Robô Controlado por Lógica Fuzzy](https://github.com/lucaspar/fuzzy_bot_sim)
===

Este código consiste em uma simulação de um sistema de lógica fuzzy construída em JavaScript capaz de executar em um navegador com suporte a HTML5 e, idealmente, em uma máquina com uma unidade de processamento gráfico.

### Dependências ###

* [**jQuery**](https://jquery.com/) - HTML manipulation and event handling
* [**Three.js**](https://threejs.org/) - JavaScript 3D library
* [**Physijs**](https://chandlerprall.github.io/Physijs/) - Physics plugin for Three.js
* [**Stats.js**](https://github.com/mrdoob/stats.js/) - JavaScript performance monitor
* [**Simplex-noise**](http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf) - Noise algorithm

### Visão Geral ###

* #### Cena
    ##### Componentes de criação da cena (scene.js)

    Função              | Descrição
    --------------------|-------------------------------------------------------
    setRenderer()       | Define renderizador de tela
    setScene()          | Define cena e gravidade
    setLights()         | Cria toda a iluminação da cena
    setCameras()        | Cria as câmeras descritas em 'views.json'
    createGround()      | Cria superfície sólida com altura aleatória e textura
    createObstacles()   | Cria obstáculos aleatórios e limites do mapa
    createBot()         | Cria robô com corpo, rodas, física e controle
    createSensors()     | Cria e inicializa os sensores e visualização

* #### Dinâmica
    ##### Componentes de evolução do sistema (dynamics.js)

    Função              | Descrição
    --------------------|-------------------------------------------------------
    update()            | Atualiza diversos componentes da simulação
    updateSensors()     | Simula funcionamento dos sensores e projeções
    updateControl()     | Ponte entre o controle e os atuadores do robô
    updateText()        | Atualiza textos da visualização
    updateWindowSize()  | Atualiza tamanho do canvas ao redimensionar janela

* #### Controle
    ##### Componentes de controle do robô (controls.js, fuzzy.js)

    Função              | Descrição
    --------------------|-------------------------------------------------------
    autoDrive()         | Pilota o robô baseado nas regras fuzzy e na velocidade
    fuzzy()             | Aplica conjunto de regras fuzzy na leitura dos sensores
