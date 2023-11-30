/* 
GAME SCENES
 * */
class Zombbomb_Lobby_Game {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: "100%",
                height: "97%",
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
                    //mode: Phaser.Scale.FIT,
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
            bounceX: 1,
            bounceY: 1,
        });

        this.player = new Player(this);

        this.physics.add.collider(this.bullets, this.zombies, (body1, body2) => {
            // TODO: When bullets hit zombies
        });

        this.physics.add.collider(this.player.playerSprite, this.zombies, (body1, body2) => {
            // TODO: When zombies hit player
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
    }

    update() {
        this.player.Update(this);
    }
}

class Player {
    playerSprite: Phaser.GameObjects.Sprite;
    desiredX: integer = 0;
    desiredY: integer = 0;
    moveDirection: Phaser.Math.Vector2;
    desiredRotation: number;
    rotateLeft: boolean;

    rotationSpeed: number = 0.15;
    speed: number = 5;
    fireOrderIssued: boolean;

    constructor(scene: Phaser.Scene) {
        this.playerSprite = scene.add.sprite(500, 500, 'player');
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

            if (this.fireOrderIssued) {
                this.FireStuff(scene);
            }

            // Move
            if (Math.abs(this.desiredX - this.playerSprite.x) > this.speed) {
                this.playerSprite.x += this.moveDirection.x * this.speed;
            }

            if (Math.abs(this.desiredY - this.playerSprite.y) > this.speed) {
                this.playerSprite.y += this.moveDirection.y * this.speed;
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
            pb.setVelocity(bulletDirection.x * 300, bulletDirection.y * 300);
        };
    }
}