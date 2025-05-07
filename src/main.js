// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// 1D Movement Test
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
    },
    scene: [
/*         start,
        controls, 
        alien1,
        alien2, */
        alien3,
        end
    ]
}

const game = new Phaser.Game(config);