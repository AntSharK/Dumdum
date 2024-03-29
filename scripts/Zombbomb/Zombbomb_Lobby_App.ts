﻿/* 
GAME SCENES
 * */
class Zombbomb_Lobby_Game {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: 1400, // "100%",
                height: 1024, //"97%",
                type: Phaser.AUTO,

                physics: {
                    default: 'arcade',
                    arcade: {
                        debug: false
                    }
                },

                input: {
                    gamepad: true,
                },

                scene: [ZombbombArena],
                backgroundColor: '#000000',

                scale: {
                    parent: "phaserapp",
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    mode: Phaser.Scale.FIT,
                },
            });
    }
}

/* 
GAME SCENES - BALL ARENA
 * */
class ZombbombArena extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    player: Player;
    bullets: Phaser.Physics.Arcade.Group;
    zombies: Phaser.Physics.Arcade.Group;
    pellets: Phaser.Physics.Arcade.Group;
    playerGroup: Phaser.Physics.Arcade.Group;

    roomCodeText: Phaser.GameObjects.Text;
    instructionText: Phaser.GameObjects.Text;

    zombieMap: { [id: string]: Zombie } = {};
    restartGameTimer: Phaser.Time.TimerEvent;
    gameStartTime: number;
    keyboardDirection: [x: integer, y: integer] = [0, 0];

    depositBoxRightBound: integer = 600;
    depositBoxTopBound: integer = 864;
    objectivesToWin: integer = 3;

    constructor() {
        super({ key: 'ZombbombArena', active: true });
    }

    preload() {
        this.load.image('zombie', '/content/Zombbomb/ghost.png');
        this.load.image('player', '/content/Zombbomb/pacman.png');
        this.load.image('bullet', '/content/Zombbomb/bullet.png');
        this.load.image('star', '/content/Zombbomb/star.png');
        this.load.spritesheet('explosion', '/content/Zombbomb/explosionframes2.png', { frameWidth: 128, frameHeight: 128 });
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
        });

        this.playerGroup = this.physics.add.group({
            defaultKey: 'player',
        });

        this.zombies = this.physics.add.group({
            defaultKey: 'zombie',
            immovable: true
        });

        this.pellets = this.physics.add.group({
            defaultKey: 'star',
            immovable: true
        });
        this.player = new Player(this, this.game.canvas.width / 2, this.game.canvas.height / 2);
        this.add.existing(this.player);
        this.playerGroup.add(this.player);

        // Spawn pellets
        var pellets: Phaser.Physics.Arcade.Sprite[] = [];
        for (var i = 0; i < 6; i++) {
            var newPellet = new Pellet(this, 100, 100);
            this.pellets.add(newPellet);
            this.add.existing(newPellet);
            pellets.push(newPellet);
        }

        Phaser.Actions.PlaceOnCircle(pellets,
            new Phaser.Geom.Circle(this.game.canvas.width / 2, this.game.canvas.height / 2, this.game.canvas.width * 0.44),
            -0.5,
            0.5);

        /* ***********
         * DEFINE COLLISIONS
         * ************ */
        const MAXPLAYERPELLETHOLD = 1;
        const MAXZOMBIEPELLETHOLD = 1;
        this.physics.add.overlap(this.playerGroup, this.pellets, (body1, body2) => {
            var pellet = body2 as Pellet;
            var player = body1 as Player;
            switch (GAMESTATE) {
                case "Arena":
                    if (pellet.attachedThing == null
                        && pellet.canAttachToPlayer
                        && player.attachedPellets.length < MAXPLAYERPELLETHOLD) {
                        pellet.attachedThing = player;
                        pellet.canAttachToPlayer = false;
                        player.attachedPellets.push(pellet);
                    }
                    break;
                case "SettingUp":
                default:
                    break;
            }
        });
        this.physics.add.overlap(this.zombies, this.pellets, (body1, body2) => {
            var pellet = body2 as Pellet;
            var zombie = body1 as Zombie;
            switch (GAMESTATE) {
                case "Arena":
                    if (pellet.attachedThing == null
                        && zombie.attachedPellets.length < MAXZOMBIEPELLETHOLD) {
                        pellet.attachedThing = zombie;
                        pellet.canAttachToPlayer = false;
                        zombie.attachedPellets.push(pellet);
                    }
                    break;
                case "SettingUp":
                default:
                    break;
            }
        });

        this.physics.add.overlap(this.bullets, this.zombies, (body1, body2) => {
            body1.destroy();
            var zombie = body2 as Zombie;

            switch (GAMESTATE) {
                case "Arena":
                    zombie.hitPoints--;
                    break;
                case "SettingUp":
                default:
                    break;
            }

            if (zombie.hitPoints <= 0) {
                zombie.KillZombie();
            }
        });

        this.physics.add.overlap(this.playerGroup, this.zombies, (body1, body2) => {
            switch (GAMESTATE) {
                case "Arena":
                    var player = body1 as Player;
                    player.zombiesInContact++;

                    var zombie = body2 as Zombie;
                    zombie.ticksSinceLastContact = 2;

                    break;
                case "SettingUp":
                default:
                    break;
            }
        });

        /* ***********
         * MOUSE CONTROLS
         * ************ */
        this.input.mouse.disableContextMenu();
        this.input.on('pointerdown', function (pointer) {
            if (pointer.rightButtonDown()) {
                this.player.IssueFiring(pointer);
            }
            else {
                this.player.IssueMoveToPointer(pointer);
            }
        }, this);

        /* ***********
         * KEYBOARD CONTROLS
         * ************ */
        this.input.keyboard.on('keydown-SPACE', event => {
            this.fireForward();
        }, this);
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

        this.anims.create({
            key: 'explosion_anim',
            frames: this.anims.generateFrameNumbers('explosion', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }),
            frameRate: 20,
            repeat: 0
        })

        this.drawSetupGraphics();
    }

    update() {
        this.checkDeposit();
        this.player.Update(this);
        this.zombies.children.each(function (b) {
            (<Zombie>b).Update();
        }, this);
        this.pellets.children.each(function (b) {
            (<Pellet>b).Update();
        }, this);

        /* ***********
         * KEYBOARD CONTROLS
         * ************ */
        if (this.keyboardDirection[0] != 0 || this.keyboardDirection[1] != 0) {
            var pointToMove = new Phaser.Math.Vector2(this.player.x + this.keyboardDirection[0] * PLAYERSPEED * 3, this.player.y + this.keyboardDirection[1] * PLAYERSPEED * 3);
            this.player.IssueMoveToPointer(pointToMove);
        }

        /* ************
         * GAMEPAD CONTROLS
         * *********** */
        if (this.input.gamepad.total > 0) {
            const pads = this.input.gamepad.gamepads;
            for (let i = 0; i < pads.length; i++) {
                const pad = pads[i];
                if (!pad) {
                    continue;
                }

                var directionVector = pad.leftStick;
                if (directionVector.length() > 0.25) {
                    var normalizedDirectionVector = directionVector.normalize();
                    var pointToMove = new Phaser.Math.Vector2(this.player.x + normalizedDirectionVector.x * PLAYERSPEED * 3, this.player.y + normalizedDirectionVector.y * PLAYERSPEED * 3);
                    this.player.IssueMoveToPointer(pointToMove);
                }

                if (pad.A || pad.B || pad.R1 || pad.R2) {
                    this.fireForward();
                }
            }
        }
    }

    fireForward() {
        var rot = this.player.rotation;
        var xProj = Math.cos(rot);
        var yProj = Math.sin(rot);
        var pointToFire = new Phaser.Math.Vector2(this.player.x + xProj * PLAYERSPEED * 100, this.player.y + yProj * PLAYERSPEED * 100);
        if (this.player.canFire) {
            this.player.IssueFiring(pointToFire);
        }
    }

    checkDeposit() {
        if (GAMESTATE != "Arena") return; // Only do this if the game is still going on

        var objectivesDeposited = 0;
        this.pellets.children.each(function (b) {
            var pellet = b as Pellet;
            if (pellet.IsInDeposit() && pellet.attachedThing == null) {
                objectivesDeposited++;
            }
        }, this);

        if (objectivesDeposited >= this.objectivesToWin) {
            // Server-side updates and state update
            endRound();

            // Client-side updates
            this.zombies.children.each(function (b) {
                (<Zombie>b).KillZombie();
            }, this);
            this.roomCodeText.setVisible(true);

            this.restartGameTimer = new Phaser.Time.TimerEvent({ delay: 8000, callback: this.restartGame, callbackScope: this });
            this.time.addEvent(this.restartGameTimer);
            var totalTimeMilliseconds = (this.game.getTime() - this.gameStartTime);
            this.roomCodeText.text = "TIME: " + totalTimeMilliseconds.toFixed(0);
        }
    }

    drawSetupGraphics() {
        // Draw setup things
        var sessionRoomId = sessionStorage.getItem("roomid");
        this.roomCodeText = this.add.text(200, 300, "CODE: " + sessionRoomId, { color: 'White', fontSize: '144px' });
        this.instructionText = this.add.text(150, 850, "MOVE HERE TO START", { color: 'White', fontSize: '72px' });

        // Draw the line at the zombie boundary
        this.graphics.lineStyle(10, 0x99ff00)
        this.graphics.lineBetween(0, 200, 1400, 200);
        this.graphics.lineBetween(0, 800, 1400, 800);
    }

    startGameRound() {
        GAMESTATE = "Arena";
        this.roomCodeText.setVisible(false);
        this.instructionText.setVisible(false);
        this.graphics.clear();
        this.gameStartTime = this.game.getTime();

        // Draw the star collection box
        this.add.text(50, 925, "GET " + this.objectivesToWin + " STARS", { color: 'White', fontSize: '72px' });
        this.graphics.lineStyle(10, 0x99ff00)
        this.graphics.strokeRect(0, this.depositBoxTopBound, this.depositBoxRightBound, 1024 - this.depositBoxTopBound);
        startRound();
    }

    restartGame() {
        if (GAMESTATE == "GameOver") {
            GAMESTATE = "Restarting"; // Client-side only game state, indicating that the game is restarting
            this.scene.restart();

            // Delay 100ms so that the client can refresh before server sends messages to respawn zombies
            setTimeout(resetZombies, 100);
        }
    }
}

