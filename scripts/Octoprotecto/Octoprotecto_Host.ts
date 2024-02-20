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
    octopus: Octopus;

    fishes: Phaser.Physics.Arcade.Group;
    octopi: Phaser.Physics.Arcade.Group;
    weapons: Phaser.Physics.Arcade.Group;
    bullets: Phaser.Physics.Arcade.Group;

    keyboardDirection: [x: integer, y: integer] = [0, 0];
    spawningRect: Phaser.Geom.Rectangle;

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
            this.octopus = new Octopus("testOctopus",
                this,
                this.game.canvas.width / 2,
                this.game.canvas.height / 2,
                this.octopi,
                this.weapons,
                this.bullets,
                0x00FFFF);
        }

        this.time.addEvent({
            delay: 2500,
            callback: () => Fish.SpawnFishes(this, 5, this.spawningRect, this.fishes, this.octopi),
            callbackScope: this,
            loop: true,
            startAt: 3500
        });
    }

    update() {
        this.graphics.clear();

        /* ***********
         * KEYBOARD CONTROLS - FOR SINGLE PLAYER ONLY
         * ************ */
        if (this.keyboardDirection[0] != 0 || this.keyboardDirection[1] != 0) {

            // Ideally, running at 30FPS, we'll have to move at least OCTOPUSSPEED * 33 per update cycle since it's 33ms per cycle
            this.octopus.desiredX = this.octopus.x + this.keyboardDirection[0] * this.octopus.speed * 50;
            this.octopus.desiredY = this.octopus.y + this.keyboardDirection[1] * this.octopus.speed * 50;
        }

        this.octopus?.UpdateOctopus(this.graphics);
    }
}

var octoProtecto: Octoprotecto;
var battleArenaScene: BattleArena;
const RoomIdSessionStorageKey = "roomid";
const UserIdSessionStorageKey = "userid";

window.onload = () => {
    octoProtecto = new Octoprotecto();

    document.getElementById("hostgamebutton").addEventListener("click", function (event) {
        battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        var menuElements = document.getElementsByClassName("lobbymenu");
        [].forEach.call(menuElements, function (element, index, array) {
            element.hidden = true;
        });
        battleArenaScene.scene.setActive(true);
        document.getElementById("lobbyhostcontent").hidden = false;
        event.preventDefault();
    });

    document.getElementById("sologamebutton").addEventListener("click", function (event) {
        battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        var menuElements = document.getElementsByClassName("lobbymenu");
        [].forEach.call(menuElements, function (element, index, array) {
            element.hidden = true;
        });
        battleArenaScene.scene.setActive(true);
        battleArenaScene.startGame(true);
        event.preventDefault();
    });

    document.getElementById("startgamebutton").addEventListener("click", function (event) {
        if (battleArenaScene.octopi.children.size <= 0) {
            window.alert("No players in game!");
            return;
        }

        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        if (roomId == null) {
            window.alert("Error: No room ID!");
            return;
        }

        var menuElements = document.getElementsByClassName("lobbymenu");
        [].forEach.call(menuElements, function (element, index, array) {
            element.hidden = true;
        });
        battleArenaScene.startGame(false);
        event.preventDefault();
    });
};