/* 
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
    playerGroup: Phaser.Physics.Arcade.Group;

    roomCodeText: Phaser.GameObjects.Text;
    instructionText: Phaser.GameObjects.Text;

    zombieMap: { [id: string]: Zombie } = {};
    restartGameTimer: Phaser.Time.TimerEvent;
    gameStartTime: number;

    constructor() {
        super({ key: 'ZombbombArena', active: true });
    }

    preload() {
        this.load.image('zombie', '/content/Zombbomb/ghost.png');
        this.load.image('player', '/content/Zombbomb/pacman.png');
        this.load.image('bullet', '/content/Zombbomb/bullet.png');
        this.load.spritesheet('explosion', '/content/Zombbomb/explosionframes.png', { frameWidth: 130, frameHeight: 128 });
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

        this.player = new Player(this, this.game.canvas.width / 2, this.game.canvas.height / 2);
        this.add.existing(this.player);
        this.playerGroup.add(this.player);

        this.physics.add.collider(this.bullets, this.zombies, (body1, body2) => {
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

        this.physics.add.collider(this.playerGroup, this.zombies, (body1, body2) => {
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

        this.input.mouse.disableContextMenu();
        this.input.on('pointerdown', function (pointer) {
            if (pointer.rightButtonDown()) {
                this.player.IssueFiring(pointer);
            }
            else {
                this.player.IssueMove(pointer);
            }
        }, this);

        this.anims.create({
            key: 'explosion_anim',
            frames: this.anims.generateFrameNumbers('explosion', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] }),
            frameRate: 20,
            repeat: 0
        })

        this.drawSetupGraphics();
    }

    update() {
        this.player.Update(this);
        this.zombies.children.each(function (b) {
            (<Zombie>b).Update(this);
        });
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

    startRound() {
        GAMESTATE = "Arena";
        this.roomCodeText.setVisible(false);
        this.instructionText.setVisible(false);
        this.graphics.clear();
        this.gameStartTime = this.game.getTime();
        startRound();
    }

    restartGame() {
        GAMESTATE = "SettingUp";
        this.scene.restart();

        // Delay 100ms so that the client can refresh before server sends messages to respawn zombies
        setTimeout(resetZombies, 100);
    }
}

var destroyZombie: (zombie: Zombie) => {};
var resetZombies: any;
var destroyPlayer: any;
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

    IssueMove(pointer: any) {
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
            if (Math.abs(this.desiredRotation - this.rotation) > 0.05) {
                if (this.rotateLeft) {
                    this.rotation += 0.035;
                }
                else {
                    this.rotation -= 0.035;
                }
            }

            if (this.fireOrderIssued && this.canFire) {
                this.canFire = false;
                this.FireStuff(scene);
                scene.time.addEvent(new Phaser.Time.TimerEvent({ delay: RELOADTIME, callback: () => { this.canFire = true; }, callbackScope: this }));
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
                scene.startRound();
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
            new Phaser.Geom.Circle(this.x, this.y, this.displayWidth / 4),
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
        // Server-side updates and state update
        destroyPlayer();
        GAMESTATE = "GameOver";

        // Client-side updates
        this.destroy();
        scene.roomCodeText.setVisible(true);

        scene.restartGameTimer = new Phaser.Time.TimerEvent({ delay: 8000, callback: scene.restartGame, callbackScope: scene });
        scene.time.addEvent(scene.restartGameTimer);
        var totalTimeMilliseconds = (scene.game.getTime() - scene.gameStartTime);
        scene.roomCodeText.text = "TIME: " + totalTimeMilliseconds.toFixed(0);
    }
}

class Zombie extends Phaser.Physics.Arcade.Sprite{
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

                    console.log(bottomTint.toString(16));

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

    Update(scene: ZombbombArena) {
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