var destroyZombie: (zombie: Zombie) => {};
var resetZombies: any;
var endRound: any;
var startRound: any;
var GAMESTATE: string = "SettingUp"; // Corresponds to Server-side Room GameState

// Configurations from server-side
var EXPLODETIME: number;
var ZOMBIESPEED: number;
var PLAYERSPEED: number;
var RELOADTIME: number;
var RESPAWNTIME: number;

function spawnZombie(playerId: string, colorIn: number, game: Phaser.Game): Zombie {
    var scene = game.scene.getScene("ZombbombArena") as ZombbombArena;
    var zombie = new Zombie(scene, Math.random() * game.canvas.width * 0.7 + game.canvas.width * 0.15, 50, playerId, colorIn);
    scene.add.existing(zombie);
    scene.zombies.add(zombie);
    scene.zombieMap[playerId] = zombie;
    zombie.setActive(true);
    return zombie;
}

function updatePosition(playerId: string, x: number, y: number, game: Phaser.Game) {
    var scene = game.scene.getScene("ZombbombArena") as ZombbombArena;
    var zombie = scene.zombieMap[playerId] as Zombie;
    zombie.desiredX = x;
    zombie.desiredY = y;
}

class Player extends Phaser.Physics.Arcade.Sprite {
    desiredX: integer = 0;
    desiredY: integer = 0;
    moveDirection: Phaser.Math.Vector2;
    desiredRotation: number;
    rotateLeft: boolean;

