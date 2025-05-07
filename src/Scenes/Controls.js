class controls extends Phaser.Scene {
    constructor() {
        super('controls');
    }

    preload() {
        this.load.image('button', 'assets/flatLight40.png');
    }

    create() {
        // Add text explaining the controls
        this.add.text(100, 100, 'Controls:', { font: '32px Arial', fill: '#ffffff' });
        this.add.text(100, 150, 'W: Move Up', { font: '24px Arial', fill: '#ffffff' });
        this.add.text(100, 200, 'S: Move Down', { font: '24px Arial', fill: '#ffffff' });
        this.add.text(100, 250, 'Space: Shoot', { font: '24px Arial', fill: '#ffffff' });

        // Add text explaining the game mechanics
        this.add.text(100, 350, 'Some enemies will take more hits than others.', { font: '24px Arial', fill: '#ffffff' });

        // Add a start button and make it interactive
        const startButton = this.add.image(400, 500, 'button').setInteractive(); // Adjust position as needed
        startButton.on('pointerdown', () => {
            this.scene.start('alien1'); // Navigate back to the start scene
        });

        document.getElementById('description').innerHTML = "<h2>Learn the controls and game mechanics. Click the button to start the game.<h2>";
    }

    update() {

    }

}