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
    }

    onObjectClick(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        if (!this.DataSynchronized) {
            return;
        }

        var image = gameObject as Phaser.GameObjects.Image;
        if (image?.name == null) { return; }

        if (this.selectedImage != null) {
            this.selectedImage.tint = this.OriginalTint;

            if (this.selectedImage.name == image.name) { // Deselect
                this.selectedImage = null;
                document.getElementById("upgrademenupointsdisplay").hidden = false;

                document.getElementById("upgrademenubodystatsdisplay").hidden = true;
                document.getElementById("upgrademenutentaclestatsdisplay").hidden = true;

                (document.getElementById("specialupgrademenu") as HTMLTableElement).innerHTML = "";
                return;
            }
        }

        // For main body upgrades
        if (image.name == Upgradescreen.MAINBODYNAME) {
            this.selectedImage = image;
            image.tint = 0xFFFFFF;

            document.getElementById("upgrademenutentaclestatsdisplay").hidden = true;
            document.getElementById("upgrademenubodystatsdisplay").hidden = false;
            clearUpgradeMenuCosts();

            document.getElementById("upgrademenudisplaybodyhp").textContent = "" + Math.round(this.OctopusData.maxHitPoints * 100) / 100;
            document.getElementById("upgrademenudisplaybodyspd").textContent = "" + Math.round(this.OctopusData.speed * 10000) / 100;
            document.getElementById("upgrademenudisplaybodyarm").textContent = "" + Math.round(this.OctopusData.armor * 100) / 100;
            document.getElementById("upgrademenudisplaybodycol").textContent = "" + Math.round(this.OctopusData.collisionDamage * 100) / 100;
            document.getElementById("upgrademenudisplaybodylck").textContent = "" + Math.round(this.OctopusData.luck * 100) / 100;

            // Configure the refresh button cost
            let refreshButtonBody = document.getElementById("upgrademenudisplaycostbodyrefresh");
            refreshButtonBody.textContent = "$" + this.OctopusData.refreshCost;
            if (this.OctopusData.refreshCost > this.OctopusData.points) {
                refreshButtonBody.style.backgroundColor = "red";
            }
            else {
                refreshButtonBody.style.backgroundColor = "green";
                refreshButtonBody.onclick = purchaseUpgrade;
            }

            var specialUpgradeTable = document.getElementById("specialupgrademenu") as HTMLTableElement;
            specialUpgradeTable.innerHTML = "";

            for (let key in this.OctopusData.purchasableUpgrades) {
                var upgrade = this.OctopusData.purchasableUpgrades[key];

                switch (upgrade.displayName) {
                    case "Armor+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucostbodyarm") as HTMLTableCellElement, key, upgrade);
                        break;
                    case "Playerspeed+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucostbodyspd") as HTMLTableCellElement, key, upgrade);
                        break;
                    case "Maxhp+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucostbodyhp") as HTMLTableCellElement, key, upgrade);
                        break;
                    case "Collision+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucostbodycol") as HTMLTableCellElement, key, upgrade);
                        break;
                    case "Luck+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucostbodylck") as HTMLTableCellElement, key, upgrade);
                        break;
                    default:
                        this.ConfigureSpecialUpgrade(specialUpgradeTable, key, upgrade);
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

            document.getElementById("upgrademenutentaclestatsdisplay").hidden = false;
            document.getElementById("upgrademenubodystatsdisplay").hidden = true;
            clearUpgradeMenuCosts();

            document.getElementById("upgrademenudisplaytentacledmg").textContent = "" + Math.round(selectedWeapon.projectileDamage * 100) / 100;
            document.getElementById("upgrademenudisplaytentaclespd").textContent = "" + Math.round(selectedWeapon.projectileSpeed * 100) / 100;
            document.getElementById("upgrademenudisplaytentaclecd").textContent = "" + Math.round(selectedWeapon.fireRate * 100) / 100;
            //document.getElementById("upgrademenudisplaytentacleacc").textContent = "" + Math.round(selectedWeapon.spread * 100) / 100;
            document.getElementById("upgrademenudisplaytentacleran").textContent = "" + Math.round(selectedWeapon.range * 100) / 100;

            // Configure the refresh button cost
            let refreshButtonTentacle = document.getElementById("upgrademenudisplaycostrefreshtentacle");
            refreshButtonTentacle.textContent = "$" + this.OctopusData.refreshCost;
            if (this.OctopusData.refreshCost > this.OctopusData.points) {
                refreshButtonTentacle.style.backgroundColor = "red";
            }
            else {
                refreshButtonTentacle.style.backgroundColor = "green";
                refreshButtonTentacle.onclick = purchaseUpgrade;
            }

            var specialUpgradeTable = document.getElementById("specialupgrademenu") as HTMLTableElement;
            specialUpgradeTable.innerHTML = "";

            document.getElementById("upgrademenudisplaytentacledamagedone").textContent = selectedWeapon.damageDealt + " DMG DONE";
            for (let key in selectedWeapon.purchasableUpgrades) {
                var upgrade = selectedWeapon.purchasableUpgrades[key];

                switch (upgrade.displayName) {
                    case "Speed+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucosttentaclespd") as HTMLTableCellElement, key, upgrade);
                        break;
                    case "Accuracy+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucosttentacleacc") as HTMLTableCellElement, key, upgrade);
                        break;
                    case "Damage+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucosttentacledmg") as HTMLTableCellElement, key, upgrade);
                        break;
                    case "FireRate+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucosttentaclecd") as HTMLTableCellElement, key, upgrade);
                        break;
                    case "Range+":
                        this.ConfigureUpgradeButton(document.getElementById("upgrademenucosttentacleran") as HTMLTableCellElement, key, upgrade);
                        break;
                    default:
                        this.ConfigureSpecialUpgrade(specialUpgradeTable, key, upgrade);
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

        let offSet = (this.Tentacles.length - 5) * 0.08; // More spread for more weapons
        Phaser.Actions.PlaceOnCircle(this.Tentacles, new Phaser.Geom.Circle(this.game.canvas.width / 2, this.game.canvas.height / 2, this.MainBody.displayWidth), 0 - offSet, Math.PI + offSet);

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

    ConfigureSpecialUpgrade(specialUpgradeTable: HTMLTableElement, upgradeId: string, upgrade: Upgrade) {
        if (specialUpgradeTable.rows.length == 0) {
            specialUpgradeTable.insertRow();
            specialUpgradeTable.insertRow();
        }

        let costCell = specialUpgradeTable.rows[0].insertCell(0);
        costCell.textContent = "$" + upgrade.cost;
        this.ConfigureUpgradeButton(costCell, upgradeId, upgrade);
        specialUpgradeTable.rows[0].insertCell(0).textContent = upgrade.displayName;

        let descriptionCell = specialUpgradeTable.rows[1].insertCell(0);
        descriptionCell.textContent = upgrade.description;
        descriptionCell.colSpan = 2;
    }

    ConfigureUpgradeButton(row: HTMLTableCellElement, upgradeId: string, upgrade: Upgrade) {
        row.textContent = "$" + upgrade.cost;
        row.setAttribute("serverId", upgradeId);

        if (upgrade.cost > this.OctopusData.points) {
            row.style.backgroundColor = "red";
        }
        else {
            row.style.backgroundColor = "green";
            row.onmousedown = purchaseUpgrade; // Used to be onclick - but onmousedown happens first
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

    ev.preventDefault();
    ev.stopPropagation();
}

function setUpgradeMenuHidden(hidden: boolean) {
    var menuElements = document.getElementsByClassName("upgrademenu");
    [].forEach.call(menuElements, function (element, index, array) {
        element.hidden = hidden;
    });
}
function clearUpgradeMenuCosts() {
    var menuElements = document.getElementsByClassName("upgrademenucost");

    [].forEach.call(menuElements, function (element, index, array) {
        let cell = element as HTMLTableCellElement;
        cell.textContent = "";
        cell.style.backgroundColor = "white";
        cell.onclick = () => { }; // Clear the onclick function
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

        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller");
        (controllerScene as Octocontroller).state = ControllerState.WaitingForSync;

        // In the case of solo runs, the current scene is actually the battle arena
        if (SoloRun.Enabled) {
            controllerScene = octoProtecto.game.scene.getScene("BattleArena");
        }

        controllerScene.scene.transition({ target: "Upgradescreen" });
        var upgradeScene = octoProtecto.game.scene.getScene("Upgradescreen") as Upgradescreen;
        upgradeScene.LoadOctopus(octopusData);
    })
}