    rotationSpeed: number = 0.20;
    fireOrderIssued: boolean = false;
    canFire: boolean = true;
    zombiesInContact: integer = 0;
    attachedPellets: Pellet[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.scale = 0.2;

        this.desiredX = this.x;
        this.desiredY = this.y;
    }

    IssueFiring(pointer: any) {
        this.desiredX = this.x;
        this.desiredY = this.y;
        this.moveDirection = new Phaser.Math.Vector2(pointer.x - this.x, pointer.y - this.y);
        this.moveDirection.normalize();

        this.desiredRotation = Math.atan2(this.moveDirection.y, this.moveDirection.x);
        this.rotateLeft = ((this.desiredRotation > this.rotation && this.desiredRotation - this.rotation < Math.PI)
            || (this.desiredRotation < this.rotation && this.rotation - this.desiredRotation > Math.PI)
        );

        this.fireOrderIssued = true;
    }

    IssueMoveToPointer(pointer: any) {
        this.fireOrderIssued = false;
        this.desiredX = pointer.x;
        this.desiredY = pointer.y;
        this.moveDirection = new Phaser.Math.Vector2(this.desiredX - this.x, this.desiredY - this.y);
        this.moveDirection.normalize();

        this.desiredRotation = Math.atan2(this.moveDirection.y, this.moveDirection.x);
        this.rotateLeft = ((this.desiredRotation > this.rotation && this.desiredRotation - this.rotation < Math.PI)
            || (this.desiredRotation < this.rotation && this.rotation - this.desiredRotation > Math.PI)
        );
    }

