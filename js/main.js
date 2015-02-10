window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render } );
    
    function preload() {
        // Loads images
        game.load.image( 'world', 'assets/CloudBackground.png' );
        game.load.image( 'catinabox', 'assets/KittenFlyer.png');
        game.load.image( 'monster', 'assets/Specter.png');
        game.load.image( 'magic', 'assets/Boltshot.png');
        game.load.image( 'coin', 'assets/Coin.png');
        
        // loads sound
        game.load.audio( 'castSound', 'assets/magicshot.mp3');
        game.load.audio( 'backgroundMusic', 'assets/AnimalCrossing-TownHall.ogg');
    }
    
    //background image
    var world;
    
    //player and monster sprites
    var player;
    var enemies;
    
    //controls coin creation
    var coins;
    var coinTimer = 2000;
    var nextCoin = 0;
    
    //player's current score
    var score;
    
    //game over message (and player death)
    var lost;
    var style;
    var lives = 3;
    var isAlive;
    
    //player input
    var cursors;
    var fireButton;
    
    //sounds
    var fx;
    var music;
    
    //related to firing
    var bolts;
    var nextFire = 0;
    var fireRate = 1000;
    var maxFireRate = 200;
    
    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        // creates background, player, and monsters
        world = game.add.tileSprite(0, 0, 800, 600, 'world');
        player = game.add.sprite( game.world.centerX, game.world.centerY, 'catinabox');
        
        // Create a sprite at the center of the screen using the 'logo' image.
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.
        player.anchor.setTo( 0.5, 0.5 );
        
        // Turn on the arcade physics engine for sprites.
        game.physics.enable( player, Phaser.Physics.ARCADE );
        // Make it bounce off of the world bounds.
        player.body.collideWorldBounds = true;
        
        
        // adds energy bullets
        bolts = game.add.group();
        bolts.enableBody = true;
        bolts.physicsBodyType = Phaser.Physics.ARCADE;
        bolts.createMultiple(30, 'magic', 0, false);
        bolts.setAll('anchor.x', 0.5);
        bolts.setAll('anchor.y', 0.5);
        bolts.setAll('outOfBoundsKill', true);
        bolts.setAll('checkWorldBounds', true);
        
         // adds coins
        coins = game.add.group();
        coins.enableBody = true;
        coins.physicsBodyType = Phaser.Physics.ARCADE;
        coins.createMultiple(30, 'coin', 0, false);
        coins.setAll('anchor.x', 0.5);
        coins.setAll('anchor.y', 0.5);
        coins.setAll('outOfBoundsKill', true);
        coins.setAll('checkWorldBounds', true);
        
        // Player controls
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        // Adds sound
        fx = game.add.audio('castSound');
        music = game.add.audio('backgroundMusic', 1, true);
        music.play('', 0, 1, true);
        
        //initializes score and player's 1 life
        score = 0;
        isAlive = true;
        
        //creates game over
        style = { font: "65px Arial", fill: "#ff0044", align: "center" };
    }
    
    function update() {
        //controls background movement
        world.tilePosition.x -= 2;
        
        // Controls movement of the player
        player.body.velocity.setTo(0, 0);
        if (cursors.left.isDown)
        {
            player.body.velocity.x = -150;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 150;
        }
        if (cursors.up.isDown)
        {
            player.body.velocity.y = -150;
        }
        else if (cursors.down.isDown)
        {
            player.body.velocity.y = 150;
        }
        
        //controls player firing
        if ((fireButton.isDown) && isAlive)
        {
                shoot();
        }
        
        //controls coin creation
        createCoin();
        
        //now to check enemies
        //game.physics.arcade.overlap(bolts, enemies, magicHandler, null, this);
        //game.physics.arcade.overlap(enemies, player, monsterHandler, null, this);
    }
    
    function shoot() {
        if (game.time.now > nextFire && bolts.countDead() > 0)
        {
            nextFire = game.time.now + fireRate;

            var bullet = bolts.getFirstExists(false);

            bullet.reset(player.x + 30, player.y);

            bullet.body.velocity.x = 400;
            
            fx.play();
        }
    }
    
    function createCoin() {
        if (game.time.now > nextCoin && coins.countDead() > 0)
        {
            nextCoin = game.time.now + coinTimer;

            var coin = coins.getFirstExists(false);

            coin.reset(800, game.world.randomY);

            coin.body.velocity.x = -200;
        }
    }
    
    function magicHandler (enemy, bolt) {

        bolt.kill();
        enemy.kill();
        score += 20;
    }
    
    function monsterHandler(player, enemy)
    {
        player.kill();
        isAlive = false;
        lost = game.add.text(game.world.centerX, game.world.centerY, "GAME OVER!", style);
        lost.anchor.setTo( 0.5, 0.5);
    }
    
    
    function render() {    
        game.debug.text('Score: ' + score, 32, 580);
        game.debug.text('Lives: ' + lives, 32, 560);
    }
};
