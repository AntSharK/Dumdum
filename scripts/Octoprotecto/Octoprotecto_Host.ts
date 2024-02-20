class Octoprotecto {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            physics: {
                default: 'arcade',
                arcade: {
                    //debug: true
                }
            },

            parent: 'octoprotectogame',
            width: 1024,
            height: 768,
            backgroundColor: '#FFFFFF',
            transparent: false,
            clearBeforeRender: false,
            scene: [BattleArena],
            scale: {
                mode: Phaser.Scale.ScaleModes.FIT,
                resizeInterval: 1,
            },
            disableContextMenu: true,
            autoFocus: true,
        });
    }
}

class BattleArena extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    octopiMap: { [id: string]: Octopus } = {};
    soloRun: boolean = false;
    spawningRect: Phaser.Geom.Rectangle;
    keyboardDirection: [x: integer, y: integer] = [0, 0];
    octopiMoveBounds: Phaser.Geom.Rectangle;

    fishes: Phaser.Physics.Arcade.Group;
    octopi: Phaser.Physics.Arcade.Group;
    weapons: Phaser.Physics.Arcade.Group;
    bullets: Phaser.Physics.Arcade.Group;

    constructor() {
        super({ key: 'BattleArena', active: false, visible: true });
    }

    preload() {
        this.load.image('ocean', '/content/Octoprotecto/ocean.jpg');
        this.load.image('octopus', '/content/Octoprotecto/ghost.png');
        this.load.image('fish', '/content/Octoprotecto/star.png');
        this.load.image('dummy', '/content/Octoprotecto/dummy.png');
        this.load.image('bullet', '/content/Octoprotecto/bullet.png');
        this.load.image('fin', '/content/Octoprotecto/fin.png');
        this.load.spritesheet('explosion', '/content/Octoprotecto/explosionframes.png', { frameWidth: 128, frameHeight: 128 });
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        var background = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, 'ocean');
        background.displayWidth = this.game.canvas.width;
        background.displayHeight = this.game.canvas.height;
        background.depth = -1;
        this.spawningRect = new Phaser.Geom.Rectangle(50, 50, this.game.canvas.width - 100, this.game.canvas.height - 100);
        var octopusImage = this.textures.get("octopus").getSourceImage();
        this.octopiMoveBounds = new Phaser.Geom.Rectangle(octopusImage.width / 2, octopusImage.height / 2, this.game.canvas.width - octopusImage.width, this.game.canvas.height - octopusImage.height);

        this.anims.create({
            key: 'explosion_anim',
            frames: this.anims.generateFrameNumbers('explosion', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }),
            frameRate: 20,
            repeat: 0
        })
        /* ***********
         * KEYBOARD CONTROLS - FOR SINGLE PLAYER ONLY
         * ************ */
        this.input.keyboard.on('keydown-RIGHT', event => {
            this.keyboardDirection[0] = 1;
        }, this);
        this.input.keyboard.on('keyup-RIGHT', event => {
            this.keyboardDirection[0] = 0;
        }, this);
        this.input.keyboard.on('keydown-LEFT', event => {
            this.keyboardDirection[0] = -1;
        }, this);
        this.input.keyboard.on('keyup-LEFT', event => {
            this.keyboardDirection[0] = 0;
        }, this);
        this.input.keyboard.on('keydown-UP', event => {
            this.keyboardDirection[1] = -1;
        }, this);
        this.input.keyboard.on('keyup-UP', event => {
            this.keyboardDirection[1] = 0;
        }, this);
        this.input.keyboard.on('keydown-DOWN', event => {
            this.keyboardDirection[1] = 1;
        }, this);
        this.input.keyboard.on('keyup-DOWN', event => {
            this.keyboardDirection[1] = 0;
        }, this);

        this.octopi = this.physics.add.group({
            defaultKey: 'octopus',
            immovable: true,
        });

        this.fishes = this.physics.add.group({
            defaultKey: 'fish',
            immovable: false,
            bounceX: 1,
            bounceY: 1,
            collideWorldBounds: true
        });

        this.weapons = this.physics.add.group({
            defaultKey: 'dummy',
            immovable: true
        });

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            immovable: false
        });

        this.physics.add.overlap(this.fishes, this.weapons, (body1, body2) => {
            var weapon = body2 as Weapon;
            var fish = body1 as Fish;
            if (!(fish.uniqueName in weapon.fishesInRange)) {
                weapon.fishesInRange[fish.uniqueName] = fish;
            }
        });

        this.physics.add.overlap(this.fishes, this.bullets, (body1, body2) => {
            var bullet = body2 as Bullet;
            var fish = body1 as Fish;
            bullet.ApplyHit(fish);
        });
    }

    startGame(soloRun: boolean) {
        if (soloRun) {
            this.soloRun = true;
            this.spawnOctopus("SoloPlayer",
                0x00FFFF,
                this.game.canvas.width / 2,
                this.game.canvas.height / 2);
        }

        this.time.addEvent({
            delay: 2500,
            callback: () => Fish.SpawnFishes(this, 5, this.spawningRect, this.fishes, this.octopi),
            callbackScope: this,
            loop: true,
            startAt: 3500
        });

        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        signalRconnection.invoke("StartRoom", roomId).catch(function (err) {
            return console.error(err.toString());
        });
    }

    spawnOctopus(playerId: string, playerColor: number, startX: number, startY: number) {
        var newOctopus = new Octopus(playerId,
            this,
            startX,
            startY,
            this.octopi,
            this.weapons,
            this.bullets,
            playerColor);

        this.octopiMap[playerId] = newOctopus;
    }

    update() {
        this.graphics.clear();

        /* ***********
         * KEYBOARD CONTROLS - FOR SINGLE PLAYER ONLY
         * ************ */
        if (this.soloRun
            && (this.keyboardDirection[0] != 0 || this.keyboardDirection[1] != 0)) {

            for (let key in this.octopiMap) {
                let soloOctopus = this.octopiMap[key];

                // Ideally, running at 30FPS, we'll have to move at least OCTOPUSSPEED * 33 per update cycle since it's 33ms per cycle
                soloOctopus.desiredX = soloOctopus.x + this.keyboardDirection[0] * soloOctopus.speed * 50;
                soloOctopus.desiredY = soloOctopus.y + this.keyboardDirection[1] * soloOctopus.speed * 50;
            }
        }

        for (let key in this.octopiMap) {
            let octopus = this.octopiMap[key];
            octopus.UpdateOctopus(this.graphics);
        }
    }
}