    Update(scene: ZombbombArena) {
        // Rotate large amounts
        if (Math.abs(this.desiredRotation - this.rotation) > this.rotationSpeed) {
            if (this.rotateLeft) {
                this.rotation += this.rotationSpeed;
            }
            else {
                this.rotation -= this.rotationSpeed;
            }
        }
        else {
            // Rotate small amounts
            if (Math.abs(this.desiredRotation - this.rotation) > 0.04) {
                if (this.rotateLeft) {
                    this.rotation += 0.035;
                }
                else {
                    this.rotation -= 0.035;
                }
            }

            if (this.fireOrderIssued && this.canFire) {
                this.setAlpha(0.8);
                this.canFire = false;
                this.FireStuff(scene);
                scene.time.addEvent(new Phaser.Time.TimerEvent({ delay: RELOADTIME, callback: () => { this.canFire = true; this.setAlpha(1); }, callbackScope: this }));
            }

            var modifiedMoveSpeed = PLAYERSPEED / (this.zombiesInContact + 1);

            // Move
            if (Math.abs(this.desiredX - this.x) > modifiedMoveSpeed) {
                this.x += this.moveDirection.x * modifiedMoveSpeed;
            }

            if (Math.abs(this.desiredY - this.y) > modifiedMoveSpeed) {
                this.y += this.moveDirection.y * modifiedMoveSpeed;
            }
        }

        // Reset the zombies in contact number
        this.zombiesInContact = 0;

        this.CheckGameStart(scene);
    }

    CheckGameStart(scene: ZombbombArena) {
        if (GAMESTATE == "SettingUp") {
            if (this.y > 800) {
                scene.startGameRound();
            }
        }
    }

    FireStuff(scene: ZombbombArena) {
        this.x -= this.moveDirection.x * PLAYERSPEED * 2;
        this.y -= this.moveDirection.y * PLAYERSPEED * 2;
        this.fireOrderIssued = false;
        this.desiredX = this.x;
        this.desiredY = this.y;

        var bullets: Phaser.Physics.Arcade.Sprite[] = [];
        for (var i = 0; i < 8; i++) {
            var newBullet = scene.bullets.create(this.x, this.y, scene.bullets.defaultKey) as Phaser.Physics.Arcade.Sprite;
            newBullet.scale = 0.25;
            bullets.push(newBullet);
        }

        Phaser.Actions.PlaceOnCircle(bullets,
            new Phaser.Geom.Circle(this.x, this.y, 5),
            this.desiredRotation - 0.2,
            this.desiredRotation + 0.2,);
        for (let pb of bullets) {
            var bulletDirection = new Phaser.Math.Vector2(pb.x - this.x, pb.y - this.y);
            bulletDirection.normalize();
            var bulletRotation = Math.atan2(bulletDirection.y, bulletDirection.x);
            pb.setRotation(bulletRotation + Math.PI / 2);
            pb.setVelocity(bulletDirection.x * 800, bulletDirection.y * 800);

            scene.time.addEvent(new Phaser.Time.TimerEvent({ delay: 400, callback: () => { pb.destroy(); }, callbackScope: this }));
        };
    }

