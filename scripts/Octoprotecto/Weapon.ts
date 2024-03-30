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
        this.bulletWeapon.onBulletHit.forEach(f => {
            f(this, fish);
        }, this);

        var sp = this.scene.add.sprite(this.x, this.y, 'explosion');

        // Scale the explosion according to damage done
        sp.scale = Phaser.Math.Interpolation.QuadraticBezier(this.bulletWeapon.projectileDamage / 1000, 0.4, 1.0, 1.2);
        sp.setDepth(fish.depth + 0.1);

        sp.play('explosion_anim');
        sp.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject) {
            gameObject.destroy();
        });

        fish.TakeDamage(this.bulletWeapon.projectileDamage);
        this.bulletWeapon.damageDealt += this.bulletWeapon.projectileDamage;

        if (fish.hitPoints <= 0) {
            this.bulletWeapon.weaponOwner.points += fish.points;
        }

        this.destroy(true);
    }

    FireToFish(focusedFish: Fish, spread: number) {
        this.moveDirection = new Phaser.Math.Vector2(focusedFish.x - this.x, focusedFish.y - this.y);

        // The rotation is set to be towards the target, to clearly show the deflection
        this.setRotation(Math.atan2(this.moveDirection.y, this.moveDirection.x));

        this.moveDirection.rotate(Math.random() * spread - spread / 2);
        this.moveDirection.normalize();

        // Scale the size according to damage done
        this.scale = Phaser.Math.Interpolation.QuadraticBezier(this.bulletWeapon.projectileDamage / 1000, 0.5, 1.5, 1.7);

        // The next line sets the rotation to the actual movement, rather than the aimed direction
        //this.setRotation(Math.atan2(this.moveDirection.y, this.moveDirection.x));

        this.setVelocity(this.moveDirection.x * this.bulletWeapon.projectileSpeed, this.moveDirection.y * this.bulletWeapon.projectileSpeed);
        this.scene.time.addEvent({
            delay: this.bulletWeapon.range / this.bulletWeapon.projectileSpeed * 1000,
            callback: () => this.destroy(true),
            callbackScope: this
        });
    }
}

// In sync with server-side property
class Upgrade {
    borderColor: number;
    cost: number;
    description: string;
    displayName: string;
    fillColor: number;
}

class Weapon extends Phaser.Physics.Arcade.Sprite {
    weaponOwner: Octopus;
    offsetX: number = 0;
    offsetY: number = 0;
    range: number = 0;
    spread: number = 0;

    projectileDamage: number = 19;
    projectileSpeed: number = 500;

    fishesInRange: { [id: string]: Fish } = {};
    focusedFish: Fish;
    bulletPhysicsGroup: Phaser.Physics.Arcade.Group;

    nextFireTime: number = 0;
    fireRate: number = 100;

    purchasableUpgrades: { [id: string]: Upgrade } = {};
    trackedUpgrades: Upgrade[] = [];

    // For per-round tracking
    damageDealt: number = 0;

    // Custom behaviors injected
    onBulletHit: ((bullet: Bullet, hitTarget: Fish) => void)[] = [];
    onFireToFish: ((bullet: Bullet, target: Fish) => void)[] = [];

    placeInScene(weaponsPhysicsGroup: Phaser.Physics.Arcade.Group,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group,
    ) {
        weaponsPhysicsGroup.add(this);
        this.scene.add.existing(this);
        this.depth = this.weaponOwner.depth - 0.1;
        this.setCircle(this.range, -this.range, -this.range);
        this.bulletPhysicsGroup = bulletPhysicsGroup;

        this.offsetX = this.x - this.weaponOwner.x;
        this.offsetY = this.y - this.weaponOwner.y;
        this.setRotation(Math.atan2(-this.offsetY, -this.offsetX));

        this.trackedUpgrades.forEach(u => { // Go through the DisplayName in each of the TrackedUpgrades
            switch (u.displayName) {
                case "Consume":
                    this.onBulletHit.push((bullet, hitTarget) => {
                        bullet.bulletWeapon.weaponOwner.Heal(3);
                    });
                    break;
                case "Momentum":
                    this.onBulletHit.push((bullet, hitTarget) => {
                        hitTarget.TakeDamage(bullet.body.velocity.length() * 0.1);
                    });
                    break;
                case "Propel":
                    this.onFireToFish.push((bullet, target) => {
                        bullet.setAcceleration(bullet.body.velocity.x, bullet.body.velocity.y);
                    });
                    break;
            }
        }, this);
    }

    static FromData(weaponData: Weapon, octopus: Octopus): Weapon {
        return new Weapon(octopus,
            weaponData.range,
            weaponData.spread,
            weaponData.projectileDamage,
            weaponData.projectileSpeed,
            weaponData.fireRate,
            weaponData.name,
            weaponData.purchasableUpgrades,
            weaponData.trackedUpgrades,
            weaponData.damageDealt);
    }

    constructor(octopus: Octopus,
        range: number,
        spread: number,
        projectileDamage: number,
        projectileSpeed: number,
        fireRate: number,
        name: string,
        purchaseableUpgrades: { [id: string]: Upgrade },
        trackedUpgrades: Upgrade[],
        damageDealt: number) {
        super(octopus.scene, octopus.x, octopus.y, 'fin');

        this.setOrigin(0, 0.5);

        this.weaponOwner = octopus;

        this.range = range;
        this.spread = spread;
        this.projectileDamage = projectileDamage;
        this.projectileSpeed = projectileSpeed;
        this.fireRate = fireRate;

        this.name = name;
        this.purchasableUpgrades = purchaseableUpgrades;
        this.trackedUpgrades = trackedUpgrades;
        this.damageDealt = damageDealt;
    }

    FireWeapon(focusedFish: Fish) {
        var bullet = new Bullet(this, this.bulletPhysicsGroup);
        bullet.FireToFish(focusedFish, this.spread);

        this.onFireToFish.forEach(f => {
            f(bullet, focusedFish);
        }, this);
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