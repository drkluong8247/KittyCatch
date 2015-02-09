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
        game.load.image( 'world', 'assets/ForestBackground.png' );
        game.load.image( 'wizard', 'assets/Mage.png');
        game.load.image( 'monster', 'assets/Specter.png');
        game.load.image( 'magic', 'assets/Boltshot.png');
        
        // loads sound
        game.load.audio( 'castSound', 'assets/magicshot.mp3');
        game.load.audio( 'backgroundMusic', 'assets/AnimalCrossing-TownHall.ogg');
    }
    
    //background image
    var world;
    
    //player and monster sprites
    var player;
    var enemies;
    
    //player's current score
    var score;
    
    //game over message (and player death)
    var lost;
    var style;
    var isAlive;
    
    //player input
    var cursors;
    
    //sounds
    var fx;
    var music;
    
    //related to firing
    var bolts;
    var nextFire = 0;
    var fireRate = 300;
    
    //controls the player's blank periods
    var blank = true;
    var blankCount;
    var blankDuration;
    var blankCoolDown;
    
    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        // creates background, player, and monsters
        world = game.add.tileSprite(0, 0, 800, 600, 'world');
        player = game.add.sprite( game.world.centerX, game.world.centerY, 'wizard' );
        
        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        createEnemies();
        
        
        // Create a sprite at the center of the screen using the 'logo' image.
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.
        player.anchor.setTo( 0.5, 0.5 );
        
        // Turn on the arcade physics engine for sprites.
        game.physics.enable( player, Phaser.Physics.ARCADE );
        // Make it bounce off of the world bounds.
        player.body.collideWorldBounds = true;
        
        
        // adds magic bolts
        bolts = game.add.group();
        bolts.enableBody = true;
        bolts.physicsBodyType = Phaser.Physics.ARCADE;
        bolts.createMultiple(30, 'magic', 0, false);
        bolts.setAll('anchor.x', 0.5);
        bolts.setAll('anchor.y', 0.5);
        bolts.setAll('outOfBoundsKill', true);
        bolts.setAll('checkWorldBounds', true);
        
        // Player controls
        cursors = game.input.keyboard.createCursorKeys();
        
        // Adds sound
        fx = game.add.audio('castSound');
        music = game.add.audio('backgroundMusic', 1, true);
        music.play('', 0, 1, true);
        
        // player's blank moment parameters(initial)
        blankCount = 0;
        blankDuration = 200;
        blankCoolDown = blankDuration + 500;
        
        //initializes score and player's 1 life
        score = 0;
        isAlive = true;
        
        //creates game over
        style = { font: "65px Arial", fill: "#ff0044", align: "center" };
    }
    
    function createEnemies()
    {
        //modified from Invaders
        for(var y = 0; y < 20; y++)
        {
            var enemy = enemies.create(10, 10, 'monster');
            enemy.anchor.setTo(0.5, 0.5);
            enemy.body.bounce.set(1);
            enemy.body.velocity.x = game.rnd.integer() % 200;
            enemy.body.velocity.y = game.rnd.integer() % 200;
            enemy.body.collideWorldBounds = true;
        }
        
        enemies.x = 50;
        enemies.y = 50;
    }
    
    function update() {
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
        
        //controls when the player blanks out
        blankCount += 1;
        if((blank) && (blankCount > blankDuration))
        {
            blank = false;
        }
        
        if(blankCount > blankCoolDown)
        {
            blankCount = 0;
            blank = true;
            blankDuration = game.rnd.integer() % 200 + 200;
            blankCoolDown = game.rnd.integer() % 500 + 500;
        }
        
        //controls player firing
        if ((game.input.activePointer.isDown) && isAlive)
        {
            //  now to check if you're suffering from amnesia
            if(!blank)
            {
                castMagic();
            }
        }
        
        //now to check enemies
        game.physics.arcade.overlap(bolts, enemies, magicHandler, null, this);
        game.physics.arcade.overlap(enemies, player, monsterHandler, null, this);
        
        //revives enemies if all are dead (ALL AT ONCE!)
        if(!enemies.getFirstAlive())
        {
            startWave();
        }
    }
    
    function castMagic() {
        if (game.time.now > nextFire && bolts.countDead() > 0)
        {
            nextFire = game.time.now + fireRate;

            var bolt = bolts.getFirstExists(false);

            bolt.reset(player.x, player.y);

            bolt.rotation = game.physics.arcade.moveToPointer(bolt, 1000, game.input.activePointer, 500);
            
            fx.play();
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
    
    function startWave()
    {
        var resurrect = enemies.getFirstDead();
        
        while(resurrect)
        {
            resurrect.reset(0, 0);
            resurrect.body.velocity.x = game.rnd.integer() % 200;
            resurrect.body.velocity.y = game.rnd.integer() % 200;
            resurrect = enemies.getFirstDead();
        }
    }
    
    
    function render() {

        // notifys you about when you are blanking or not
        if(blank)
            game.debug.text('Wait, how do I cast spells again?', 32, 32);
        else
            game.debug.text('Oh, now I remember! Prepare to die monsters!', 32, 32)
            
        game.debug.text('Score: ' + score, 32, 580);
    }
};