    KillPlayer(scene: ZombbombArena) {
        if (GAMESTATE != "Arena") return; // Only do this if the game is still going on

        // Server-side updates and state update
        endRound();

        // Client-side updates
        this.destroy();
        scene.roomCodeText.setVisible(true);

        scene.restartGameTimer = new Phaser.Time.TimerEvent({ delay: 8000, callback: scene.restartGame, callbackScope: scene });
        scene.time.addEvent(scene.restartGameTimer);
        var totalTimeMilliseconds = (scene.game.getTime() - scene.gameStartTime);
        scene.roomCodeText.text = "TIME: " + totalTimeMilliseconds.toFixed(0);

        // Detatch all pellets
        this.attachedPellets.forEach(p => {
            p.attachedThing = null;
            p.canAttachToPlayer = true;
        });
        this.attachedPellets = [];
    }
}

class Pellet extends Phaser.Physics.Arcade.Sprite {
    attachedThing: Phaser.Physics.Arcade.Sprite = null;
    canAttachToPlayer: boolean = true;
    arena: ZombbombArena;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'star');
        this.arena = scene as ZombbombArena;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.scale = 0.2;
    }

    IsInDeposit(): boolean {
        if (this.x < this.arena.depositBoxRightBound
            && this.y > this.arena.depositBoxTopBound) {

            return true;
        }
        return false;
    }

    CheckDeposit() {
        if (this.IsInDeposit()) {
            var player = this.attachedThing as Player;

            if (player != null
                && player.zombiesInContact != undefined) {
                this.attachedThing = null;
                this.canAttachToPlayer = false;

                var index = player.attachedPellets.indexOf(this);
                if (index > -1) {
                    player.attachedPellets.splice(index, 1);
                }
            }
        }
    }

    Update() {
        this.CheckDeposit();
        if (this.attachedThing != null) {
            var moveDirection = new Phaser.Math.Vector2(this.attachedThing.x - this.x, this.attachedThing.y - this.y);
            if (moveDirection.length() <= this.attachedThing.width * 0.5 * this.attachedThing.scale) {
                return;
            }

            moveDirection.normalize();
            if (Math.abs(this.attachedThing.x - this.x) > PLAYERSPEED) {
                this.x += moveDirection.x * PLAYERSPEED;
            }

            if (Math.abs(this.attachedThing.y - this.y) > PLAYERSPEED) {
                this.y += moveDirection.y * PLAYERSPEED;
            }
        }
    }
}

class Zombie extends Phaser.Physics.Arcade.Sprite {
    desiredX: integer = 0;
    desiredY: integer = 0;
    desiredRotation: number = 0;
    rotateLeft: boolean;

    rotationSpeed: number = 0.15;
    hitPoints: integer = 5;
    playerId: string;
    lastUpdateTime: number;
    color: integer;
    colorR: integer;
    colorG: integer;
    colorB: integer;

    lastContactTime: number = -1;
    ticksSinceLastContact: number = -1;
    attachedPellets: Pellet[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, id: string, colorIn: integer) {
        super(scene, x, y, 'zombie');
        this.playerId = id;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.scale = 0.2;

        this.color = colorIn;
        [this.colorR, this.colorG, this.colorB] = ToRGB(this.color);

        this.desiredX = this.x;
        this.desiredY = this.y;
        this.lastUpdateTime = this.scene.time.now;
        this.ResetTint();
    }

