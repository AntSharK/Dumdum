class Swollball_Player_Game {
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
                scene: [BallStats, BallUpgrades, EndScreen],

                scale: {
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    mode: Phaser.Scale.FIT,
                },
            });
    }
}

class EndScreen extends Phaser.Scene {

    graphics: Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'EndScreen', active: false, visible: true });
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);

        this.graphics.fillStyle(0xDDDDDD, 0.7);
        this.graphics.fillRect(this.scale.canvas.width * 0.1, this.scale.canvas.height * 0.1, this.scale.canvas.width * 0.8, this.scale.canvas.height * 0.65);

        // Totally temporary leaderboard drawing
        var totalPlayers = 0;
        var yourPlacing = 0;
        var playerName = (this.scene.get("BallStats") as BallStats).playerBall.Text.text;
        for (let scoreData of RoundScoreData.sort((a: ServerRoundScoreData, b: ServerRoundScoreData) => {
            return b.TotalScore - a.TotalScore; // Sort in descending order
        })) {
            totalPlayers++;
            if (playerName != null
                && scoreData.PlayerName == playerName) {
                yourPlacing = totalPlayers;
            }
        }

        this.add.text(this.scale.canvas.width * 0.25, this.scale.canvas.height * 0.15, "GAME\nOVER", { color: 'Black' }).setScale(boundingDimension * 0.01);
        if (yourPlacing > 0) {
            this.add.text(this.scale.canvas.width * 0.1, this.scale.canvas.height * 0.5, "RESULT:" + yourPlacing + "/" + totalPlayers, { color: 'Black' }).setScale(boundingDimension * 0.0075);
        }

        this.time.addEvent(new Phaser.Time.TimerEvent({ delay: FINALSCOREDISPLAYDURATION * 1000, callback: this.EndGame, callbackScope: this }));
    }

    EndGame() {
        window.location.reload();
    }
}

