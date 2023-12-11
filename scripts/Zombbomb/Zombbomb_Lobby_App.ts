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
                        debug: true
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

    zombieMap: { [id: string] : Zombie} = {};

    constructor() {
        super({ key: 'ZombbombArena', active: true });
    }

    preload() {
        this.load.image('zombie', '/content/Zombbomb/ghost.png');
        this.load.image('player', '/content/Zombbomb/pacman.png');
        this.load.image('bullet', '/content/Zombbomb/bullet.png');
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

        this.player = new Player(this);
        this.playerGroup.add(this.player.playerSprite);

        this.physics.add.collider(this.bullets, this.zombies, (body1, body2) => {
            body1.destroy();
            var zombie = body2 as Zombie;

            switch (gameState) {
                case "Arena":
                    zombie.hitPoints--;
                    break;
                case "SettingUp":
                default:
                    break;
            }
            if (zombie.hitPoints <= 0) {
                destroyZombie(zombie);
                zombie.destroy();
            }
        });

        this.physics.add.collider(this.playerGroup, this.zombies, (body1, body2) => {
            switch (gameState) {
                case "Arena":
                    body1.destroy();
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

        // Draw setup things
        var sessionRoomId = sessionStorage.getItem("roomid");
        this.roomCodeText = this.add.text(200, 300, "CODE: " + sessionRoomId, { color: 'White', fontSize: '144px' });
        this.instructionText = this.add.text(150, 850, "MOVE HERE TO START", { color: 'White', fontSize: '72px' });
    }

    update() {
        this.player.Update(this);
        this.zombies.children.each(function (b) {
            (<Zombie>b).Update(this);
        });

        switch (gameState) {
            case "SettingUp":
                this.drawSetupGraphics();
                break;
            default:
                break;
        }
    }

    drawSetupGraphics() {
        // Draw the line at the zombie boundary
        this.graphics.lineStyle(10, 0x99ff00)
        this.graphics.lineBetween(0, 200, 1400, 200);
        this.graphics.lineBetween(0, 800, 1400, 800);
    }

    startRound() {
        gameState = "Arena";
        this.roomCodeText.setVisible(false);
        this.instructionText.setVisible(false);
        this.graphics.clear();
        startRound();
    }
}

var destroyZombie: (zombie: Zombie) => {};
var startRound: any;
var gameState: string = "SettingUp"; // Corresponds to Room GameState

function spawnZombie(playerId: string, game: Phaser.Game): Zombie {
    var scene = game.scene.getScene("ZombbombArena") as ZombbombArena;
    var zombie = new Zombie(scene, Math.random() * game.canvas.width * 0.7 + game.canvas.width * 0.15, 50, playerId);
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

class Player {
    playerSprite: Phaser.GameObjects.Sprite;
    desiredX: integer = 0;
    desiredY: integer = 0;
    moveDirection: Phaser.Math.Vector2;
    desiredRotation: number;
    rotateLeft: boolean;

    rotationSpeed: number = 0.20;
    speed: number = 3.5;
    fireOrderIssued: boolean = false;
    canFire: boolean = true;

    constructor(scene: Phaser.Scene) {
        this.playerSprite = scene.add.sprite(scene.game.canvas.width / 2, scene.game.canvas.height / 2, 'player');
        this.playerSprite.originX = this.playerSprite.width / 2;
        this.playerSprite.originY = this.playerSprite.height / 2;
        this.playerSprite.scale = 0.2;

        this.desiredX = this.playerSprite.x;
        this.desiredY = this.playerSprite.y;
    }

    IssueFiring(pointer: any) {
        this.desiredX = this.playerSprite.x;
        this.desiredY = this.playerSprite.y;
        this.moveDirection = new Phaser.Math.Vector2(pointer.x - this.playerSprite.x, pointer.y - this.playerSprite.y);
        this.moveDirection.normalize();

        this.desiredRotation = Math.atan2(this.moveDirection.y, this.moveDirection.x);
        this.rotateLeft = ((this.desiredRotation > this.playerSprite.rotation && this.desiredRotation - this.playerSprite.rotation < Math.PI)
            || (this.desiredRotation < this.playerSprite.rotation && this.playerSprite.rotation - this.desiredRotation > Math.PI)
        );

        this.fireOrderIssued = true;
    }

    IssueMove(pointer: any) {
        this.fireOrderIssued = false;
        this.desiredX = pointer.x;
        this.desiredY = pointer.y;
        this.moveDirection = new Phaser.Math.Vector2(this.desiredX - this.playerSprite.x, this.desiredY - this.playerSprite.y);
        this.moveDirection.normalize();

        this.desiredRotation = Math.atan2(this.moveDirection.y, this.moveDirection.x);
        this.rotateLeft = ((this.desiredRotation > this.playerSprite.rotation && this.desiredRotation - this.playerSprite.rotation < Math.PI)
            || (this.desiredRotation < this.playerSprite.rotation && this.playerSprite.rotation - this.desiredRotation > Math.PI)
        );
    }

    Update(scene: ZombbombArena) {
        // Rotate large amounts
        if (Math.abs(this.desiredRotation - this.playerSprite.rotation) > this.rotationSpeed) {
            if (this.rotateLeft) {
                this.playerSprite.rotation += this.rotationSpeed;
            }
            else {
                this.playerSprite.rotation -= this.rotationSpeed;
            }
        }
        else {
            // Rotate small amounts
            if (Math.abs(this.desiredRotation - this.playerSprite.rotation) > 0.05) {
                if (this.rotateLeft) {
                    this.playerSprite.rotation += 0.035;
                }
                else {
                    this.playerSprite.rotation -= 0.035;
                }
            }

            if (this.fireOrderIssued && this.canFire) {
                this.canFire = false;
                this.FireStuff(scene);
                scene.time.addEvent(new Phaser.Time.TimerEvent({ delay: 2000, callback: () => { this.canFire = true; }, callbackScope: this }));
            }

            // Move
            if (Math.abs(this.desiredX - this.playerSprite.x) > this.speed) {
                this.playerSprite.x += this.moveDirection.x * this.speed;
            }

            if (Math.abs(this.desiredY - this.playerSprite.y) > this.speed) {
                this.playerSprite.y += this.moveDirection.y * this.speed;
            }
        }

        this.CheckGameStart(scene);
    }

    CheckGameStart(scene: ZombbombArena) {
        if (gameState == "SettingUp") {
            if (this.playerSprite.y > 800) {
                scene.startRound();
            }
        }
    }

    FireStuff(scene: ZombbombArena) {
        this.playerSprite.x -= this.moveDirection.x * this.speed * 2;
        this.playerSprite.y -= this.moveDirection.y * this.speed * 2;
        this.fireOrderIssued = false;
        this.desiredX = this.playerSprite.x;
        this.desiredY = this.playerSprite.y;

        var bullets: Phaser.Physics.Arcade.Sprite[] = [];
        for (var i = 0; i < 8; i++) {
            var newBullet = scene.bullets.create(this.playerSprite.x, this.playerSprite.y, scene.bullets.defaultKey) as Phaser.Physics.Arcade.Sprite;
            newBullet.scale = 0.25;
            bullets.push(newBullet);
        }

        Phaser.Actions.PlaceOnCircle(bullets,
            new Phaser.Geom.Circle(this.playerSprite.x, this.playerSprite.y, this.playerSprite.displayWidth / 4),
            this.desiredRotation - 0.2,
            this.desiredRotation + 0.2,);
        for (let pb of bullets) {
            var bulletDirection = new Phaser.Math.Vector2(pb.x - this.playerSprite.x, pb.y - this.playerSprite.y);
            bulletDirection.normalize();
            var bulletRotation = Math.atan2(bulletDirection.y, bulletDirection.x);
            pb.setRotation(bulletRotation + Math.PI / 2);
            pb.setVelocity(bulletDirection.x * 800, bulletDirection.y * 800);

            scene.time.addEvent(new Phaser.Time.TimerEvent({ delay: 400, callback: () => { pb.destroy(); }, callbackScope: this }));
        };
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

    constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
        super(scene, x, y, 'zombie');
        this.playerId = id;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.scale = 0.2;

        this.desiredX = this.x;
        this.desiredY = this.y;
        this.lastUpdateTime = this.scene.time.now;
    }

    Update(scene: ZombbombArena) {
        var deltaTime = this.scene.time.now - this.lastUpdateTime;
        this.lastUpdateTime = this.scene.time.now;
        var speed = 0.2 * deltaTime;

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