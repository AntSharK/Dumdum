const FISHDEPTH = 100;

const FISHNAME_REGULARFISH = "starfish";
const FISHNAME_HOMINGFISH = "homingfish";
const FISHNAME_MERGINGFISH = "mergingfish";
const FISHNAME_ZIPPINGFISH = "zippingfish";
const FISHNAME_CHARGINGFISH = "chargingfish";

class Fish extends Phaser.Physics.Arcade.Sprite {
    uniqueName: string;
    hitPoints: integer = 350;
    maxHitPoints: integer = 350;
    points: number = 3;
    collisionScale: number = 0.33;
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
            case FISHNAME_REGULARFISH:
                fish = new Fish("fish" + Fish.NumberOfFish, scene, x, y, fishType, difficultyMultiplier);
                break;
            case FISHNAME_HOMINGFISH:
                fish = new HomingFish("fish" + Fish.NumberOfFish, scene, x, y, fishType, difficultyMultiplier);
                break;
            case FISHNAME_MERGINGFISH:
                fish = new MergingFish("fish" + Fish.NumberOfFish, scene, x, y, fishType, difficultyMultiplier);
                break;
            case FISHNAME_ZIPPINGFISH:
                fish = new ZippingFish("fish" + Fish.NumberOfFish, scene, x, y, fishType, difficultyMultiplier);
                break;
            case FISHNAME_CHARGINGFISH:
                fish = new ChargingFish("fish" + Fish.NumberOfFish, scene, x, y, fishType, difficultyMultiplier);
                break;
            default:
                window.alert("FISHTYPE " + fishType + " NOT SUPPORTED.");
                return;
        }

        Fish.NumberOfFish++;
        scene.add.existing(fish);
        fishPhysicsGroup.add(fish);
        Phaser.Math.RandomXY(fish.body.velocity, fish.speed);
        fish.setCircle(fish.width * fish.collisionScale, fish.originX - fish.width * fish.collisionScale, fish.originY - fish.width * fish.collisionScale);
    }
}

class HomingFish extends Fish {
    homingTarget: Octopus;

    override Setup(scene: BattleArena) {
        super.Setup(scene);
        this.speed = 55;
        this.collisionScale = 0.45;
        this.points = 4;

        this.homingTarget = HomingFish.getClosestOctopus(this);
        this.updateFish = () => {
            if (this.homingTarget != null) {
                HomingFish.moveTowardsTarget(this, this.homingTarget);
                if (!this.homingTarget.active) {
                    this.homingTarget = null;
                }
            }
        }
    }

    static getClosestOctopus(origin: Fish): Octopus {
        let minDistance = 3000;
        for (let key in BattleArena.OctopiMap) {
            var octopus = BattleArena.OctopiMap[key];
            var distance = Phaser.Math.Distance.BetweenPoints(origin, octopus);
            if (distance < minDistance) {
                minDistance = distance;
                return octopus;
            }
        }

        return null;
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
        this.collisionScale = 0.4;
        this.speed = 65;
        this.hitPoints = 500;
        this.maxHitPoints = 500;
        this.points = 5;
        const MERGELIMIT = 5;

        this.HitFish = (otherFish: Fish) => {
            var mergedFish = otherFish as MergingFish;
            if (mergedFish != null) {
                var mergeCount = this.currentMerges + mergedFish.currentMerges;
                if (mergeCount < MERGELIMIT) {
                    let scaleBloat = mergeCount / this.currentMerges;

                    this.scale = this.scale * Math.sqrt(scaleBloat);
                    this.setVelocity(this.body.velocity.x * scaleBloat, this.body.velocity.y * scaleBloat);

                    this.hitPoints = this.hitPoints + mergedFish.hitPoints;
                    this.damage = this.damage + mergedFish.damage;
                    this.points = this.points + mergedFish.points;
                    this.maxHitPoints = this.maxHitPoints + mergedFish.maxHitPoints;
                    this.speed = this.speed + mergedFish.speed;

                    this.currentMerges = mergeCount;
                    mergedFish.TakeDamage(99999); // Do a lot of damage to the fish being merged
                }
            }
        }
    }
}

class ZippingFish extends HomingFish {
    zipStartTimer: Phaser.Time.TimerEvent;
    zipEndTimer: Phaser.Time.TimerEvent;

    override Setup(scene: BattleArena) {
        const ZIPSCALE = 5;
        super.Setup(scene);
        this.speed = 30;
        this.collisionScale = 0.45;
        this.hitPoints = 600;
        this.maxHitPoints = 600;
        this.points = 6;

        this.zipStartTimer = scene.time.addEvent({
            delay: 5500,
            callback: () => {
                if (this.active) {
                    this.homingTarget = null;
                    this.setVelocity(this.body.velocity.x * ZIPSCALE, this.body.velocity.y * ZIPSCALE);
                }
            },
            callbackScope: this,
            loop: true,
            startAt: 2100,
            repeat: 20 // For easy cleanup, stop it after a while
        });

        this.zipEndTimer = scene.time.addEvent({
            delay: 5500,
            callback: () => {
                if (this.active) {
                    this.homingTarget = HomingFish.getClosestOctopus(this);
                }
            },
            callbackScope: this,
            loop: true,
            repeat: 20 // For easy cleanup, stop it after a while
        });
    }
}

class ChargingFish extends Fish {
    chargeStartTimer: Phaser.Time.TimerEvent;
    chargeEndTimer: Phaser.Time.TimerEvent;

    override Setup(scene: BattleArena) {
        const CHARGESCALE = 8;
        super.Setup(scene);
        this.speed = 50;
        this.collisionScale = 0.35;
        this.hitPoints = 400;
        this.maxHitPoints = 400;
        this.points = 5;

        this.chargeStartTimer = scene.time.addEvent({
            delay: 5100,
            callback: () => {
                if (this.active) {
                    let target = HomingFish.getClosestOctopus(this);
                    this.speed = this.speed * CHARGESCALE;
                    HomingFish.moveTowardsTarget(this, target);
                }
            },
            callbackScope: this,
            loop: true,
            startAt: 900,
            repeat: 20 // For easy cleanup, stop it after a while
        });

        this.chargeEndTimer = scene.time.addEvent({
            delay: 5100,
            callback: () => {
                if (this.active) {
                    this.speed = this.speed / CHARGESCALE;
                    Phaser.Math.RandomXY(this.body.velocity, this.speed);
                }
            },
            callbackScope: this,
            loop: true,
            repeat: 20 // For easy cleanup, stop it after a while
        });
    }
}