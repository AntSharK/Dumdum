// Note that all properties are auto-deserialized from the corresponding server-side class
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