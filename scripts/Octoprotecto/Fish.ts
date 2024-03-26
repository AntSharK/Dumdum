const FISHDEPTH = 100;
class Fish extends Phaser.Physics.Arcade.Sprite {
    uniqueName: string;
    hitPoints: integer = 350;
    maxHitPoints: integer = 350;
    points: number = 2;
    damage: integer = 100;
    speed: number = 50;
    static NumberOfFish: integer = 0;
    updateFish = () => { };
    HitFish = (otherFish: Fish) => { };

    HitOctopus(octopus: Octopus) {
        if (octopus.active
            && !octopus.invulnerable) {
            octopus.TakeDamage(this.damage);

            // Do some damage to itself on collision
            this.TakeDamage(octopus.collisionDamage);

            // Destruction from collision gives points
            if (this.hitPoints <= 0) {
                octopus.points += this.points;
            }
        }
    }

    TakeDamage(damageTaken: number) {
        this.hitPoints = this.hitPoints - damageTaken;
        this.setAlpha(Phaser.Math.Interpolation.Linear([1, 0.5], this.hitPoints / this.maxHitPoints));
        if (this.hitPoints <= 0) {
            this.destroy(true);
        }
    }

    Setup(scene: BattleArena) { }

    constructor(uniqueName: string, scene: BattleArena, x: number, y: number, imageName: string, difficultyMultiplier: number) {
        super(scene, x, y, imageName);

        this.uniqueName = uniqueName;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.setDepth(FISHDEPTH);
        this.Setup(scene);
        this.modifyDifficulty(difficultyMultiplier);
    }

    modifyDifficulty(modifier: number) {
        this.speed = this.speed * modifier;
        this.maxHitPoints = this.maxHitPoints * modifier;
        this.damage = this.damage * modifier;

        this.hitPoints = this.maxHitPoints;
    }

    static SpawnFishes(scene: BattleArena, numberOfFish: integer, spawningRect: Phaser.Geom.Rectangle,
        fishPhysicsGroup: Phaser.Physics.Arcade.Group,
        octopusPhysicsGroup: Phaser.Physics.Arcade.Group,
        fishType: string,
        difficultyMultiplier: number) {
        var spawnAnims: Phaser.GameObjects.Sprite[] = [];
        for (var i = 0; i < numberOfFish; i++) {
            var newSpawnAnim = scene.add.sprite(0, 0, 'explosion');
            spawnAnims.push(newSpawnAnim);
        }

        Phaser.Actions.RandomRectangle(spawnAnims, spawningRect);
        for (let i in spawnAnims) {
            spawnAnims[i].play('explosion_anim');
            spawnAnims[i].on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject: Phaser.GameObjects.Sprite) {
                Fish.SpawnOneFish(scene, gameObject.x, gameObject.y, fishPhysicsGroup, octopusPhysicsGroup, fishType, difficultyMultiplier);
                gameObject.destroy();
            }, this);
        }
    }

    static SpawnOneFish(scene: BattleArena, x: number, y: number,
        fishPhysicsGroup: Phaser.Physics.Arcade.Group,
        octopusPhysicsGroup: Phaser.Physics.Arcade.Group,
        fishType: string,
        difficultyMultiplier: number) {

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
        var fish: Fish;
        switch (fishType) {
            case "starfish":
                fish = new Fish("fish" + Fish.NumberOfFish, scene, x, y, "fish", difficultyMultiplier);
                break;
            case "homingfish":
                fish = new HomingFish("fish" + Fish.NumberOfFish, scene, x, y, "homingfish", difficultyMultiplier);
                break;
            case "mergingfish":
                fish = new MergingFish("fish" + Fish.NumberOfFish, scene, x, y, "mergingfish", difficultyMultiplier);
                break;
            default:
                window.alert("FISHTYPE " + fishType + " NOT SUPPORTED.");
                return;
        }

        Fish.NumberOfFish++;
        scene.add.existing(fish);
        fishPhysicsGroup.add(fish);
        Phaser.Math.RandomXY(fish.body.velocity, fish.speed);
        fish.setCircle(fish.width / 3, fish.originX - fish.width / 3, fish.originY - fish.width / 3);
    }
}

class HomingFish extends Fish {
    homingTarget: Octopus;

    override Setup(scene: BattleArena) {
        super.Setup(scene);
        this.speed = 55;

        var minDistance = 3000;
        for (let key in BattleArena.OctopiMap) {
            var octopus = BattleArena.OctopiMap[key];
            var distance = Phaser.Math.Distance.BetweenPoints(this, octopus);
            if (distance < minDistance) {
                minDistance = distance;
                this.homingTarget = octopus;
            }
        }

        this.updateFish = () => {
            if (this.homingTarget != null) {
                HomingFish.moveTowardsTarget(this, this.homingTarget);
                if (!this.homingTarget.active) {
                    this.homingTarget = null;
                }
            }
        }
    }

    static moveTowardsTarget(origin: Fish, target: Phaser.GameObjects.Sprite) {
        var moveDirection = new Phaser.Math.Vector2(target.x - origin.x, target.y - origin.y);
        moveDirection.normalize();
        origin.setVelocity(moveDirection.x * origin.speed, moveDirection.y * origin.speed);
    }
}

class MergingFish extends Fish {
    currentMerges: number = 1;

    override Setup(scene: BattleArena) {
        super.Setup(scene);
        this.speed = 75;
        this.hitPoints = 500;
        this.maxHitPoints = 500;
        const MERGELIMIT = 4;

        this.HitFish = (otherFish: Fish) => {
            var mergedFish = otherFish as MergingFish;
            if (mergedFish != null) {
                var mergeCount = this.currentMerges + mergedFish.currentMerges;
                if (mergeCount < MERGELIMIT) {
                    let scaleBloat = mergeCount / this.currentMerges;

                    this.scale = this.scale * scaleBloat;
                    this.setVelocity(this.body.velocity.x * scaleBloat, this.body.velocity.y * scaleBloat);

                    this.hitPoints = this.hitPoints + mergedFish.hitPoints;
                    this.damage = this.damage + mergedFish.damage;
                    this.points = this.points + mergedFish.points;
                    this.maxHitPoints = this.maxHitPoints + mergedFish.maxHitPoints;
                    this.speed = this.speed + mergedFish.speed;

                    this.currentMerges = mergeCount;
                    mergedFish.destroy(true);
                }
            }
        }
    }
}