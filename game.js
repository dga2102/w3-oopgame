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

    // ⏱️ Stopwatch
    this.startTime = Date.now();
    this.timerElement = null;
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  start() {
    const crashSite = new Room("Crash Site", "Your alien spaceship has crashlanded on Earth! Find the unusual necessary parts to fix your ship and return to your home planet!");
    const mcdonalds = new Room("McDonalds", "Full of humans, this must be their base of operations. Act natural, move fast!");
    const cave = new Room("Football Stadium", "Ah, this must be where the humans come to watch eachother battle, just like home!");
    const river = new Room("Big Ben - Westminster", "What an odd looking rocket. This'll do!");
    const lab = new Room("Centre for Disease Control", "Top secret human tech, yet still so primitive. Nothing I can use here.");

    crashSite.connect("North",mcdonalds);
    crashSite.connect("East", river);
    mcdonalds.connect("South", crashSite);
    mcdonalds.connect("East", cave);
    cave.connect("West",mcdonalds);
    river.connect("West", crashSite);
    river.connect("North", lab);
    lab.connect("South", river);

    const enginePart = new Item("Milkshake machine motor");
    const controlChip = new Item("Goal post netting");
    const fuelCell = new Item("Big Bens little hand");

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
      this.lose("Humans captured you before you could repair your ship!");
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
    this.checkWinCondition();
  }

  hasAllParts() {
    return (
      this.player.hasItem("Milkshake machine motor") &&
      this.player.hasItem("Goal post netting") &&
      this.player.hasItem("Big Bens little hand")
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
    clearInterval(this.timerInterval);
    document.getElementById("description").textContent = "Nice Try! " + message;
    document.getElementById("actions").innerHTML =
      `<button onclick="location.reload()" class="bg-red-700 p-2 rounded">Restart</button>`;
  }

  win(message) {
    this.isGameOver = true;
    clearInterval(this.timerInterval);
    document.getElementById("description").textContent = "Congratulations " + message;
    document.getElementById("actions").innerHTML =
      `<button onclick="location.reload()" class="bg-blue-700 p-2 rounded">Play Again</button>`;
  }

  // ⏱️ Stopwatch update function
  updateTimer() {
    if (this.isGameOver || !this.timerElement) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");

    this.timerElement.textContent = `Time: ${mins}:${secs}`;
  }

  updateUI() {
    // Create timer display once
    if (!this.timerElement) {
      this.timerElement = document.createElement("p");
      this.timerElement.className = "text-green-300 font-bold mb-2";
      const container = document.querySelector('.bg-gray-900');
      container.insertBefore(this.timerElement, container.firstChild.nextSibling);
    }

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
