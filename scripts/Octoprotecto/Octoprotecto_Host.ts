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

            parent: 'content',
            width: 1024,
            height: 768,
            backgroundColor: '#FFFFFF',
            transparent: false,
            clearBeforeRender: false,
            scene: [TestScene],
            scale: {
                mode: Phaser.Scale.ScaleModes.FIT,
                resizeInterval: 1,
            },
        });
    }
}

class TestScene extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    octopus: Octopus;

    fishes: Phaser.Physics.Arcade.Group;
    octopi: Phaser.Physics.Arcade.Group;
    weapons: Phaser.Physics.Arcade.Group;
    bullets: Phaser.Physics.Arcade.Group;

    keyboardDirection: [x: integer, y: integer] = [0, 0];
    fishIndex: integer = 1;
    spawningRect: Phaser.Geom.Rectangle;

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
         * KEYBOARD CONTROLS
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

        this.octopus = new Octopus("testOctopus",
            this,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            this.octopi,
            this.weapons,
            this.bullets,
            0x00FFFF);

        this.time.addEvent({
            delay: 5000,
            callback: () => this.spawnFish(5),
            callbackScope: this,
            loop: true
        });
    }

    spawnFish(numberOfFish: integer) {
        var spawnAnims: Phaser.GameObjects.Sprite[] = [];
        for (var i = 0; i < numberOfFish; i++) {
            var newSpawnAnim = this.add.sprite(0, 0, 'explosion');
            spawnAnims.push(newSpawnAnim);
        }

        Phaser.Actions.RandomRectangle(spawnAnims, this.spawningRect);
        for (let i in spawnAnims) {
            spawnAnims[i].play('explosion_anim');
            spawnAnims[i].on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject) {
                var fish = new Fish("fish" + this.fishIndex, this, gameObject.x, gameObject.y);
                this.fishIndex++;
                this.add.existing(fish);
                this.fishes.add(fish);
                Phaser.Math.RandomXY(fish.body.velocity, 50);
                fish.setCircle(fish.width / 3, fish.originX - fish.width / 3, fish.originY - fish.width / 3);
                gameObject.destroy();
            }, this);
        }
    }

    update() {
        this.graphics.clear();

        /* ***********
         * KEYBOARD CONTROLS
         * ************ */
        if (this.keyboardDirection[0] != 0 || this.keyboardDirection[1] != 0) {

            // Ideally, running at 30FPS, we'll have to move at least OCTOPUSSPEED * 33 per update cycle since it's 33ms per cycle
            this.octopus.desiredX = this.octopus.x + this.keyboardDirection[0] * this.octopus.speed * 50;
            this.octopus.desiredY = this.octopus.y + this.keyboardDirection[1] * this.octopus.speed * 50;
        }

        this.octopus.UpdateOctopus(this.graphics);
    }
}

class Fish extends Phaser.Physics.Arcade.Sprite {
    uniqueName: string;
    hp: integer = 25;
    points: number = 1;

    constructor(uniqueName: string, scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'fish');

        this.uniqueName = uniqueName;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    bulletWeapon: Weapon;
    target: Fish;
    moveDirection: Phaser.Math.Vector2;
    speed: number = 500;

    constructor(weapon: Weapon,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group) {
        super(weapon.scene, weapon.x, weapon.y, 'bullet');

        this.bulletWeapon = weapon;
        bulletPhysicsGroup.add(this);
        this.scene.add.existing(this);
    }

    ApplyHit(fish: Fish) {
        var sp = this.scene.add.sprite(this.x, this.y, 'explosion');
        sp.play('explosion_anim');
        sp.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject) {
            gameObject.destroy();
        });

        fish.hp--;
        fish.setAlpha(0.5 + 0.05 * fish.hp);
        if (fish.hp <= 0) {
            if (this.bulletWeapon.focusedFish?.uniqueName == fish.uniqueName) {
                this.bulletWeapon.focusedFish = null;
            }

            if (fish.uniqueName in this.bulletWeapon.fishesInRange) {
                delete this.bulletWeapon.fishesInRange[fish.uniqueName];
            }

            this.bulletWeapon.weaponOwner.points += fish.points;
            fish.destroy(true);
        }

        this.destroy(true);
    }

    FireToFish(focusedFish: Fish, spread: number) {
        this.moveDirection = new Phaser.Math.Vector2(focusedFish.x - this.x, focusedFish.y - this.y);
        this.moveDirection.normalize();

        this.setRotation(Math.atan2(this.moveDirection.y, this.moveDirection.x) + Math.random() * spread - spread / 2);
        this.setVelocity(this.moveDirection.x * this.speed, this.moveDirection.y * this.speed);
        this.scene.time.addEvent({
            delay: this.bulletWeapon.range / this.speed * 1000,
            callback: () => this.destroy(true),
            callbackScope: this
        });
    }
}

class Weapon extends Phaser.Physics.Arcade.Sprite {
    weaponOwner: Octopus;
    offsetX: number = 0;
    offsetY: number = 0;
    range: number = 0;
    spread: number = 0.4;

    fishesInRange: { [id: string]: Fish } = {};
    focusedFish: Fish;
    bulletPhysicsGroup: Phaser.Physics.Arcade.Group;

