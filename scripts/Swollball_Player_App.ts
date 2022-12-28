﻿class Swollball_Player_Game {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: "95%",
                height: "95%",
                type: Phaser.AUTO,

                physics: {
                    default: 'arcade',
                    arcade: {
                        //debug: true
                    }
                },

                backgroundColor: '#EEEEEE',
                scene: [BallStats, BallUpgrades],

                scale: {
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    mode: Phaser.Scale.FIT,
                },
            });
    }
}

class BallUpgrades extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    readyToUpdateUpgrades: boolean;
    upgradeCards: UpgradeCard[];

    constructor() {
        super({ key: 'BallUpgrades', active: true, visible: true });
        this.readyToUpdateUpgrades = true;
        this.upgradeCards = [];
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
    }

    update() {
        this.graphics.clear();
        this.updateUpgrades();
        this.drawUpgradeCards();
    }

    updateUpgrades() {
        if (this.readyToUpdateUpgrades == true
            && UpgradeData.length > 0) {
            this.readyToUpdateUpgrades = false;
            for (let upgradeCard of this.upgradeCards) {
                upgradeCard.Title.destroy(true);
                upgradeCard.Description.destroy(true);
            }
            
            this.upgradeCards = [];

            // Partition the width into N units of 9 and N+1 units of 1
            var unitWidth = (this.scale.canvas.width / (UpgradeData.length * 9 + UpgradeData.length + 1));
            for (var i = 0; i < UpgradeData.length; i++) {
                var upgradeCard = new UpgradeCard(this,
                    (10 * i * unitWidth) + unitWidth,
                    this.scale.canvas.height / 2,
                    'dummyImage',
                    UpgradeData[i],
                    this.scale.canvas.height * 0.4,
                    unitWidth * 9);
                this.upgradeCards[i] = upgradeCard;
            }
        }
    }

    drawUpgradeCards() {
        for (let card of this.upgradeCards) {
            this.graphics.fillStyle(0xCCCCCC);
            this.graphics.fillRoundedRect(card.x, card.y, card.width, card.height);
            this.graphics.lineStyle(10, card.Upgrade.BorderColor);
            this.graphics.strokeRoundedRect(card.x, card.y, card.width, card.height);
        }
    }

    chooseUpgrade(upgrade: ServerUpgradeData) {
        var sessionRoomId = sessionStorage.getItem("roomid");
        var sessionUserId = sessionStorage.getItem("userid");
        connection.invoke("ChooseUpgrade", upgrade.ServerId, sessionUserId, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
}

class UpgradeCard extends Phaser.Physics.Arcade.Sprite {
    Upgrade: ServerUpgradeData;
    Title: Phaser.GameObjects.Text;
    Description: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, upgradeData: ServerUpgradeData, height: number, width: number) {
        super(scene, x, y, texture);
        this.Upgrade = upgradeData;

        this.height = height;
        this.width = width;

        this.Title = scene.add.text(x + this.width * 0.15, y + this.height * 0.1, upgradeData.UpgradeName, { color: 'Black' });
        this.Title.scale = width * 0.009;
        this.Description = scene.add.text(x + this.width * 0.1, y + this.height * 0.3, upgradeData.Description, { color: 'Black' });
        this.Description.setWordWrapWidth(this.width * 0.8);
        this.Description.scale = width * 0.005;
    }
}

class BallStats extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    playerBall: PlayerBall;
    playerScore: ServerRoundScoreData;
    statsDisplay: Record<string, Phaser.GameObjects.Text>;
    constructor() {
        super({ key: 'BallStats', active: true, visible: true });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.statsDisplay = {};

        var playerBalls = InitializeBalls(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,
        }), this);

        this.playerBall = playerBalls[0];

        // Get the scale multiplier, so we know where to put things
        const ASSUMEDSCALE = 1000;
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        var scaleMultiplier = boundingDimension / ASSUMEDSCALE;

        this.playerBall.setVelocity(0, 0); // Balls in this display do not move
        this.playerBall.setPosition(300 * scaleMultiplier, 300 * scaleMultiplier); // Set the ball to the top-left of the screen

        this.statsDisplay["hp"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["dmg"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["armor"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["velocity"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["size"] = this.add.text(0, 0, "", { color: 'Black' });
        this.updateText();

        var textArray = [];
        for (let key in this.statsDisplay) {
            var stat = this.statsDisplay[key];
            stat.scale = boundingDimension * 0.004;
            textArray.push(stat);
        }

        Phaser.Actions.PlaceOnCircle(textArray, new Phaser.Geom.Circle(this.playerBall.x, this.playerBall.y - 35 * scaleMultiplier, this.playerBall.Size + 15 * scaleMultiplier), -0.8, 1.1);
    }

    update() {
        this.graphics.clear();
        this.updateText();
        DrawBalls(this.graphics, [this.playerBall]);
    }

    updateText() {
        this.statsDisplay["hp"].text = "HP:" + this.playerBall.MaxHp.toString();
        this.statsDisplay["dmg"].text = "DMG:" + this.playerBall.Damage.toString();
        this.statsDisplay["armor"].text = "ARMOR:" + this.playerBall.Armor.toString();
        this.statsDisplay["velocity"].text = "SPEED:" + (this.playerBall.VelocityMultiplier * 100).toString();
        this.statsDisplay["size"].text = "SIZE:" + (this.playerBall.SizeMultiplier * 100).toString();

        if (UpgradeData.length > 0) {
            this.graphics.alpha = 0.5;
            for (let key in this.statsDisplay) {
                this.statsDisplay[key].alpha = 0.5;
            }
        }
        else {
            this.graphics.alpha = 1.0;
            for (let key in this.statsDisplay) {
                this.statsDisplay[key].alpha = 1.0;
            }
        }
    }
}