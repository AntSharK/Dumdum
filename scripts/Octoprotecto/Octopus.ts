// Note that all properties are auto-deserialized from the corresponding server-side class
class Octopus extends Phaser.Physics.Arcade.Sprite {
    desiredX: integer = 0;
    desiredY: integer = 0;
    lastUpdateTime: number;
    name: string;
    weapons: Weapon[] = [];
    speed: number = 0.3; // Expressed as distance covered per millisecond
    points: number = 0;
    hitPoints: number = 1000;
    maxHitPoints: number = 1000;
    lastHitTime: number = -1000;
    invulnerable: boolean = false;

    constructor(name: string, scene: Phaser.Scene, x: number, y: number,
        octopiPhysicsGroup: Phaser.Physics.Arcade.Group,
        weaponsPhysicsGroup: Phaser.Physics.Arcade.Group,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group,
        tint: number,
        speed: number) {
        super(scene, x, y, 'octopus');

        this.name = name;
        this.originX = this.width / 2;
        this.originY = this.height / 2;

        this.desiredX = this.x;
        this.desiredY = this.y;
        this.lastUpdateTime = this.scene.time.now;
        this.speed = speed;

        this.setDepth(octopiPhysicsGroup.getLength());
        var w1 = new Weapon(this, 90, 45, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        var w2 = new Weapon(this, -90, 45, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        this.weapons.push(w1, w2);
        var w3 = new Weapon(this, 60, 80, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        var w4 = new Weapon(this, -60, 80, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        this.weapons.push(w3, w4);
        var w5 = new Weapon(this, 20, 95, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        var w6 = new Weapon(this, -20, 95, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
        this.weapons.push(w5, w6);

        this.tint = tint;
        for (let i in this.weapons) {
            this.weapons[i].tint = tint;
        }

        scene.add.existing(this);
        octopiPhysicsGroup.add(this);
        this.setCircle(this.width / 2, this.originX - this.width / 2, this.originY - this.width / 2);
    }

    FinishRound(): void {
        this.weapons.forEach(w => {
            w.fishesInRange = {};
            w.focusedFish = null;
        });
    }

    // Just handles the octopus' end of taking damage
    TakeDamage(damage: number) {
        this.hitPoints = this.hitPoints - damage;

        if (this.hitPoints <= 0) {
            this.setActive(false);
            // TODO: Broadcast to server and controllers
            console.log("TODO: Broadcast something to controller.");
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
            delete BattleArena.OctopiMap[this.name];
            this.destroy();
            this.weapons.forEach(w => w.destroy());
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

        this.weapons.forEach(w => w.UpdateWeapon(graphics));

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