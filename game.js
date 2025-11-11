class Game {
    constructor() {
        this.rooms = {};
        this.player = new Player();
        this.currentRoom = null;
        this.isGameOver = false;
    }

    start() {
        const crashSite = new Room("Crash Site", "Your spaceship is broken. Pieces are scattered across Earth.");
        const forest = new Room("Forest", "Tall trees block the sky. Something shiny is on the ground.");
        const cave = new Room("Cave", "It’s dark and cold. A glowing object is half buried.");
        const lab = new Room("Secret Lab", "Humans are studying strange technology here. Danger!");

        crashSite.connect("north", forest);
        forest.connect("south", crashSite);
        forest.connect("east", cave);
        cave.connect("west", forest);
        cave.connect("south", lab);
        lab.connect("north", cave);

        const enginePart = new Item("Engine Part", "A damaged engine piece from your ship.");
        const fuelCell = new Item("Fuel Cell", "Glowing blue energy source.");
        const controlChip = new Item("Control Chip", "Main computer chip for navigation.");

        forest.items.push(enginePart);
        cave.items.push(fuelCell);
        lab.items.push(controlChip);

        this.rooms = { crashSite, forest, cave, lab };

        this.currentRoom = crashSite;
        this.player.location = crashSite;

        this.update();
    }

    move(direction) {
        const nextRoom = this.currentRoom.connections[direction];
        if (!nextRoom) {
            this.showMessage("You can't go that way.");
            return;
        }

        this.currentRoom = nextRoom;
        this.player.location = nextRoom;

        this.checkLoseCondition();
        this.checkWinCondition();
        this.update();
    }

    pickUp(itemName) {
        const item = this.currentRoom.items.find(i => i.name === itemName);
        if (!item) {
            this.showMessage("That item is not here.");
            return;
        }

        this.player.addItem(item);
        this.currentRoom.items = this.currentRoom.items.filter(i => i.name !== itemName);
        this.showMessage(`You picked up: ${itemName}`);

        this.checkWinCondition();
        this.update();
    }

    checkWinCondition() {
        const needed = ["Engine Part", "Fuel Cell", "Control Chip"];
        const hasAllParts = needed.every(part => this.player.hasItem(part));

        if (hasAllParts && this.currentRoom.name === "Crash Site") {
            this.showMessage("You repaired your ship and escaped to your home planet. YOU WIN!");
            this.isGameOver = true;
        }
    }

    checkLoseCondition() {
        const needed = ["Engine Part", "Fuel Cell", "Control Chip"];
        const missing = needed.filter(part => !this.player.hasItem(part));

        if (this.currentRoom.name === "Secret Lab" && missing.length > 0) {
            this.showMessage("The humans captured you before your ship was fixed. YOU LOSE!");
            this.isGameOver = true;
        }
    }

    update() {
        if (this.isGameOver) return;

        let text = `<strong>Location:</strong> ${this.currentRoom.name}<br>`;
        text += `${this.currentRoom.description}<br><br>`;

        if (this.currentRoom.items.length > 0) {
            text += `<strong>Items here:</strong> ${this.currentRoom.items.map(i => i.name).join(", ")}<br>`;
        }

        text += `<strong>➡ Paths:</strong> ${Object.keys(this.currentRoom.connections).join(", ")}<br>`;
        text += `<strong>Inventory:</strong> ${this.player.inventory.map(i => i.name).join(", ") || "Empty"}`;

        document.getElementById("gameText").innerHTML = text;
    }

    showMessage(msg) {
        document.getElementById("gameText").innerHTML += `<br><br><em>${msg}</em>`;
    }
}

class Room {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.connections = {};
        this.items = [];
    }
    connect(direction, room) {
        this.connections[direction] = room;
    }
}

class Player {
    constructor() {
        this.inventory = [];
        this.location = null;
    }
    addItem(item) {
        this.inventory.push(item);
    }
    hasItem(name) {
        return this.inventory.some(item => item.name === name);
    }
}

class Item {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}

const game = new Game();
window.onload = () => game.start();
