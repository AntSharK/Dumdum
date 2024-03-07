// Note that all properties are auto-deserialized from the corresponding server-side class
class Octopus extends Phaser.Physics.Arcade.Sprite {
    desiredX: integer = 0;
    desiredY: integer = 0;
    lastUpdateTime: number;
    name: string;
    weapons: Weapon[] = [];
    speed: number = 0.15; // Expressed as distance covered per millisecond
    points: number = 20;
    hitPoints: number = 998;
    luck: number = 0;
    armor: number = 0;
    maxHitPoints: number = 998;
    lastHitTime: number = -1000;
    refreshCost: number = 1;
    invulnerable: boolean = false;
    purchasableUpgrades: { [id: string]: Upgrade } = {};
    displayName: string; // For display only
    collisionDamage: number = 0;
    trackedUpgrades: Upgrade[] = [];

    // Stuff for drawing
    displayNameText: Phaser.GameObjects.Text;

    // Custom behaviors injected
    onDamageTaken: ((octo: Octopus, dmgTaken: number) => void)[] = [];

    placeInScene(scene: Phaser.Scene,
        octopiPhysicsGroup: Phaser.Physics.Arcade.Group,
        weaponsPhysicsGroup: Phaser.Physics.Arcade.Group,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group,
        tint: number
    ) {
        this.setDepth(octopiPhysicsGroup.getLength());
        
        this.weapons.forEach(w => {
            w.placeInScene(weaponsPhysicsGroup, bulletPhysicsGroup);
            w.tint = tint;
        });
        
        this.trackedUpgrades.forEach(u => {
            switch (u.displayName) {
                case "Toughen":
                    this.onDamageTaken.push((octo, dmgTaken) => {
                        octo.armor += 1;
                    });
                    break;
            }
        }, this);

        // Add the display name
        this.displayNameText = scene.add.text(0, 0, this.displayName, { color: 'White', fontSize: '3vw' });
        this.displayNameText.setDepth(this.depth + 0.2);
        this.displayNameText.setOrigin(0.5, -0.3);

        scene.add.existing(this);
        octopiPhysicsGroup.add(this);
        this.setCircle(this.width / 2, this.originX - this.width / 2, this.originY - this.width / 2);
    }

    static FromData(octopusData: Octopus, scene: Phaser.Scene): Octopus {
        return new Octopus(octopusData.name,
            scene,
            octopusData.desiredX,
            octopusData.desiredY,
            octopusData.tint,
            octopusData.speed,
            octopusData.points,
            octopusData.maxHitPoints,
            octopusData.luck,
            octopusData.armor,
            octopusData.refreshCost,
            octopusData.weapons,
            octopusData.purchasableUpgrades,
            octopusData.displayName,
            octopusData.collisionDamage,
            octopusData.trackedUpgrades);
    }

    constructor(name: string, scene: Phaser.Scene, x: number, y: number,
        tint: number,
        speed: number,
        points: number,
        maxHitPoints: number,
        luck: number,
        armor: number,
        refreshCost: number,
        weaponData: Weapon[],
        purchasableUpgrades: { [id: string]: Upgrade },
        displayName: string,
        collisionDamage: number,
        trackedUpgrades: Upgrade[]) {
        super(scene, x, y, 'octopus');

        this.name = name;
        this.originX = this.width / 2;
        this.originY = this.height / 2;

        this.desiredX = this.x;
        this.desiredY = this.y;
        this.lastUpdateTime = this.scene.time.now;
        this.speed = speed;

        this.tint = tint;
        this.points = points;
        this.maxHitPoints = maxHitPoints;
        this.luck = luck;
        this.armor = armor;
        this.refreshCost = refreshCost;
        this.purchasableUpgrades = purchasableUpgrades;
        this.displayName = displayName;
        this.collisionDamage = collisionDamage;
        this.trackedUpgrades = trackedUpgrades;

        weaponData.forEach(w => {
            var newWeapon = Weapon.FromData(w, this);
            this.weapons.push(newWeapon);
        })

        // Add a dummy element to handle off-by-one placement
        var offByOne = new Weapon(this, 0, 0, 0, 0, 0, "dummy", {});
        this.weapons.unshift(offByOne);
        Phaser.Actions.PlaceOnCircle(this.weapons, new Phaser.Geom.Circle(this.x, this.y, this.width), 0, Math.PI);
        this.weapons.shift();
    }