class BallUpgrades extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    readyToUpdateUpgrades: boolean;
    upgradeCards: UpgradeCard[];

    creditsLeft: Phaser.GameObjects.Text;
    creditNextIncrementTime: number;
    refreshButton: Phaser.GameObjects.Sprite;

    upgradeTierCost: Phaser.GameObjects.Text;
    upgradeTierButton: Phaser.GameObjects.Sprite;

    preload() {
        this.load.image('refreshimage', '/content/refreshimage.png');
        this.load.image('uparrow', '/content/uparrow.png');
    }

    constructor() {
        super({ key: 'BallUpgrades', active: true, visible: true });
        this.readyToUpdateUpgrades = true;
        this.upgradeCards = [];
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.on('gameobjectdown', this.onObjectClicked);
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);

        // Paint the CreditsLeft display
        this.creditNextIncrementTime = this.time.now;
        this.creditsLeft = this.add.text(this.scale.canvas.width * 0.86, this.scale.canvas.height * 0.08, "0", { color: 'Black' });
        this.creditsLeft.scale = boundingDimension * 0.004;

        // Paint the Refresh Button
        this.refreshButton = this.add.sprite(this.scale.canvas.width * 0.9, this.scale.canvas.height * 0.4, 'refreshimage');
        this.refreshButton.scale = boundingDimension * 0.0012;
        this.refreshButton.setInteractive(
            new Phaser.Geom.Circle(this.refreshButton.x, this.refreshButton.y, this.refreshButton.width * this.refreshButton.scale / 2),
            CircleDetection);

        // Paint the UpgradeShop button - both the text and the button
        this.upgradeTierButton = this.add.sprite(this.scale.canvas.width * 0.75, this.scale.canvas.height * 0.4, 'uparrow');
        this.upgradeTierButton.scale = boundingDimension * 0.0012;
        this.upgradeTierButton.setInteractive(
            new Phaser.Geom.Circle(this.upgradeTierButton.x, this.upgradeTierButton.y, this.upgradeTierButton.width * this.upgradeTierButton.scale / 2),
            CircleDetection);
        this.upgradeTierCost = this.add.text(
            this.upgradeTierButton.x - this.upgradeTierButton.width * this.upgradeTierButton.scale / 2 + boundingDimension * 0.02,
            this.upgradeTierButton.y - this.upgradeTierButton.height * this.upgradeTierButton.scale / 2 + boundingDimension * 0.035, "0", { color: 'Black' });
        this.upgradeTierCost.scale = boundingDimension * 0.004;

        /* Stuff for debugging hit area
        this.upgradeTierButton.on('pointerover', function (pointer) {
            this.setTint(0xff0000);
        })
        this.upgradeTierButton.on('pointerout', function (pointer) {
            this.clearTint();
        })
        this.refreshButton.on('pointerover', function (pointer) {
            this.setTint(0xff0000);
        })
        this.refreshButton.on('pointerout', function (pointer) {
            this.clearTint();
        })*/
    }

    update() {
        this.graphics.clear();

        if (this.upgradeCards.length > 0) {
            // Draw the fade screen
            this.graphics.fillStyle(0xFFFFFF, 0.2);
            this.graphics.fillRect(0, 0, this.scale.canvas.width, this.scale.canvas.height);

            // Set all graphics to visible
            this.creditsLeft.setVisible(true);
            this.refreshButton.setVisible(true);
            this.upgradeTierButton.setVisible(true);
            this.upgradeTierCost.setVisible(true);

            // Draw the number of credits left
            this.graphics.fillStyle(0xFFC90E);
            this.graphics.fillCircle(this.creditsLeft.x + this.creditsLeft.scale * 7, this.creditsLeft.y + this.creditsLeft.scale * 8, this.creditsLeft.scale * 15);
            this.graphics.lineStyle(10, 0x222222);
            this.graphics.strokeCircle(this.creditsLeft.x + this.creditsLeft.scale * 7, this.creditsLeft.y + this.creditsLeft.scale * 8, this.creditsLeft.scale * 15);
        }
        else {
            // Set all graphics to invisible
            this.creditsLeft.setVisible(false);
            this.refreshButton.setVisible(false);
            this.upgradeTierButton.setVisible(false);
            this.upgradeTierCost.setVisible(false);
        }

        this.updateUpgrades();
        this.drawUpgradeCards();
    }

    updateUpgrades() {
        const CREDITINCREMENTINTERVAL = 30; // Interval to update credits
        var creditsDisplayed = parseInt(this.creditsLeft.text);
        if (creditsDisplayed != EconomyData.CreditsLeft
            && this.creditNextIncrementTime <= this.time.now) {

            if (creditsDisplayed < EconomyData.CreditsLeft) {
                creditsDisplayed++;
                this.creditNextIncrementTime = this.time.now + CREDITINCREMENTINTERVAL * 2;
            }
            else if (creditsDisplayed > EconomyData.CreditsLeft) {
                creditsDisplayed--;
                this.creditNextIncrementTime = this.time.now + CREDITINCREMENTINTERVAL;
            }

            this.creditsLeft.text = creditsDisplayed.toString();;
        }

        if (this.readyToUpdateUpgrades == true
            && UpgradeData.length > 0) {
            this.readyToUpdateUpgrades = false;
            for (let upgradeCard of this.upgradeCards) {
                upgradeCard.Title.destroy(true);
                upgradeCard.Description.destroy(true);
                upgradeCard.Cost.destroy(true);
                upgradeCard.destroy(true);
            }

            this.upgradeCards = [];

            // Upgrade Tier Cost can be maxed out
            if (EconomyData.UpgradeTierCost < 0) {
                this.upgradeTierCost.text = "XX";
                this.upgradeTierButton.disableInteractive();
            }
            else {
                this.upgradeTierCost.text = EconomyData.UpgradeTierCost.toString();
            }
            var hasActionableCards = false;

            // Partition the width into N units of 9 and N+1 units of 1
            var unitWidth = (this.scale.canvas.width / (UpgradeData.length * 9 + UpgradeData.length + 1));
            if (UpgradeData.length <= 1) {
                unitWidth = (this.scale.canvas.width / (2 * 9 + 2 + 1));
            }
            for (var i = 0; i < UpgradeData.length; i++) {
                let upgradeCard = new UpgradeCard(this,
                    (10 * i * unitWidth) + unitWidth,
                    this.scale.canvas.height / 2,
                    null,
                    UpgradeData[i],
                    this.scale.canvas.height * 0.4,
                    unitWidth * 9);

                // Don't set interactive unless the card isn't blank. Blank cards are just for filling space
                if (upgradeCard.Title.text.length > 0) {
                    upgradeCard.setInteractive(new Phaser.Geom.Rectangle(upgradeCard.x, upgradeCard.y, upgradeCard.width, upgradeCard.height),
                        RectDetection);
                    hasActionableCards = true;
                }

                this.upgradeCards[i] = upgradeCard;
            }

            // If there are no actionable cards, clear the card list
            if (!hasActionableCards) {
                this.upgradeCards = [];
                this.readyToUpdateUpgrades = true;
            }

        }
    }
    drawUpgradeCards() {
        for (let card of this.upgradeCards) {
            this.graphics.fillStyle(0xCCCCCC);
            this.graphics.fillRoundedRect(card.x, card.y, card.width, card.height);
            this.graphics.lineStyle(10, card.Upgrade.BorderColor);
            this.graphics.strokeRoundedRect(card.x, card.y, card.width, card.height);

            // Draw the cost of the card
            this.graphics.fillStyle(0xFFC90E);
            this.graphics.fillCircle(card.Cost.x + card.Cost.scale * 5, card.Cost.y + card.Cost.scale * 8, card.Cost.scale * 12);
            this.graphics.lineStyle(3, 0x222222);
            this.graphics.strokeCircle(card.Cost.x + card.Cost.scale * 5, card.Cost.y + card.Cost.scale * 8, card.Cost.scale * 12);
        }
    }

    onObjectClicked(pointer, gameObject: Phaser.GameObjects.GameObject) {
        var upgrade = gameObject as UpgradeCard;
        var ballScene = gameObject.scene as BallUpgrades;

        // Check for clicking upgrade cards
        if (upgrade.Upgrade != undefined && ballScene.readyToUpdateUpgrades != undefined) {
            ballScene.onUpgradeClicked(upgrade);
            return;
        }

        // Check for clicking refresh button
        var sprite = gameObject as Phaser.GameObjects.Sprite;
        if (sprite.texture.key == 'refreshimage') {
            ballScene.onRefreshClicked(sprite)
            return;
        }

        // Check for clicking on upgrading shop tier
        if (sprite.texture.key == 'uparrow') {
            ballScene.onTierUpClicked(sprite)
            return;
        }
    }

    onRefreshClicked(sprite: Phaser.GameObjects.Sprite) {
        var sessionRoomId = sessionStorage.getItem("roomid");
        var sessionUserId = sessionStorage.getItem("userid");

        // Prepare for the next update of upgrades - clear the update list
        EconomyData.CreditsWereSpent = true;
        UpgradeData = [];
        this.readyToUpdateUpgrades = true;

        connection.invoke("RefreshShop", sessionUserId, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }

    onTierUpClicked(sprite: Phaser.GameObjects.Sprite) {
        // Don't allow for upgrades if short of credits
        if (EconomyData.CreditsLeft < EconomyData.UpgradeTierCost) {
            return;
        }

        EconomyData.CreditsWereSpent = true;
        var sessionRoomId = sessionStorage.getItem("roomid");
        var sessionUserId = sessionStorage.getItem("userid");

        // Prepare for the next update of upgrades - clear the update list
        UpgradeData = [];
        this.readyToUpdateUpgrades = true;

        connection.invoke("TierUp", sessionUserId, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }

    onUpgradeClicked(upgrade: UpgradeCard) {
        /* Currently, allow for buying of the last upgrade regardless of cost
        if (upgrade.Upgrade.Cost > CreditsLeft) {
            return;
        } */

        EconomyData.CreditsWereSpent = true;
        var sessionRoomId = sessionStorage.getItem("roomid");
        var sessionUserId = sessionStorage.getItem("userid");

        // Prepare for the next update of upgrades - clear the update list
        UpgradeData = [];
        this.readyToUpdateUpgrades = true;

        connection.invoke("ChooseUpgrade", upgrade.Upgrade.ServerId, sessionUserId, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
}

class UpgradeCard extends Phaser.Physics.Arcade.Sprite {
    Upgrade: ServerUpgradeData;
    Title: Phaser.GameObjects.Text;
    Description: Phaser.GameObjects.Text;
    Cost: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, upgradeData: ServerUpgradeData, height: number, width: number) {
        super(scene, x, y, texture);
        this.Upgrade = upgradeData;

        this.height = height;
        this.width = width;

        var displayTitle = upgradeData.UpgradeName + upgradeData.UpgradeAmount;
        if (upgradeData.UpgradeName.length == 0) { displayTitle = "" }; // Represent the blank upgrade card

        this.Title = scene.add.text(x + this.width * 0.15, y + this.height * 0.05, displayTitle, { color: 'Black' });
        this.Title.scale = width * 0.008;
        this.Description = scene.add.text(x + this.width * 0.05, y + this.height * 0.3, upgradeData.Description, { color: 'Black' });
        this.Description.scale = width * 0.005;
        this.Description.setWordWrapWidth(this.width * 0.92 / this.Description.scale);

        if (upgradeData.Cost > 0) {
            this.Cost = scene.add.text(x + this.width * 0.9, y + this.height * 0.01, upgradeData.Cost.toString(), { color: 'Black' });
            this.Cost.scale = width * 0.0065;
        }
    }
}

class BallStats extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    playerBall: PlayerBall;
    statsDisplay: Record<string, Phaser.GameObjects.Text>;
    pointsDisplay: Record<string, Phaser.GameObjects.Text>;
    keystoneDisplay: Phaser.GameObjects.Text[];

    displayToggle: integer;
    constructor() {
        super({ key: 'BallStats', active: true, visible: true });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.displayToggle = 0;
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.on('gameobjectdown', this.onObjectClicked);
        this.statsDisplay = {};
        this.pointsDisplay = {};
        this.keystoneDisplay = [];

        var playerBalls = InitializeBalls(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,
        }), this, 0.15 /*Area taken by the  balls*/);

        this.playerBall = playerBalls[0];

        // Get the scale multiplier, so we know where to put things
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        var scaleMultiplier = GetScale(this);

        this.playerBall.setVelocity(0, 0); // Balls in this display do not move
        this.playerBall.setPosition(150 * scaleMultiplier, 150 * scaleMultiplier); // Set the ball to the top-left of the screen

        this.playerBall.setInteractive(
            new Phaser.Geom.Circle(this.playerBall.x, this.playerBall.y, this.playerBall.Size),
            CircleDetection);

        // Add the "TOGGLE VIEW" text
        var toggleViewText = this.add.text(this.playerBall.x - this.playerBall.Size * 0.9, this.playerBall.y - this.playerBall.Size * 0.3, "[TOGGLE VIEW]", { color: 'Black' });
        toggleViewText.scale = boundingDimension * 0.0021;

        this.statsDisplay["hp"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["dmg"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["armor"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["velocity"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["size"] = this.add.text(0, 0, "", { color: 'Black' });

        this.pointsDisplay["round"] = this.add.text(0, 0, "", { color: 'Black' });
        this.pointsDisplay["dmgdone"] = this.add.text(0, 0, "", { color: 'Black' });
        this.pointsDisplay["dmgreceived"] = this.add.text(0, 0, "", { color: 'Black' });
        this.pointsDisplay["roundscore"] = this.add.text(0, 0, "", { color: 'Black' });
        this.pointsDisplay["totalscore"] = this.add.text(0, 0, "", { color: 'Black' });

        this.updateText();

        const STATFONTSCALE = 0.002;
        var textArray = [];
        for (let key in this.statsDisplay) {
            var stat = this.statsDisplay[key];
            stat.scale = boundingDimension * STATFONTSCALE;
            textArray.push(stat);
        }
        Phaser.Actions.PlaceOnCircle(textArray, new Phaser.Geom.Circle(this.playerBall.x, this.playerBall.y - 15 * scaleMultiplier, this.playerBall.Size + 5 * scaleMultiplier), -0.6, 1.3);

        var textArray2 = [];
        for (let key in this.pointsDisplay) {
            var points = this.pointsDisplay[key];
            points.scale = boundingDimension * STATFONTSCALE;
            textArray2.push(points);
            points.setVisible(false);
        }
        Phaser.Actions.PlaceOnCircle(textArray2, new Phaser.Geom.Circle(this.playerBall.x, this.playerBall.y - 15 * scaleMultiplier, this.playerBall.Size + 5 * scaleMultiplier), -0.6, 1.3);
    }

    update() {
        // No actual to clear graphics - just update text - but we do so anyway
        this.graphics.clear();
        this.updateText();
        DrawBalls(this.graphics, [this.playerBall]);
    }

    updateText() {
        for (let data of BallData) {
            CopyBallData(this.playerBall, data);
        }

        this.statsDisplay["hp"].text = "HP:" + this.playerBall.MaxHp.toString();
        this.statsDisplay["dmg"].text = "DMG:" + this.playerBall.Damage.toString();
        this.statsDisplay["armor"].text = "ARMOR:" + this.playerBall.Armor.toString();
        this.statsDisplay["velocity"].text = "SPEED:" + this.playerBall.VelocityMultiplier.toString();
        this.statsDisplay["size"].text = "SIZE:" + this.playerBall.SizeMultiplier.toString();

        var playerScore = RoundScoreData[0];
        this.pointsDisplay["round"].text = "ROUND: " + RoundNumber.toString();
        this.pointsDisplay["dmgdone"].text = "DMG Taken: " + playerScore.RoundDamageDone.toString();
        this.pointsDisplay["dmgreceived"].text = "DMG Received: " + playerScore.RoundDamageReceived.toString();
        this.pointsDisplay["roundscore"].text = "SCORE (Round): " + playerScore.RoundScore.toString();
        this.pointsDisplay["totalscore"].text = "SCORE (Total): " + playerScore.TotalScore.toString();

        // Update keystone display info - reinitialize only if needed
        var keystonesUpdated = false;
        if (EconomyData.CreditsWereSpent) {
            keystonesUpdated = true;
        }
        else if (this.playerBall.KeystoneData.length > this.keystoneDisplay.length) {
            keystonesUpdated = true;
        }
        else if (this.playerBall.KeystoneData.length == this.keystoneDisplay.length) {
            for (var i = 0; i < this.keystoneDisplay.length; i++) {
                if (this.keystoneDisplay[i].text != this.playerBall.KeystoneData[i][0] + this.playerBall.KeystoneData[i][1]) {
                    keystonesUpdated = true;
                    break;
                }
            }
        }
        else {
            keystonesUpdated = true;
        }

        if (keystonesUpdated) {
            for (let keystoneDisplay of this.keystoneDisplay) {
                keystoneDisplay.destroy();
            }

            EconomyData.CreditsWereSpent = false;
            this.keystoneDisplay = [];
            for (let keystoneData of this.playerBall.KeystoneData) {
                this.keystoneDisplay.push(this.add.text(0, 0, keystoneData[0] + keystoneData[1], { color: 'Black' }));
            }

            var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
            var scaleMultiplier = GetScale(this);

            for (let textElement of this.keystoneDisplay) {
                // Start shrinking font at 8 keystones
                var fontScale = Math.min(0.0020, 0.016 / this.keystoneDisplay.length);
                textElement.scale = boundingDimension * fontScale;
                if (this.displayToggle != 1) {
                    textElement.setVisible(false);
                }
            }

            var maxRadians = Math.min(0.3 * this.keystoneDisplay.length - 0.8, 1.3);
            Phaser.Actions.PlaceOnCircle(this.keystoneDisplay, new Phaser.Geom.Circle(this.playerBall.x, this.playerBall.y - 10 * scaleMultiplier, this.playerBall.Size + 5 * scaleMultiplier), -0.7, maxRadians);
        }
    }

    onObjectClicked(pointer, gameObject: Phaser.GameObjects.GameObject) {
        var scene = gameObject.scene as BallStats;
        var ball = gameObject as PlayerBall;
        if (ball.KeystoneData == null || scene.playerBall == null) {
            return;
        }

        // Change what is displayed
        scene.displayToggle = (scene.displayToggle + 1) % 3;

        // 0 for displaying stats
        for (let key in scene.statsDisplay) {
            scene.statsDisplay[key].setVisible(scene.displayToggle == 0);
        }

        // 1 for displaying keystones
        for (let display of scene.keystoneDisplay) {
            display.setVisible(scene.displayToggle == 1);
        }

        // 2 for displaying points{
        for (let key in scene.pointsDisplay) {
            scene.pointsDisplay[key].setVisible(scene.displayToggle == 2);
        }
    }
}