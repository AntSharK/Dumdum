class Bullet extends Phaser.Physics.Arcade.Sprite {
    bulletWeapon: Weapon;
    target: Fish;
    moveDirection: Phaser.Math.Vector2;

    constructor(weapon: Weapon,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group) {
        super(weapon.scene, weapon.x, weapon.y, 'bullet');

        this.bulletWeapon = weapon;
        bulletPhysicsGroup.add(this);
        this.scene.add.existing(this);
        this.setDepth(FISHDEPTH);
    }

    ApplyHit(fish: Fish) {
        var sp = this.scene.add.sprite(this.x, this.y, 'explosion');
        sp.play('explosion_anim');
        sp.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject) {
            gameObject.destroy();
        });

        fish.TakeDamage(this.bulletWeapon.projectileDamage);
        if (fish.hitPoints <= 0) {
            this.bulletWeapon.weaponOwner.points += fish.points;
        }

        this.destroy(true);
    }

    FireToFish(focusedFish: Fish, spread: number) {
        this.moveDirection = new Phaser.Math.Vector2(focusedFish.x - this.x, focusedFish.y - this.y);
        this.moveDirection.normalize();

        this.setRotation(Math.atan2(this.moveDirection.y, this.moveDirection.x) + Math.random() * spread - spread / 2);
        this.setVelocity(this.moveDirection.x * this.bulletWeapon.projectileSpeed, this.moveDirection.y * this.bulletWeapon.projectileSpeed);
        this.scene.time.addEvent({
            delay: this.bulletWeapon.range / this.bulletWeapon.projectileSpeed * 1000,
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

    projectileDamage: number = 19;
    projectileSpeed: number = 500;

    fishesInRange: { [id: string]: Fish } = {};
    focusedFish: Fish;
    bulletPhysicsGroup: Phaser.Physics.Arcade.Group;

    nextFireTime: number = 0;
    fireRate: number = 100;

    placeInScene(weaponsPhysicsGroup: Phaser.Physics.Arcade.Group,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group,
    ) {
        weaponsPhysicsGroup.add(this);
        this.scene.add.existing(this);
        this.setCircle(this.range, -this.range, -this.range);
        this.bulletPhysicsGroup = bulletPhysicsGroup;

        this.offsetX = this.x - this.weaponOwner.x;
        this.offsetY = this.y - this.weaponOwner.y;
        this.setRotation(Math.atan2(-this.offsetY, -this.offsetX));
    }

    constructor(octopus: Octopus,
        range: number,
        spread: number,
        projectileDamage: number,
        projectileSpeed: number,
        fireRate: number) {
        super(octopus.scene, octopus.x, octopus.y, 'fin');

        this.depth = octopus.depth - 0.1;
        this.setOrigin(0, 0.5);

        this.weaponOwner = octopus;

        this.range = range;
        this.spread = spread;
        this.projectileDamage = projectileDamage;
        this.projectileSpeed = projectileSpeed;
        this.fireRate = fireRate;
    }

    FireWeapon(focusedFish: Fish) {
        var bullet = new Bullet(this, this.bulletPhysicsGroup);
        bullet.FireToFish(focusedFish, this.spread);
    }

    UpdateWeapon(graphics: Phaser.GameObjects.Graphics) {
        this.setPosition(this.weaponOwner.x + this.offsetX, this.weaponOwner.y + this.offsetY);

        // If the focused fish is dead, nullify it
        if (this.focusedFish != null
            && !this.focusedFish.active) {
            this.focusedFish = null;
        }

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
            if (!connectedFish.active) {
                delete this.fishesInRange[key];
                continue;
            }

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