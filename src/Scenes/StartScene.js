class start extends Phaser.Scene {
    constructor() {
        super('start');
    }

    preload() {
        // Load the background image and button assets
        this.load.image('background', 'assets/background.png');
        this.load.image('button', 'assets/flatLight40.png');
    }

    create() {
        // Add the background image and scale it to fit the screen
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(this.scale.width, this.scale.height);

        // Add a button and make it interactive
        const button = this.add.image(400, 300, 'button').setInteractive(); // Adjust position as needed
        button.on('pointerdown', () => {
            this.scene.start('controls'); // Navigate to the controls page
        });

        document.getElementById('description').innerHTML = "<h2>Welcome to the game! Click the button to learn the controls.<h2>";

        let credits = "<h3>Game by Izzy Schrack<h3>" + 
                      "Used Packs:<br>" + 
                      "https://kenney.nl/assets/alien-ufo-pack<br>" + 
                      "https://kenney.nl/assets/platformer-art-extended-enemies<br>" + 
                      "https://kenney.nl/assets/onscreen-controls<br>";
        document.getElementById('credits').innerHTML = credits;
    }

    update() {

    }

}