    nextFireTime: number = 0;
    fireRate: number = 100;

    constructor(octopus: Octopus, offsetX: number, offsetY: number, range: number,
        weaponsPhysicsGroup: Phaser.Physics.Arcade.Group,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group) {
        super(octopus.scene, octopus.x + offsetX, octopus.y + offsetY, 'fin');

        this.depth = octopus.depth - 0.1;
        this.setOrigin(0, 0.5);
        this.setRotation(Math.atan2(-offsetY, -offsetX));
        //this.setVisible(false);

        this.weaponOwner = octopus;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.range = range;

        weaponsPhysicsGroup.add(this);
        this.scene.add.existing(this);
        this.setCircle(range, -range, -range);
        this.bulletPhysicsGroup = bulletPhysicsGroup;
    }

    FireWeapon(focusedFish: Fish) {
        var bullet = new Bullet(this, this.bulletPhysicsGroup);
        bullet.FireToFish(focusedFish, this.spread);
    }

    UpdateWeapon(graphics: Phaser.GameObjects.Graphics) {
        this.setPosition(this.weaponOwner.x + this.offsetX, this.weaponOwner.y + this.offsetY);

        if (this.nextFireTime < this.scene.time.now
            && this.focusedFish != null
            && this.focusedFish.active) {
            this.nextFireTime += this.fireRate;
            if (this.nextFireTime < this.scene.time.now) {
                this.nextFireTime = this.scene.time.now + this.fireRate;
            }

            this.FireWeapon(this.focusedFish);
        }

        for (let key in this.fishesInRange) {
            let connectedFish = this.fishesInRange[key];
            var distance = Phaser.Math.Distance.BetweenPoints(this, connectedFish);

            if (this.focusedFish == null || !this.focusedFish.active) {
                this.focusedFish = connectedFish;
            }
            /* DEBUGGING FOR TARGET ACQUISITION
            graphics.lineStyle(fishIdx, 0xff0000);

            if (this.focusedFish === connectedFish) {
                graphics.lineStyle(fishIdx * 3, 0x00ff00);
            }
            fishIdx++;

            graphics.lineBetween(this.x, this.y, connectedFish.x, connectedFish.y);
            */

            if (distance >= this.range + 10) {
                delete this.fishesInRange[key];
                if (this.focusedFish?.uniqueName == key) { this.focusedFish = null; }
            }
        }
    }
}

class Octopus extends Phaser.Physics.Arcade.Sprite {
    desiredX: integer = 0;
    desiredY: integer = 0;
    lastUpdateTime: number;
    name: string;
    weapons: Weapon[] = [];
    speed: number = 0.3; // Expressed as distance covered per millisecond
    points: number = 0;

    constructor(name: string, scene: Phaser.Scene, x: number, y: number,
        octopiPhysicsGroup: Phaser.Physics.Arcade.Group,
        weaponsPhysicsGroup: Phaser.Physics.Arcade.Group,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group,
        tint: number) {
        super(scene, x, y, 'octopus');

        this.name = name;
        this.originX = this.width / 2;
        this.originY = this.height / 2;

        this.desiredX = this.x;
        this.desiredY = this.y;
        this.lastUpdateTime = this.scene.time.now;

        var w1 = new Weapon(this, 90, 45, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        var w2 = new Weapon(this, -90, 45, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        this.weapons.push(w1, w2);
        var w3 = new Weapon(this, 60, 80, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        var w4 = new Weapon(this, -60, 80, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        this.weapons.push(w3, w4);

        this.tint = tint;
        for (let i in this.weapons) {
            this.weapons[i].tint = tint;
        }

        scene.add.existing(this);
        octopiPhysicsGroup.add(this);
        this.setCircle(125, this.originX - 125, this.originY - 125);
    }

    UpdateOctopus(graphics: Phaser.GameObjects.Graphics) {
        this.weapons.forEach(w => w.UpdateWeapon(graphics));

        var deltaTime = this.scene.time.now - this.lastUpdateTime;
        this.lastUpdateTime = this.scene.time.now;
        var speed = this.speed * deltaTime;

        var moveDirection = new Phaser.Math.Vector2(this.desiredX - this.x, this.desiredY - this.y);
        if (moveDirection.length() <= speed) {
            this.x = this.desiredX;
            this.y = this.desiredY;
            return;
        }
        moveDirection.normalize();

        // Move
        if (Math.abs(this.desiredX - this.x) > speed) {
            this.x += moveDirection.x * speed;
        }

        if (Math.abs(this.desiredY - this.y) > speed) {
            this.y += moveDirection.y * speed;
        }

        // Clamp on bounds
        if (this.x + this.width / 2 > this.scene.game.canvas.width) {
            this.x = this.scene.game.canvas.width - this.width / 2;
        }
        if (this.x - this.width / 2 < 0) {
            this.x = this.width / 2;
        }
        if (this.y + this.height / 2 > this.scene.game.canvas.height) {
            this.y = this.scene.game.canvas.height - this.height / 2;
        }
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2;
        }
    }
}

window.onload = () => {
    var game = new Octoprotecto();
};