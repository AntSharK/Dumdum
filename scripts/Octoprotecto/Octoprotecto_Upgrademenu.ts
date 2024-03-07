// Store when a click is made on the HTML Table, so that the menu doesn't need to response to this click
var HTMLTABLEINTERACTED: boolean = false;

class Upgradescreen extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    OctopusData: Octopus;
    MainBody: Phaser.GameObjects.Image;
    Tentacles: Phaser.GameObjects.Image[] = [];
    WeaponMap: { [id: string]: Weapon } = {}; // Keeps track of a mapping from image.name to weapon data
    UIScale: number = 3;
    OriginalTint: number = 0;

    selectedImage: Phaser.GameObjects.Image;

    DataSynchronized: boolean = true;
    static MAINBODYNAME = "MAINOCTOPUSBODY";

    constructor() {
        super({ key: 'Upgradescreen' });
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();
        this.scale.setGameSize(window.innerWidth, window.innerHeight);
        this.scale.refresh();

        this.input.on("gameobjectdown", this.onObjectClick, this)
        this.input.setTopOnly(true);
    }

    update() {
        HTMLTABLEINTERACTED = false;
    }

    onObjectClick(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        if (!this.DataSynchronized) {
            return;
        }

        if (HTMLTABLEINTERACTED) {
            return;
        }

        var image = gameObject as Phaser.GameObjects.Image;
        if (image?.name == null) { return; }

        if (this.selectedImage != null) {
            this.selectedImage.tint = this.OriginalTint;

            if (this.selectedImage.name == image.name) {
                this.selectedImage = null;
                document.getElementById("upgrademenupointsdisplay").hidden = false;
                (document.getElementById("upgrademenustatsdisplay") as HTMLTableElement).innerHTML = "";
                (document.getElementById("specialupgrademenu") as HTMLTableElement).innerHTML = "";
                return;
            }
        }

        // For mainbody upgrades
        if (image.name == Upgradescreen.MAINBODYNAME) {
            this.selectedImage = image;
            image.tint = 0xFFFFFF;

            var table = document.getElementById("upgrademenustatsdisplay") as HTMLTableElement;
            table.innerHTML = "";
            var specialUpgradeTable = document.getElementById("specialupgrademenu") as HTMLTableElement;
            specialUpgradeTable.innerHTML = "";

            let row = table.insertRow(0);
            let collisionDmgButtonRow = row.insertCell(0);
            let armorButtonRow = row.insertCell(0);
            let playerspeedButtonRow = row.insertCell(0);
            let maxhpButtonRow = row.insertCell(0);

            row = table.insertRow(0);
            let refreshButtonRow = row.insertCell(0);
            refreshButtonRow.textContent = "$" + this.OctopusData.refreshCost;
            if (this.OctopusData.refreshCost > this.OctopusData.points) {
                refreshButtonRow.style.backgroundColor = "red";
            }
            else {
                refreshButtonRow.style.backgroundColor = "green";
                refreshButtonRow.onclick = purchaseUpgrade;
            }

            row.insertCell(0).textContent = "" + Math.round(this.OctopusData.collisionDamage * 100) / 100;
            row.insertCell(0).textContent = "" + Math.round(this.OctopusData.armor * 100)/100;
            row.insertCell(0).textContent = "" + Math.round(this.OctopusData.speed * 10000)/100;
            row.insertCell(0).textContent = "" + Math.round(this.OctopusData.maxHitPoints * 100)/100;
            row = table.insertRow(0);
            let cell = row.insertCell(0);
            cell.textContent = ">>";
            cell.title = "Refreshing will change the available purchaseable upgrades everywhere.";
            cell = row.insertCell(0);
            cell.textContent = "COL";
            cell.title = "This is the amount of damage dealt to enemies when they collide with you.";
            cell = row.insertCell(0);
            cell.textContent = "ARM";
            cell.title = "Each point of armor reduces damage taken from a single hit.";
            cell = row.insertCell(0);
            cell.textContent = "SPD";
            cell.title = "The speed of your octopus.";
            cell = row.insertCell(0);
            cell.textContent = "HP";
            cell.title = "The maximum number of hit points your octopus has.";

            for (let key in this.OctopusData.purchasableUpgrades) {
                var upgrade = this.OctopusData.purchasableUpgrades[key];

                switch (upgrade.displayName) {
                    case "Armor+":
                        this.ConfigureUpgradeButton(armorButtonRow, key, upgrade);
                        break;
                    case "Playerspeed+":
                        this.ConfigureUpgradeButton(playerspeedButtonRow, key, upgrade);
                        break;
                    case "Maxhp+":
                        this.ConfigureUpgradeButton(maxhpButtonRow, key, upgrade);
                        break;
                    case "Collision+":
                        this.ConfigureUpgradeButton(collisionDmgButtonRow, key, upgrade);
                        break;
                    default:
                        let specialRow = specialUpgradeTable.insertRow(0);
                        var specialUpgradeCell = specialRow.insertCell(0);
                        specialUpgradeCell.textContent = "$" + upgrade.cost;
                        this.ConfigureUpgradeButton(specialUpgradeCell, key, upgrade);
                        specialRow.insertCell(0).textContent = upgrade.description;

                        specialRow = specialUpgradeTable.insertRow(0);
                        specialUpgradeTable.insertRow(0);
                        let specialCell = specialRow.insertCell(0);
                        specialCell.textContent = upgrade.displayName;
                        specialCell.colSpan = 2;
                        break;
                }
            }

            return;
        }

        // For weapon upgrades
        if (image.name in this.WeaponMap) {
            var selectedWeapon = this.WeaponMap[image.name];
            this.selectedImage = image;
            image.tint = 0xFFFFFF;

            var table = document.getElementById("upgrademenustatsdisplay") as HTMLTableElement;
            table.innerHTML = "";
            var specialUpgradeTable = document.getElementById("specialupgrademenu") as HTMLTableElement;
            specialUpgradeTable.innerHTML = "";

            let row = table.insertRow(0);
            let rangeButtonRow = row.insertCell(0);
            let spreadButtonRow = row.insertCell(0);
            let cooldownButtonRow = row.insertCell(0);
            let speedButtonRow = row.insertCell(0);
            let damageButtonRow = row.insertCell(0);

            row = table.insertRow(0);
            let refreshButtonRow = row.insertCell(0);
            refreshButtonRow.textContent = "$" + this.OctopusData.refreshCost;
            if (this.OctopusData.refreshCost > this.OctopusData.points) {
                refreshButtonRow.style.backgroundColor = "red";
            }
            else {
                refreshButtonRow.style.backgroundColor = "green";
                refreshButtonRow.onclick = purchaseUpgrade;
            }

            row.insertCell(0).textContent = "" + Math.round(selectedWeapon.range * 100) / 100;
            row.insertCell(0).textContent = "" + Math.round(selectedWeapon.spread * 100) / 100;
            row.insertCell(0).textContent = "" + Math.round(selectedWeapon.fireRate * 100) / 100;
            row.insertCell(0).textContent = "" + Math.round(selectedWeapon.projectileSpeed * 100) / 100;
            row.insertCell(0).textContent = "" + Math.round(selectedWeapon.projectileDamage * 100) / 100;
            row = table.insertRow(0);
            let cell = row.insertCell(0);
            cell.textContent = ">>";
            cell.title = "Refreshing will change the available purchaseable upgrades everywhere.";
            cell = row.insertCell(0);
            cell.textContent = "RAN";
            cell.title = "Range is the distance enemies have to be for the weapon to fire at them.";
            cell = row.insertCell(0);
            cell.textContent = "ACC";
            cell.title = "Accuracy is the total spread of projectiles launched. A smaller value means more precision.";
            cell = row.insertCell(0);
            cell.textContent = "CD";
            cell.title = "Cooldown is the interval between firing. A lower cooldown means a higher rate of fire.";
            cell = row.insertCell(0);
            cell.textContent = "SPD";
            cell.title = "Speed is the speed of the projectile.";
            cell = row.insertCell(0);
            cell.textContent = "DMG";
            cell.title = "Damage is the damage done to enemies when the projectile hits them.";

            for (let key in selectedWeapon.purchasableUpgrades) {
                var upgrade = selectedWeapon.purchasableUpgrades[key];

                switch (upgrade.displayName) {
                    case "Speed+":
                        this.ConfigureUpgradeButton(speedButtonRow, key, upgrade);
                        break;
                    case "Accuracy+":
                        this.ConfigureUpgradeButton(spreadButtonRow, key, upgrade);
                        break;
                    case "Damage+":
                        this.ConfigureUpgradeButton(damageButtonRow, key, upgrade);
                        break;
                    case "FireRate+":
                        this.ConfigureUpgradeButton(cooldownButtonRow, key, upgrade);
                        break;
                    case "Range+":
                        this.ConfigureUpgradeButton(rangeButtonRow, key, upgrade);
                        break;
                }
            }

            return;
        }
    }

    DrawDisplayElements(octopusData: Octopus) {
        setUpgradeMenuHidden(false);
        document.getElementById("upgrademenupointsdisplay").textContent = "$" + octopusData.points;
    }

    DrawOctopus(octopusData: Octopus) {
        this.graphics.clear();
        if (this.MainBody != null) { this.MainBody.destroy(); }
        this.Tentacles.forEach(t => {
            t.destroy();
        })
        this.Tentacles = [];
        this.WeaponMap = {};

        var imageToSelect: Phaser.GameObjects.Image = null;

        this.MainBody = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "octopus");
        this.MainBody.tint = octopusData.tint;
        this.MainBody.setScale(this.UIScale);

        // Names are used for determining which object has been clicked
        this.MainBody.setName(Upgradescreen.MAINBODYNAME);
        this.MainBody.setInteractive({
            pixelPerfect: true
        });

        // Transfer over selected image data
        if (this.selectedImage != null && this.selectedImage.name == this.MainBody.name) {
            imageToSelect = this.MainBody;
            this.selectedImage = null;
        };

        this.OctopusData.weapons.forEach(w => {
            var newTentacle = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "fin");
            newTentacle.setOrigin(0, 0.5);
            newTentacle.setDepth(this.MainBody.depth - 1);
            newTentacle.setScale(this.UIScale);
            newTentacle.tint = octopusData.tint;

            newTentacle.setName("TENTACLE" + this.Tentacles.length);
            newTentacle.setInteractive({
                pixelPerfect: true
            }); 

            this.Tentacles.push(newTentacle);
            this.WeaponMap[newTentacle.name] = w;

            if (this.selectedImage != null && this.selectedImage.name == newTentacle.name) {
                imageToSelect = newTentacle;
                this.selectedImage = null;
            };
        })

        // Add a dummy element to handle off-by-one placement
        var offByOne = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "fin");
        this.Tentacles.unshift(offByOne);
        Phaser.Actions.PlaceOnCircle(this.Tentacles, new Phaser.Geom.Circle(this.game.canvas.width / 2, this.game.canvas.height / 2, this.MainBody.displayWidth), 0, Math.PI);

        this.Tentacles.shift();
        offByOne.destroy();

        this.Tentacles.forEach(t => {
            let offsetX = t.x - this.MainBody.x;
            let offsetY = t.y - this.MainBody.y;
            t.setRotation(Math.atan2(-offsetY, -offsetX));
        })

        // Restore the clicked image
        if (imageToSelect != null) {
            this.onObjectClick(null, imageToSelect);
        }
    }

    LoadOctopus(octopusData: Octopus) {
        // Loading of data is independent of the actual sprites being displayed
        this.OctopusData = Octopus.FromData(octopusData, this);

        this.OriginalTint = octopusData.tint;
        this.DataSynchronized = true;
        this.DrawOctopus(octopusData);
        this.DrawDisplayElements(octopusData);
    }

    ConfigureUpgradeButton(row: HTMLTableCellElement, upgradeId: string, upgrade: Upgrade) {
        row.textContent = "$" + upgrade.cost;
        row.setAttribute("serverId", upgradeId);

        if (upgrade.cost > this.OctopusData.points) {
            row.style.backgroundColor = "red";
        }
        else {
            row.style.backgroundColor = "green";
            row.onclick = purchaseUpgrade;
        }
    }
}

