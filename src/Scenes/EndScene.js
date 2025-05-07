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

        // Retrieve the score from the registry
        const score = this.registry.get('score') || 0;

        // Display the final score
        this.add.text(400, 250, `Your Score: ${score}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        // Display the alien sprite
        this.add.image(400, 300, 'alienBlueJump').setScale(0.5);

        // Add a button to go back to the 'start' scene
        const button = this.add.image(400, 400, 'button').setInteractive();
        button.on('pointerdown', () => {
            this.scene.start('start');
        });

        document.getElementById('description').innerHTML = "<h2>Congrats! You have completed the game. Click the button to return to the start screen.<h2>";
    }

    update() {

    }

}