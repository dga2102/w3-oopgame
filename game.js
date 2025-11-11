// ---------- Classes ----------

// Represents an item
class Item {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}

// Represents a single room/location
class Room {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.connections = {}; // e.g. { north: roomObject }
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

// Represents the player
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
    if (this.inventory.length === 0) return "You have nothing.";
    return "You have: " + this.inventory.map(i => i.name).join(", ");
  }
}

// Controls game flow
class Game {
  constructor() {
    this.rooms = {};
    this.currentRoom = null;
    this.player = new Player();
    this.isGameOver = false;
  }

  start() {
    //Create Rooms
    const crashSite = new Room("Crash Site", "You have crashed your ship! You must navigate yourself round planet earth to collect the necessary parts to fix your ship and get back to your home planet.");
    const forest = new Room("Forest", "Tall trees surround you. You hear strange noises.");
    const cave = new Room("Cave", "It's dark and cold inside the cave.");
    const river = new Room("River", "A wide river glows under the moonlight. You can see human lights in the distance.");
    const lab = new Room("Laboratory", "A hidden human research facility. You hear footsteps approaching...");

    //Connect Rooms
    crashSite.connect("north", forest);
    crashSite.connect("east", river);
    forest.connect("south", crashSite);
    forest.connect("east", cave);
    cave.connect("west", forest);
    river.connect("west", crashSite);
    river.connect("north", lab);
    lab.connect("south", river);

    //Add Items
    const enginePart = new Item("Engine Part", "A glowing fragment of alien machinery.");
    const controlChip = new Item("Control Chip", "The ship’s central processor.");
    const fuelCell = new Item("Fuel Cell", "A canister of glowing blue energy.");

    forest.items.push(enginePart);
    cave.items.push(controlChip);
    river.items.push(fuelCell);

    // Store Rooms
    this.rooms = { crashSite, forest, cave, river, lab };

    //Start Game 
    this.currentRoom = crashSite;
    this.updateUI();
  }

  // Move player to a new room
  move(direction) {
    const nextRoom = this.currentRoom.connections[direction];
    if (!nextRoom) {
      this.showMessage("You can’t go that way!");
      return;
    }

    // Lose condition, entering lab without all parts
    if (nextRoom.name === "Laboratory" && !this.hasAllParts()) {
      this.lose("Humans capture you before you can fix your ship!");
      return;
    }

    this.currentRoom = nextRoom;
    this.checkWinCondition();
    this.updateUI();
  }

  // Pick up an item in the current room
  pickUp(item) {
    this.player.addItem(item);
    this.currentRoom.items = this.currentRoom.items.filter(i => i !== item);
    this.showMessage(`You picked up the ${item.name}.`);
  }

  // Checks if player has all spaceship parts
  hasAllParts() {
    return (
      this.player.hasItem("Engine Part") &&
      this.player.hasItem("Control Chip") &&
      this.player.hasItem("Fuel Cell")
    );
  }

  // Checks if player has won
  checkWinCondition() {
    if (this.currentRoom.name === "Crash Site" && this.hasAllParts()) {
      this.win("You repair your ship and escape Earth! Congratulations!");
    }
  }

  // Display message for events
  showMessage(msg) {
    const desc = document.getElementById("description");
    const actions = document.getElementById("actions");
    desc.textContent = msg;
    actions.innerHTML = `<button onclick="game.updateUI()">Continue</button>`;
  }

  // Game over
  lose(message) {
    this.isGameOver = true;
    const desc = document.getElementById("description");
    const actions = document.getElementById("actions");
    desc.textContent = "💀 " + message;
    actions.innerHTML = `<button onclick="location.reload()">Restart</button>`;
  }

  // Game won
  win(message) {
    this.isGameOver = true;
    const desc = document.getElementById("description");
    const actions = document.getElementById("actions");
    desc.textContent = "🏆 " + message;
    actions.innerHTML = `<button onclick="location.reload()">Play Again</button>`;
  }

  updateUI() {
    if (this.isGameOver) return;

    const desc = document.getElementById("description");
    const actions = document.getElementById("actions");

    desc.textContent = this.currentRoom.describe();
    actions.innerHTML = "";

    // Movement buttons
    for (let dir in this.currentRoom.connections) {
      const btn = document.createElement("button");
      btn.textContent = "Go " + dir;
      btn.onclick = () => this.move(dir);
      actions.appendChild(btn);
    }

    // Item buttons
    this.currentRoom.items.forEach(item => {
      const btn = document.createElement("button");
      btn.textContent = "Pick up " + item.name;
      btn.onclick = () => this.pickUp(item);
      actions.appendChild(btn);
    });

    // Inventory button
    const invBtn = document.createElement("button");
    invBtn.textContent = "Check Inventory";
    invBtn.onclick = () => this.showMessage(this.player.listInventory());
    actions.appendChild(invBtn);
  }
}

// ---------- Start Game ----------
const game = new Game();
game.start();
