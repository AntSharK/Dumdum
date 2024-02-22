class Fish extends Phaser.Physics.Arcade.Sprite {
    uniqueName: string;
    hitPoints: integer = 100;
    maxHitPoints: integer = 100;
    points: number = 1;
    damage: integer = 50;
    static NumberOfFish: integer = 0;

    HitOctopus(octopus: Octopus) {
        if (octopus.active
            && !octopus.invulnerable) {
            octopus.TakeDamage(this.damage);
        }
    }

    constructor(uniqueName: string, scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'fish');

        this.uniqueName = uniqueName;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
    }

    static SpawnFishes(scene: Phaser.Scene, numberOfFish: integer, spawningRect: Phaser.Geom.Rectangle,
        fishPhysicsGroup: Phaser.Physics.Arcade.Group,
        octopusPhysicsGroup: Phaser.Physics.Arcade.Group) {
        var spawnAnims: Phaser.GameObjects.Sprite[] = [];
        for (var i = 0; i < numberOfFish; i++) {
            var newSpawnAnim = scene.add.sprite(0, 0, 'explosion');
            spawnAnims.push(newSpawnAnim);
        }

        Phaser.Actions.RandomRectangle(spawnAnims, spawningRect);
        for (let i in spawnAnims) {
            spawnAnims[i].play('explosion_anim');
            spawnAnims[i].on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject: Phaser.GameObjects.Sprite) {
                Fish.SpawnOneFish(gameObject.scene, gameObject.x, gameObject.y, fishPhysicsGroup, octopusPhysicsGroup);
                gameObject.destroy();
            }, this);
        }
    }

    static SpawnOneFish(scene: Phaser.Scene, x: number, y: number,
        fishPhysicsGroup: Phaser.Physics.Arcade.Group,
        octopusPhysicsGroup: Phaser.Physics.Arcade.Group) {

        // Check with every existing octopus location before spawning - don't spawn on top of octopi
        var allowSpawn = true;
        octopusPhysicsGroup.children.each(c => {
            var octo = c as Octopus;
            var d = Phaser.Math.Distance.Between(octo.body.center.x, octo.body.center.y, x, y);
            if (octo.active && d < octo.body.radius * 1.25) {
                allowSpawn = false;
            };
        }, this);

        if (!allowSpawn) { return; }

        var fish = new Fish("fish" + Fish.NumberOfFish, scene, x, y);
        Fish.NumberOfFish++;
        scene.add.existing(fish);
        fishPhysicsGroup.add(fish);
        Phaser.Math.RandomXY(fish.body.velocity, 50);
        fish.setCircle(fish.width / 3, fish.originX - fish.width / 3, fish.originY - fish.width / 3);
    }
}