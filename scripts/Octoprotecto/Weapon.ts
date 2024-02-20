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

            if (distance >= this.range + 10) {
                delete this.fishesInRange[key];
                if (this.focusedFish?.uniqueName == key) { this.focusedFish = null; }
            }
        }
    }
}