    FinishRound(): void {
        this.weapons.forEach(w => {
            w.fishesInRange = {};
            w.focusedFish = null;
        });

        // SetActive false immediately causes this to start fading out
        this.setActive(false);
    }

    // Just handles the octopus' end of taking damage
    TakeDamage(damage: number) {
        let actualDamage = Math.max(1, damage - this.armor);
        this.hitPoints = this.hitPoints - actualDamage;

        this.onDamageTaken.forEach(f => {
            f(this, damage);
        }, this);

        if (this.hitPoints <= 0) {
            this.setActive(false);
            var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);

            signalRconnection.invoke("HostOctopusDeath", roomId, this.name, this.points).catch(function (err) {
                return console.error(err.toString());
            });
            
            return;
        }

        this.invulnerable = true;
        this.lastHitTime = this.scene.time.now;
    }

    DrawFlash(graphics: Phaser.GameObjects.Graphics) {
        const FLASHTIME = 300; // This is the same as invulnerability time
        const FLASHINTERVAL = 70;
        const FLASHCHECK = 150;
        if (graphics.scene.time.now - this.lastHitTime > FLASHTIME) {
            this.invulnerable = false;
            return;
        }
        // Transparency is according to the bezier curve - 50% hp is 50% transparency
        var colorAlpha = Phaser.Math.Interpolation.QuadraticBezier(this.hitPoints / this.maxHitPoints, 1.0, 0.6, 0.25);

        graphics.setDepth(this.depth + 0.2);
        if ((graphics.scene.time.now - this.lastHitTime) % FLASHCHECK <= FLASHINTERVAL) {
            graphics.fillStyle(0xFF0000, colorAlpha);
        }
        else {
            graphics.fillStyle(0xFFFFFF, colorAlpha);
        }

        graphics.fillCircle(this.x, this.y, this.body.radius);
    }

    FadeOut(deltaTime: number) {
        const FADERATE = 0.003; // Expressed as a rate per millisecond
        var newAlpha = this.alpha - FADERATE * deltaTime;
        this.setAlpha(newAlpha);
        this.weapons.forEach(w => w.setAlpha(newAlpha));

        // Cleanup
        if (newAlpha <= 0) {
            (this.scene as BattleArena).CheckForLoss();

            delete BattleArena.OctopiMap[this.name];
            this.destroy();
            this.weapons.forEach(w => w.destroy());
            this.displayNameText.destroy();
        }

        return;
    }

    DrawDamageCircle(graphics: Phaser.GameObjects.Graphics) {
        if (this.active) {
            graphics.setDepth(this.depth + 0.1);
            graphics.fillStyle(0xFF0000, Phaser.Math.Interpolation.QuadraticBezier(this.hitPoints / this.maxHitPoints, 0.5, 0.2, 0));
            graphics.fillCircle(this.x, this.y, this.body.radius * 0.9);
        }
    }

    UpdateOctopus(graphics: Phaser.GameObjects.Graphics) {
        var deltaTime = this.scene.time.now - this.lastUpdateTime;
        this.lastUpdateTime = this.scene.time.now;

        if (!this.active) {
            this.FadeOut(deltaTime);
            return;
        }

        // Draw armor as a thick circle
        graphics.lineStyle(Phaser.Math.Interpolation.QuadraticBezier(this.armor / 500, 0, 10, 15), this.tintTopLeft);
        graphics.setDepth(this.depth + 0.3);
        graphics.strokeCircle(this.x, this.y, this.body.radius);

        this.weapons.forEach(w => w.UpdateWeapon(graphics));
        this.displayNameText.setPosition(this.x, this.y);

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