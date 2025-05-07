class alien3 extends Phaser.Scene {
    constructor() {
        super('alien3');
        this.my = { sprite: {} };
        this.bodyX = 40;
        this.bodyY = 300;
    }

    preload(){

        // Load images for the player, enemy, and projectile
        this.load.image("alien_standing", "assets/Alien sprites/alienBlue_stand.png");
        this.load.image("projectile", "kenney_alien-ufo-pack/PNG/laserBlue1.png");
        this.load.image('enemy', "assets/Enemy sprites/slimeGreen.png");
        this.load.image('health', "assets/Alien sprites/alienBlue_badge1.png");
        this.load.image('enemy2', "assets/Enemy sprites/spider_walk1.png");
        this.load.image('enemy2_hit', "assets/Enemy sprites/spider_hit.png");
        this.load.image("alien_hurt", "assets/Alien sprites/alienBlue_hurt.png");
        this.load.image('gorp_health', 'assets/Alien sprites/alienGreen_badge2.png');

        this.load.setPath('kenney_alien-ufo-pack/PNG/');
        this.load.image('gorp', 'shipGreen_manned.png');
        this.load.image('ship_hit', 'laserGreen_burst.png');
        this.load.image('gorp_laser', 'laserGreen1.png');


        // Ignore
        this.load.setPath('assets/');
        this.load.image("ground_tiles", "scifi_spritesheet.png");
        this.load.image("block_tiles", "sand_packed.png");
        this.load.tilemapTiledJSON("map1", "alien1.json");

    }

    create() {

        let my = this.my;

         // Ignore
        this.map = this.add.tilemap("map1", 16, 16, 50, 37);
        this.tileset = this.map.addTilesetImage("sand-blocks", "block_tiles");
        this.tileset2 = this.map.addTilesetImage("landscape_tiles", "ground_tiles");
        let blockLayer = this.map.createLayer('barrier', this.tileset, 0, 0);
        blockLayer.setVisible(false);

        // put alien on the screen towards left side center
        my.sprite = this.physics.add.sprite(this.bodyX, this.bodyY, 'alien_standing').setOrigin(0.5, 0.5).setScale(2);
        my.sprite.setCollideWorldBounds(true); // prevent going off screen
        
        // Enable collision between the player and the block layer
        this.physics.add.collider(my.sprite, blockLayer);

        // Group to hold projectiles
        my.projectiles = this.physics.add.group();

        //set up W and S keys for movement
        this.cursors = this.input.keyboard.addKeys('W,S');
        this.cursors.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // space bar for shooting

        // Group to hold enemy slimes
        my.enemies = this.physics.add.group();
        this.physics.add.collider(my.enemies, blockLayer);

        // Shrink player sprite by 50%
        my.sprite.setScale(1);

        // Shrink projectile by 50%
        my.projectileScale = 0.25; // Store scale for projectiles

        // Add a wave counter
        my.waveCount = 0;

        // Spawn waves of enemies every 10 seconds, up to 5 waves
        this.time.addEvent({
            delay: 10000, // 10 seconds
            callback: this.spawnEnemyWave,
            callbackScope: this,
            loop: true
        });

        // Update overlap to check all projectiles and all enemies in the group
        this.physics.add.overlap(my.projectiles, my.enemies, this.hitEnemy, null, this);

        // Add player health
        my.health = 3;

        // Create health images in the bottom-right corner
        my.healthImages = [];
        for (let i = 0; i < my.health; i++) {
            const healthImage = this.add.image(750 - i * 40, 550, 'health').setScale(0.5).setScrollFactor(0);
            my.healthImages.push(healthImage);
        }

        // Add collision between enemies and the player
        this.physics.add.collider(my.enemies, my.sprite, (player, enemy) => {
            if (enemy.texture.key === 'gorp') {
                console.log('Gorp hit the player! Moving diagonally to the right.');
                enemy.setVelocity(200, 200); // Move diagonally to the right

                // Player takes damage
                if (this.my.canBeDamaged) {
                    this.playerHit(player, null); // Pass null to avoid disabling the gorp
                }
            } else {
                this.playerHit(player, enemy);
            }
        });

        // Add a cooldown flag for shooting
        my.canShoot = true;

        document.getElementById('description').innerHTML = '<h2>Level 3: Boss Level</h2>';

        // Add a health property to track hits for spiders
        my.enemies.getChildren().forEach(enemy => {
            if (enemy.texture.key === 'enemy2') {
                enemy.health = 2; // Spiders take 2 hits
            }
        });

        // Enable world bounds for enemies and listen for when they go off the screen
        my.enemies.children.iterate((enemy) => {
            enemy.setCollideWorldBounds(false);
            enemy.body.onWorldBounds = true;
        });

        this.physics.world.on('worldbounds', (body) => {
            const enemy = body.gameObject;
            if (enemy && enemy.texture.key === 'enemy2') {
                enemy.disableBody(true, true); // Remove the spider
                console.log('Spider went off-screen and is counted as killed.');
            }
        });

        // Add a flag to track if the level is completed
        my.levelCompleted = false;

        // Add a flag to track if the player can be damaged
        my.canBeDamaged = true;

        // Enable world bounds for the gorp and listen for collisions with walls
        this.physics.world.on('worldbounds', (body) => {
            const enemy = body.gameObject;
            if (enemy && enemy.texture.key === 'gorp') {
                console.log('Gorp hit a wall! Reversing direction.');
                enemy.setVelocity(-enemy.body.velocity.x, -enemy.body.velocity.y);
            }
        });

        // Group to hold gorp lasers
        my.gorpLasers = this.physics.add.group();

        // Add collision between gorp lasers and the player
        this.physics.add.overlap(my.gorpLasers, my.sprite, this.playerHitByLaser, null, this);

        // Add a group to hold gorp health images
        my.gorpHealthImages = [];
    }

    update() {

        if (this.cursors.W.isDown) {
            this.my.sprite.setVelocityY(-200); // move up
        }
        else if (this.cursors.S.isDown) {
            this.my.sprite.setVelocityY(200); // move down
        } else {
            this.my.sprite.setVelocityY(0); // stop moving
        }

        if (this.cursors.space.isDown && this.my.canShoot) {
            this.shootProjectile();
        }

        // Check if all slimes are killed
        const allSlimesKilled = this.my.enemies.getChildren().every(enemy => {
            return enemy.texture.key !== 'enemy' || !enemy.active;
        });

        if (allSlimesKilled && this.my.waveCount >= 5) {
            console.log('All slimes defeated. Switching to EndScene.');
            document.getElementById('description').innerHTML = '<h2>Level 3 Complete!</h2>';

            // Set the levelCompleted flag to true
            this.my.levelCompleted = true;

            // Add a delay before switching to Alien3Scene
            this.time.delayedCall(3000, () => { // 3-second delay
                this.scene.start('end'); // Switch to end
            });
        }

/*         // Check if all enemies are killed and wave count is 5 or more
        if (this.my.waveCount >= 5 && this.my.enemies.countActive(true) === 0) {
            console.log('All enemies defeated after wave 5. Switching to Alien3Scene.');
            document.getElementById('description').innerHTML = '<h2>Level 2 Complete!</h2>';

            // Add a delay before switching to Alien3Scene
            this.time.delayedCall(3000, () => { // 3-second delay
                this.scene.start('alien3'); // Switch to Alien3Scene
            });
        } */
    }

    spawnEnemyWave() {
        const my = this.my;

        // Stop spawning waves after 1 wave (only gorp)
        if (my.waveCount >= 1) {
            console.log('Maximum waves reached. Stopping enemy spawns.');
            return;
        }

        // Increment wave counter
        my.waveCount += 1;
        console.log(`Spawning wave ${my.waveCount}`);

        // Spawn a single gorp with increased speed
        const x = Phaser.Math.Between(750, 800); // Start near the right edge
        const y = Phaser.Math.Between(50, 550);  // Random y position
        const gorp = my.enemies.create(x, y, 'gorp').setOrigin(0.5, 0.5).setScale(1); // Gorp sprite
        gorp.setCollideWorldBounds(true); // Enable collision with world bounds
        gorp.setBounce(1); // Enable bouncing
        gorp.setVelocity(Phaser.Math.Between(-300, -250), Phaser.Math.Between(-250, 250)); // Increased speed
        gorp.health = 20; // Set gorp health to 20 hits

        // Initialize gorp health bar at the top of the screen using gorp_health image
        for (let i = 0; i < gorp.health; i++) {
            const healthImage = this.add.image(50 + i * 15, 20, 'gorp_health').setScale(0.5).setScrollFactor(0);
            my.gorpHealthImages.push(healthImage);
        }

        // Make the gorp shoot lasers periodically
        this.time.addEvent({
            delay: 2000, // Fire a laser every 2 seconds
            callback: () => {
                if (gorp.active) {
                    this.shootGorpLaser(gorp);
                }
            },
            loop: true
        });
    }

    hitEnemy(projectile, enemy) {
        projectile.destroy(); // Remove the projectile

        // Check if the enemy is the gorp
        if (enemy.texture.key === 'gorp') {
            if (!enemy.health) enemy.health = 20; // Initialize health if not set
            enemy.health -= 1;

            console.log(`Gorp hit! Remaining health: ${enemy.health}`);

            // Update gorp health bar
            if (this.my.gorpHealthImages.length > 0) {
                const healthImage = this.my.gorpHealthImages.pop();
                healthImage.destroy();
            }

            // Flash the ship_hit sprite at the gorp's position
            const hitEffect = this.add.sprite(enemy.x, enemy.y, 'ship_hit').setOrigin(0.5, 0.5).setScale(1);
            this.time.delayedCall(200, () => {
                hitEffect.destroy(); // Remove the hit effect after 200ms
            });

            // Destroy the gorp if health reaches 0
            if (enemy.health <= 0) {
                enemy.disableBody(true, true); // Makes gorp disappear
                console.log('Gorp defeated!');

                // Transition to the 'end' scene
                document.getElementById('description').innerHTML = '<h2>Level 3 Complete!</h2>';
                this.time.delayedCall(3000, () => { // 3-second delay
                    this.scene.start('end'); // Switch to end
                });
            }
        }
    }

    shootProjectile() {
        const my = this.my;

        // Create a new projectile
        const projectile = my.projectiles.create(my.sprite.x, my.sprite.y, 'projectile').setOrigin(0.5, 0.5).setScale(my.projectileScale);
        projectile.setActive(true);
        projectile.setVisible(true);

        // Rotate the projectile 90 degrees
        projectile.setAngle(90);

        // Set velocity to shoot straight to the right
        projectile.setVelocity(300, 0);

        // Set cooldown to prevent multiple shots
        my.canShoot = false;
        this.time.delayedCall(500, () => {
            my.canShoot = true; // Reset cooldown after 500ms
        });
    }

    playerHit(player, enemy) {
        // Prevent actions if the level is already completed
        if (this.my.levelCompleted || !this.my.canBeDamaged) {
            return;
        }

        if (enemy) {
            enemy.disableBody(true, true); // Makes other enemies disappear
        }

        // Decrease player health
        this.my.health -= 1;
        console.log(`Player hit! Health remaining: ${this.my.health}`);

        // Remove one health image
        if (this.my.healthImages.length > 0) {
            const healthImage = this.my.healthImages.pop();
            healthImage.destroy();
        }

        // Check for game over
        if (this.my.health <= 0) {
            console.log('Game Over!');
            this.scene.restart(); // Restart the scene
            return;
        }

        // Flash the alien_hurt image
        player.setTexture('alien_hurt');
        this.time.delayedCall(100, () => {
            player.setTexture('alien_standing'); // Revert back to the original texture
        });

        // Prevent the player sprite from moving
        player.setVelocity(0);
    }

    // Method to make the gorp shoot a laser
    shootGorpLaser(gorp) {
        const my = this.my;

        // Create a laser at the gorp's position
        const laser = my.gorpLasers.create(gorp.x, gorp.y, 'gorp_laser').setOrigin(0.5, 0.5).setScale(0.5);
        laser.setAngle(90); // Rotate the laser 90 degrees to make it horizontal
        laser.setVelocity(-400, 0); // Move the laser to the left
        laser.setCollideWorldBounds(false); // Allow lasers to go off-screen
    }

    // Handle player being hit by a gorp laser
    playerHitByLaser(player, laser) {
        laser.destroy(); // Remove the laser

        // Decrease player health
        this.my.health -= 1;
        console.log(`Player hit by laser! Health remaining: ${this.my.health}`);

        // Remove one health image
        if (this.my.healthImages.length > 0) {
            const healthImage = this.my.healthImages.pop();
            healthImage.destroy();
        }

        // Flash the alien_hurt image
        player.setTexture('alien_hurt');
        this.time.delayedCall(100, () => {
            player.setTexture('alien_standing'); // Revert back to the original texture
        });

        // Check for game over
        if (this.my.health <= 0) {
            console.log('Game Over!');
            this.scene.restart(); // Restart the scene
        }
    }

}