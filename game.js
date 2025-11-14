// Background music
function setupMusic() {
  document.addEventListener("click", () => {
    const bg = document.getElementById("bg-music");
    if (bg && bg.paused) {
      bg.volume = 0.5;
      bg.play();
    }
  }, { once: true });
}

setupMusic();

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
      text += `<span class='font-bold block mt-3'>You see:</span> ${this.items.map(i => i.name).join(", ")}.`;
    }
    return text;
  }

  listExits() {
    return Object.keys(this.connections);
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

    this.startTime = Date.now();
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    this.timerElement = null;
  }

  start() {
    const sfx = document.getElementById("start-sound");
    if (sfx) {
      sfx.volume = 1.0;
      sfx.play().catch(() => {});
    }

    const crashSite = new Room("Crash Site", "Your alien spaceship has crash landed on Earth! Find the unusual necessary parts to fix your ship and return to your home planet!");
    const mcdonalds = new Room("McDonalds", "Full of humans, this must be their base of operations. Act natural, move fast!");
    const cave = new Room("Football Stadium", "Ah, this must be where the humans come to watch eachother battle, just like home!");
    const river = new Room("Big Ben - Westminster", "What an odd looking rocket. This'll do!");
    const lab = new Room("Centre for Disease Control", "Top secret human tech, yet still so primitive. Nothing I can use here.");

    crashSite.connect("North", mcdonalds);
    crashSite.connect("East", river);
    mcdonalds.connect("South", crashSite);
    mcdonalds.connect("East", cave);
    cave.connect("West", mcdonalds);
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

    // Flash red warning when entering CDC
    if (nextRoom.name === "Centre for Disease Control") {
      document.body.classList.add('flash-red');
      setTimeout(() => document.body.classList.remove('flash-red'), 300);
    }

    if (nextRoom.name === "Centre for Disease Control" && !this.hasAllParts()) {
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
    this.showMessage(`<span class='font-bold block mt-3'>You picked up the ${item.name}.</span>`);
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
    document.getElementById("description").innerHTML = msg;
    document.getElementById("actions").innerHTML =
      `<button onclick="game.updateUI()" class="bg-green-700 p-2 rounded">Continue</button>`;
    document.getElementById("exits").innerHTML = "";
  }

  // UPDATED LOSE() — forces CDC header immediately
  lose(message) {
    this.isGameOver = true;
    clearInterval(this.timerInterval);

    // Update header instantly
    document.getElementById("room-name").textContent = "Centre for Disease Control";

    // Show lose text
    document.getElementById("description").textContent = "Nice Try! " + message;

    // Restart button
    document.getElementById("actions").innerHTML =
      `<button onclick="location.reload()" class="bg-red-700 p-2 rounded">Restart</button>`;

    document.getElementById("exits").innerHTML = "";
  }

  win(message) {
    this.isGameOver = true;
    clearInterval(this.timerInterval);
    document.getElementById("description").textContent = "Congratulations! " + message;
    document.getElementById("actions").innerHTML =
      `<button onclick="location.reload()" class="bg-blue-700 p-2 rounded">Play Again</button>`;
    document.getElementById("exits").innerHTML = "";
  }

  updateTimer() {
    if (this.isGameOver || !this.timerElement) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");

    this.timerElement.textContent = `Time: ${mins}:${secs}`;
  }

  updateUI() {
    if (!this.timerElement) {
      this.timerElement = document.createElement("p");
      this.timerElement.className = "text-green-300 font-bold mb-2";
      const container = document.querySelector('.border.border-green-600');
      container.insertBefore(this.timerElement, container.firstChild.nextSibling);
    }

    if (this.isGameOver) return;

    document.getElementById("room-name").textContent = this.currentRoom.name;
    document.getElementById("description").innerHTML = this.currentRoom.describe();

    const exits = this.currentRoom.listExits();
    document.getElementById("exits").innerHTML =
      `<strong class='text-green-300'>Exits:</strong> ${exits.map(e => `<span class='font-bold text-green-400'>${e}</span>`).join(", ")}`;

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

// START BUTTON LOGIC
function startGame() {
  document.getElementById("start-menu").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");

  const bg = document.getElementById("bg-music");
  if (bg) {
    bg.volume = 0.5;
    bg.play().catch(() => {});
  }

  game.start();
}

const game = new Game();
