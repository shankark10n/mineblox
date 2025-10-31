// Initialize Kaboom
kaboom({
    background: [135, 206, 235],
});

// ## 1. LOAD ASSETS ##
loadSprite("steve", "assets/steve.png");
loadSprite("sheep", "assets/sheep.png");
loadSprite("log", "assets/log.png");
loadSprite("freeze_gun", "assets/freeze_gun.png"); // Using the freeze_gun asset
loadSprite("irongod", "assets/irongod.png");

// ## 2. DEFINE GAME CONSTANTS & VARIABLES ##
const MOVE_SPEED = 200;
const FREEZE_RAY_SPEED = 400;
const SHEEP_SPEED = 80; // Speed for the sheep
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

// Make the gun follow the.player
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
    const sheep = add([
        sprite("sheep"),
        pos(rand(100, width() - 100), rand(100, height() - 200)),
        scale(0.15),
        anchor("center"),
        area(),
        state("move", [ "idle", "move" ]), // Add state for movement
        "sheep",
    ]);

    // This block of code makes the sheep move randomly
    sheep.onStateEnter("move", async () => {
        await wait(rand(1, 3)); // Wait for a random time before moving
        const dir = choose([LEFT, RIGHT, UP, DOWN]);
        sheep.move(dir.scale(SHEEP_SPEED));
        await wait(rand(1, 3)); // Move for a random time
        sheep.enterState("idle");
    });

    sheep.onStateEnter("idle", async () => {
        await wait(rand(1, 3));
        sheep.enterState("move");
    });
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
    sheep.paused = true; // This will stop the sheep's movement

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
        go("level2");
    }
});

// ## 8. WIN SCENE ##
scene("win", () => {
    add([ text("Level Complete!"), pos(center()), anchor("center") ]);
});

// ## 9. LEVEL 2 SCENE ##
scene("level2", () => {
    const player = add([
        sprite("steve"),
        pos(250, 450),
        anchor("center"),
        scale(0.2),
        area(),
        { isFrozen: false }, // Property to track freeze state
        "player",
    ]);

    player.onUpdate(() => {
        if (player.pos.x < 0) {
            player.pos.x = 0;
        }
        if (player.pos.x > width()) {
            player.pos.x = width();
        }
        if (player.pos.y < 0) {
            player.pos.y = 0;
        }
        if (player.pos.y > height()) {
            player.pos.y = height();
        }
    });

    const ironGod = add([
        sprite("irongod"),
        pos(width() - 200, 200),
        anchor("center"),
        scale(0.3),
        area(),
        { health: 5 }, // Give the Iron God 5 health
        "irongod",
    ]);

    // Player movement
    onKeyDown("left", () => {
        if (!player.isFrozen) {
            player.move(-MOVE_SPEED, 0);
            lastDir = LEFT;
        }
    });
    onKeyDown("right", () => {
        if (!player.isFrozen) {
            player.move(MOVE_SPEED, 0);
            lastDir = RIGHT;
        }
    });
    onKeyDown("up", () => {
        if (!player.isFrozen) {
            player.move(0, -MOVE_SPEED);
            lastDir = UP;
        }
    });
    onKeyDown("down", () => {
        if (!player.isFrozen) {
            player.move(0, MOVE_SPEED);
            lastDir = DOWN;
        }
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

    // Iron God Logic
    let ironGodMoveDir = choose([LEFT, RIGHT, UP, DOWN]);
    ironGod.onUpdate(() => {
        ironGod.move(ironGodMoveDir.scale(SHEEP_SPEED * 1.5));
        if (ironGod.pos.x < 0 || ironGod.pos.x > width() || ironGod.pos.y < 0 || ironGod.pos.y > height()) {
            // If it goes off-screen, choose a new direction towards the center
            ironGodMoveDir = center().sub(ironGod.pos).unit();
        }
    });

    // Change direction periodically
    loop(2, () => {
        ironGodMoveDir = choose([LEFT, RIGHT, UP, DOWN]);
    });

    // Attack periodically
    loop(4, () => {
        if (player.pos) { // Ensure player exists
            const freezeRay = add([
                rect(12, 4),
                pos(ironGod.pos),
                color(173, 216, 230),
                anchor("center"),
                area(),
                move(player.pos.sub(ironGod.pos).unit(), FREEZE_RAY_SPEED),
                "irongod-freeze-ray",
            ]);
        }
    });

    onCollide("irongod-freeze-ray", "player", (ray, player) => {
        destroy(ray);
        player.paused = true;
        add([
            text("You are frozen!"),
            pos(center()),
            anchor("center")
        ]);

        // Add a frosty overlay
        const frozenOverlay = add([
            rect(0.5 * 0.5 * 0.8 * player.width, 0.5 * 0.5 * 0.8 * player.height),
            pos(player.pos),
            anchor("center"),
            color(100, 200, 255),
            opacity(0.4),
            outline(2, rgb(66, 118, 255)),
            "frozen",
        ]);
        frozenOverlay.onUpdate(() => {
            frozenOverlay.pos = player.pos;
        });
    });

    onCollide("freeze-ray", "irongod", (ray, god) => {
        destroy(ray);
        god.health--;

        // Show a "hit" effect (flash)
        god.opacity = 0.5;
        wait(0.1, () => {
            god.opacity = 1;
        });

        if (god.health <= 0) {
            destroy(god);
            // Destroy all enemy rays to clean up
            every("irongod-freeze-ray", destroy);
            
            // Go to the win scene
            go("win");
        }
    });

});

go("level2");