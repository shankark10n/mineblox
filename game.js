// Initialize Kaboom
kaboom({
    background: [135, 206, 235],
});

// ## 1. LOAD ASSETS ##
loadSprite("steve", "assets/steve.png");
loadSprite("sheep", "assets/sheep.png");
loadSprite("log", "assets/log.png");
loadSprite("freeze_gun", "assets/freeze_gun.png"); // Using the freeze_gun asset

// ## 2. DEFINE GAME CONSTANTS & VARIABLES ##
const MOVE_SPEED = 200;
const FREEZE_RAY_SPEED = 400;
const SHEEP_TO_FREEZE = 3;
const LOGS_TO_COLLECT = 5;
const STARTING_SHEEP = 5;

let sheepFrozen = 0;
let logsCollected = 0;
let lastDir = RIGHT; // Variable to track player's last direction

// ## 3. UI SETUP ##
const sheepLabel = add([ text(`Sheep Frozen: 0/${SHEEP_TO_FREEZE}`), pos(24, 24), fixed() ]);
const logsLabel = add([ text(`Logs Collected: 0/${LOGS_TO_COLLECT}`), pos(24, 64), fixed() ]);
function updateUI() {
    sheepLabel.text = `Sheep Frozen: ${sheepFrozen}/${SHEEP_TO_FREEZE}`;
    logsLabel.text = `Logs Collected: ${logsCollected}/${LOGS_TO_COLLECT}`;
}
updateUI(); // Initial UI update

// ## 4. PLAYER & GUN SETUP ##
const player = add([
    sprite("steve"),
    pos(250, 450), // Changed starting position slightly
    anchor("center"),
    scale(0.2),
    area(), // <-- BUG FIX: Added area for collision detection
    "player",
]);

const freezeGun = add([
    sprite("freeze_gun"),
    pos(player.pos),
    anchor("center"),
    scale(0.1),
]);

// Make the gun follow the player
freezeGun.onUpdate(() => {
    freezeGun.pos = player.pos.add(10, 10); // Offset the gun slightly
});


// ## 5. CONTROLS ##
onKeyDown("left", () => {
    player.move(-MOVE_SPEED, 0);
    lastDir = LEFT;
});
onKeyDown("right", () => {
    player.move(MOVE_SPEED, 0);
    lastDir = RIGHT;
});
onKeyDown("up", () => {
    player.move(0, -MOVE_SPEED);
    lastDir = UP;
});
onKeyDown("down", () => {
    player.move(0, MOVE_SPEED);
    lastDir = DOWN;
});

onKeyPress("space", () => {
    add([
        rect(12, 4),
        pos(player.pos),
        color(173, 216, 230),
        anchor("center"),
        area(),
        move(RIGHT, FREEZE_RAY_SPEED), // Shoots to the right
        "freeze-ray",
    ]);
});


// ## 6. SPAWNING LOGIC ##
function spawnSheep() {
    add([
        sprite("sheep"),
        pos(rand(100, width() - 100), rand(100, height() - 200)),
        scale(0.15),
        anchor("center"),
        area(),
        "sheep",
    ]);
}
for (let i = 0; i < STARTING_SHEEP; i++) {
    spawnSheep();
}

function spawnLogs() {
    for (let i = 0; i < LOGS_TO_COLLECT; i++) {
        add([
            sprite("log"),
            pos(rand(50, width() - 50), rand(50, height() - 50)),
            scale(0.1),
            anchor("center"),
            area(),
            "log",
        ]);
    }
}

// ## 7. COLLISION LOGIC ##
onCollide("freeze-ray", "sheep", (ray, sheep) => {
    destroy(ray);

    // Add a frosty overlay
    const frozenOverlay = add([
        rect(0.5 * 0.5 * 0.8 * sheep.width, 0.5 * 0.5 * 0.8 * sheep.height),
        pos(sheep.pos),
        anchor("center"),
        color(100, 200, 255),
        opacity(0.4),
        outline(2, rgb(66, 118, 255)),
        "frozen",
    ]);
    
    // Optionally, "attach" the overlay so it follows the sheep
    frozenOverlay.onUpdate(() => {
        frozenOverlay.pos = sheep.pos;
    });

    // sheep.unuse("sheep"); // <-- BUG FIX: Remove "sheep" tag to prevent re-freezing

    sheepFrozen++;
    updateUI();

    // After 3 frozen sheep, spawn logs
    if (sheepFrozen === 3) {
        // destroy all sheep and frozen overlays
        destroyAll("sheep");
        destroyAll("frozen");
        spawnLogs(5);
    }
});

// Renamed tag for collision to "player" to match the object tag
onCollide("player", "log", (p, log) => {
    destroy(log);
    logsCollected++;
    updateUI();

    if (logsCollected >= LOGS_TO_COLLECT) {
        go("win");
    }
});

// ## 8. WIN SCENE ##
scene("win", () => {
    add([ text("Level Complete!"), pos(center()), anchor("center") ]);
});