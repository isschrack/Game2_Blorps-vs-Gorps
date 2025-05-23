class alien2 extends Phaser.Scene {
    constructor() {
        super('alien2');
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
        this.physics.add.collider(my.enemies, my.sprite, this.playerHit, null, this);

        // Add a cooldown flag for shooting
        my.canShoot = true;

        document.getElementById('description').innerHTML = '<h2>Level 2: Wave 1</h2>';

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

        // Display score on the bottom left of the screen
        my.scoreText = this.add.text(10, 550, `Score: ${this.registry.get('score')}`, { fontSize: '20px', fill: '#fff' }).setScrollFactor(0);
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
            console.log('All slimes defeated. Switching to Alien3Scene.');
            document.getElementById('description').innerHTML = '<h2>Level 2 Complete!</h2>';

            // Add a delay before switching to Alien3Scene
            this.time.delayedCall(3000, () => { // 3-second delay
                this.registry.set('score', this.registry.get('score')); // Save score to registry
                this.scene.start('alien3'); // Switch to Alien3Scene
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

        // Stop spawning waves after 5 waves
        if (my.waveCount >= 5) {
            console.log('Maximum waves reached. Stopping enemy spawns.');
            return;
        }

        // Increment wave counter
        my.waveCount += 1;
        console.log(`Spawning wave ${my.waveCount}`);
        document.getElementById('description').innerHTML = `<h2>Level 2: Wave ${my.waveCount}</h2>`;

        // Spawn 5 slime enemies near the right wall
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(750, 800); // Random x position close to the right wall
            const y = Phaser.Math.Between(50, 550);  // Random y position
            const enemy = my.enemies.create(x, y, 'enemy').setOrigin(0.5, 0.5).setScale(1); // Shrink slime sprite by 50%
            enemy.setCollideWorldBounds(true);
            enemy.setBounce(1);
            enemy.setVelocity(Phaser.Math.Between(-100, -50), Phaser.Math.Between(-100, 100)); // Move left with random vertical movement
        }

        // Spawn 3 spider enemies that zigzag across the screen
        for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(750, 800); // Random x position close to the right wall
            const y = Phaser.Math.Between(50, 550);  // Random y position
            const spider = my.enemies.create(x, y, 'enemy2').setOrigin(0.5, 0.5).setScale(1); // Spider sprite
            spider.setCollideWorldBounds(false); // Allow spiders to go off-screen
            spider.setVelocity(Phaser.Math.Between(-150, -100), Phaser.Math.Between(-50, 50)); // Zigzag movement
            spider.setBounce(1);

            // Add zigzag behavior
            this.time.addEvent({
                delay: 500, // Change direction every 500ms
                callback: () => {
                    spider.setVelocityY(Phaser.Math.Between(-100, 100)); // Random vertical movement
                },
                loop: true
            });
        }
    }

    hitEnemy(projectile, enemy) {
        projectile.destroy(); // Remove the projectile

        // Check if the enemy is a spider
        if (enemy.texture.key === 'enemy2') {
            if (!enemy.health) enemy.health = 2; // Initialize health if not set
            enemy.health -= 1;

            // Flash the enemy2_hit image
            enemy.setTexture('enemy2_hit');
            this.time.delayedCall(200, () => {
                enemy.setTexture('enemy2'); // Revert back to the original texture
            });

            // Award points only if the spider is killed
            if (enemy.health <= 0) {
                this.registry.set('score', this.registry.get('score') + 5); // Spider is worth 5 points
                enemy.disableBody(true, true); // Makes enemy disappear
            }
        } else {
            // For other enemies, award points and destroy them immediately
            this.registry.set('score', this.registry.get('score') + 1); // Slime is worth 1 point
            enemy.disableBody(true, true);
        }

        // Update score display
        this.my.scoreText.setText(`Score: ${this.registry.get('score')}`);
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
        enemy.disableBody(true, true); // Makes enemy disappear

        // Decrease player health
        this.my.health -= 1;
        console.log(`Player hit! Health remaining: ${this.my.health}`);

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

        // Prevent the player sprite from moving
        player.setVelocity(0);

        // Check for game over
        if (this.my.health <= 0) {
            console.log('Game Over!');
            this.scene.restart(); // Restart the scene
        }
    }

}