function purchaseUpgrade(ev: MouseEvent) {
    var serverId = (ev.target as HTMLElement).getAttribute("serverId");

    setUpgradeMenuHidden(true);
    signalRconnection.invoke("PurchaseUpgrade",
        sessionStorage.getItem(RoomIdSessionStorageKey),
        sessionStorage.getItem(UserIdSessionStorageKey),
        serverId).catch(function (err) {
            return console.error(err.toString());
        });

    var upgradeScene = octoProtecto.game.scene.getScene("Upgradescreen") as Upgradescreen;
    upgradeScene.DataSynchronized = false;

    HTMLTABLEINTERACTED = true;
    ev.preventDefault();
    ev.stopPropagation();
}

function setUpgradeMenuHidden(hidden: boolean) {
    var menuElements = document.getElementsByClassName("upgrademenu");
    [].forEach.call(menuElements, function (element, index, array) {
        element.hidden = hidden;
    });
}

function ConfigureUpgradeMenuSignalRListening(signalRconnection: any) {   
    signalRconnection.on("UpdateUpgrade", function (octopusData: Octopus,
        roomId: string, playerId: string) {

        // The Room ID and player ID are only passed in when this is from a reconnect event
        if (roomId != null && playerId != null) {
            sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
            sessionStorage.setItem(UserIdSessionStorageKey, playerId);
            hideLobbyMenu();
            var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena");
            battleArenaScene.scene.transition({ target: "Upgradescreen" });
        }

        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller") as Octocontroller;
        controllerScene.state = ControllerState.WaitingForSync;
        controllerScene.scene.transition({ target: "Upgradescreen" });

        var upgradeScene = octoProtecto.game.scene.getScene("Upgradescreen") as Upgradescreen;
        upgradeScene.LoadOctopus(octopusData);
    })
}