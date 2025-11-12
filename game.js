// ---------- Classes ----------

class Item {
  constructor(name, description) {
    this.name = name;
    this.description = description;
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

  describe() {
    let text = `${this.description}\n`;
    if (this.items.length > 0) {
      text += `You see: ${this.items.map(i => i.name).join(", ")}.\n`;
    }
    text += `Exits: ${Object.keys(this.connections).join(", ")}.`;
    return text;
  }
}

class Player {
  constructor() {
    this.inventory = [];
  }

  addItem(item) {
    this.inventory.push(item);
  }

  hasItem(name) {
    return this.inventory.some(i => i.name === name);
  }

  listInventory() {
    if (this.inventory.length === 0) return "You have no items.";
    return "You have: " + this.inventory.map(i => i.name).join(", ");
  }
}

class Game {
  constructor() {
    this.rooms = {};
    this.currentRoom = null;
    this.player = new Player();
    this.isGameOver = false;
  }

  start() {
    const crashSite = new Room("Crash Site", "You crashed on Earth. Find the missing ship parts!");
    const mcdonalds = new Room("McDonalds", "Full of humans… act natural.");
    const cave = new Room("Cave", "Dark, damp… something beeps faintly.");
    const river = new Room("River", "A glowing river with shiny wreckage nearby.");
    const lab = new Room("Laboratory", "Top secret human tech. They must not see you.");

    crashSite.connect("north", mcdonalds);
    crashSite.connect("east", river);
    mcdonalds.connect("south", crashSite);
    mcdonalds.connect("east", cave);
    cave.connect("west", mcdonalds);
    river.connect("west", crashSite);
    river.connect("north", lab);
    lab.connect("south", river);

    const enginePart = new Item("Engine Part", "Core engine fragment.");
    const controlChip = new Item("Control Chip", "Main brain of the ship.");
    const fuelCell = new Item("Fuel Cell", "Glowing energy container.");

    mcdonalds.items.push(enginePart);
    cave.items.push(controlChip);
    river.items.push(fuelCell);

    this.rooms = { crashSite, mcdonalds, cave, river, lab };
    this.currentRoom = crashSite;
    this.updateUI();
  }

  move(direction) {
    const nextRoom = this.currentRoom.connections[direction];
    if (!nextRoom) {
      this.showMessage("You can’t go that way!");
      return;
    }

    if (nextRoom.name === "Laboratory" && !this.hasAllParts()) {
      this.lose("Humans capture you before your ship is repaired!");
      return;
    }

    this.currentRoom = nextRoom;
    this.checkWinCondition();
    this.updateUI();
  }

  pickUp(item) {
    this.player.addItem(item);
    this.currentRoom.items = this.currentRoom.items.filter(i => i !== item);
    this.showMessage(`You picked up the ${item.name}.`);
  }

  hasAllParts() {
    return (
      this.player.hasItem("Engine Part") &&
      this.player.hasItem("Control Chip") &&
      this.player.hasItem("Fuel Cell")
    );
  }

  checkWinCondition() {
    if (this.currentRoom.name === "Crash Site" && this.hasAllParts()) {
      this.win("You rebuilt your ship and escaped Earth!");
    }
  }

  showMessage(msg) {
    document.getElementById("description").textContent = msg;
    document.getElementById("actions").innerHTML =
      `<button onclick="game.updateUI()" class="bg-green-700 p-2 rounded">Continue</button>`;
  }

  lose(message) {
    this.isGameOver = true;
    document.getElementById("description").textContent = "💀 " + message;
    document.getElementById("actions").innerHTML =
      `<button onclick="location.reload()" class="bg-red-700 p-2 rounded">Restart</button>`;
  }

  win(message) {
    this.isGameOver = true;
    document.getElementById("description").textContent = "🏆 " + message;
    document.getElementById("actions").innerHTML =
      `<button onclick="location.reload()" class="bg-blue-700 p-2 rounded">Play Again</button>`;
  }

  updateUI() {
    if (this.isGameOver) return;

    document.getElementById("room-name").textContent = this.currentRoom.name;
    document.getElementById("description").textContent = this.currentRoom.describe();

    const actions = document.getElementById("actions");
    actions.innerHTML = "";

    for (let dir in this.currentRoom.connections) {
      const btn = document.createElement("button");
      btn.textContent = "Go " + dir;
      btn.className = "bg-green-800 hover:bg-green-600 p-2 rounded";
      btn.onclick = () => this.move(dir);
      actions.appendChild(btn);
    }

    this.currentRoom.items.forEach(item => {
      const btn = document.createElement("button");
      btn.textContent = "Pick up " + item.name;
      btn.className = "bg-yellow-700 hover:bg-yellow-600 p-2 rounded text-black";
      btn.onclick = () => this.pickUp(item);
      actions.appendChild(btn);
    });

    const invBtn = document.createElement("button");
    invBtn.textContent = "Check Inventory";
    invBtn.className = "bg-blue-800 hover:bg-blue-600 p-2 rounded";
    invBtn.onclick = () => this.showMessage(this.player.listInventory());
    actions.appendChild(invBtn);
  }
}

const game = new Game();
game.start();