    KillZombie() {
        this.attachedPellets.forEach(p => {
            p.attachedThing = null;
            p.canAttachToPlayer = true;
        });
        this.attachedPellets = [];

        destroyZombie(this); // Trigger the server-side update
        this.destroy();
    }

    ResetTint() {
        this.setTint(0xffffff, 0xffffff, this.color, this.color);
    }

    CheckPlayerCollision() {
        if (this.ticksSinceLastContact > 0) {
            if (this.lastContactTime < 0) { // First contact
                this.lastContactTime = this.lastUpdateTime;
            }
            else {
                var timeInContact = this.lastUpdateTime - this.lastContactTime;

                if (timeInContact >= EXPLODETIME) {
                    // Destroy the player and the zombie after 2 seconds of contact
                    var arena = this.scene as ZombbombArena;
                    arena.player.KillPlayer(arena);
                    this.KillZombie();

                    // Explosion animation
                    var sp = arena.add.sprite(this.x, this.y + 64, 'explosion');
                    sp.scale = 2;
                    sp.play('explosion_anim');
                    sp.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject) {
                        gameObject.destroy();
                    });
                }
                else {
                    // Fade the whole tint towards 0xff0000
                    var topGradient = Phaser.Math.Interpolation.Linear([0, 0xff], timeInContact / EXPLODETIME);
                    var topTint = 0xffffff - Math.floor(topGradient) * 0x000101;

                    var bottomG = Math.floor(Phaser.Math.Interpolation.Linear([this.colorG, 0], timeInContact / EXPLODETIME));
                    var bottomB = Math.floor(Phaser.Math.Interpolation.Linear([this.colorB, 0], timeInContact / EXPLODETIME));
                    var bottomR = Math.floor(Phaser.Math.Interpolation.Linear([this.colorR, 0xff], timeInContact / EXPLODETIME));
                    var bottomTint = ToNumber(bottomR, bottomG, bottomB);

                    this.setTint(topTint, topTint, bottomTint, bottomTint);
                }
            }

            // Adjusting speed in contact is problematic - the Player controller client assumes a constant speed
        }
        else {
            if (this.lastContactTime > 0) { // No longer in contact
                this.ResetTint();
            }

            this.lastContactTime = -1;
        }

        this.ticksSinceLastContact--;
    }

    Update() {
        var deltaTime = this.scene.time.now - this.lastUpdateTime;
        this.lastUpdateTime = this.scene.time.now;
        var speed = ZOMBIESPEED * deltaTime;

        this.CheckPlayerCollision();

        var moveDirection = new Phaser.Math.Vector2(this.desiredX - this.x, this.desiredY - this.y);
        if (moveDirection.length() <= speed) {
            return;
        }
        moveDirection.normalize();
        this.desiredRotation = Math.atan2(moveDirection.y, moveDirection.x);
        this.rotateLeft = ((this.desiredRotation > this.rotation && this.desiredRotation - this.rotation < Math.PI)
            || (this.desiredRotation < this.rotation && this.rotation - this.desiredRotation > Math.PI)
        );

        if (Math.abs(this.desiredRotation - this.rotation) > this.rotationSpeed) {
            if (this.rotateLeft) {
                this.rotation += this.rotationSpeed;
            }
            else {
                this.rotation -= this.rotationSpeed;
            }
        }
        else {
            // Rotate small amounts
            if (Math.abs(this.desiredRotation - this.rotation) > 0.05) {
                if (this.rotateLeft) {
                    this.rotation += 0.035;
                }
                else {
                    this.rotation -= 0.035;
                }
            }

            // Move
            if (Math.abs(this.desiredX - this.x) > speed) {
                this.x += moveDirection.x * speed;
            }

            if (Math.abs(this.desiredY - this.y) > speed) {
                this.y += moveDirection.y * speed;
            }
        }
    }
}