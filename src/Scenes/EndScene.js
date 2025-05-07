class end extends Phaser.Scene {
    constructor() {
        super('end');
    }

    preload() {
        this.load.image('alienBlueJump', 'assets/Alien sprites/alienBlue_jump.png');
        this.load.image('button', 'assets/flatLight43.png');
    }

    create() {
        // Display "Congrats You Won!" message
        this.add.text(400, 200, 'Congrats You Won!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // Display the alien sprite
        this.add.image(400, 300, 'alienBlueJump').setScale(0.5);

        // Add a button to go back to the 'start' scene
        const button = this.add.image(400, 400, 'button').setInteractive();
        button.on('pointerdown', () => {
            this.scene.start('start');
        });

        document.getElementById('description').innerHTML = "Congrats! You have completed the game. Click the button to return to the start screen.";
    }

    update() {

    }

}