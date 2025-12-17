// --- 1. Menu & Stopwatch Controls ---
input.onButtonPressed(Button.A, function () {
    if (!(confirmed)) {
        mode = Math.max(1, mode - 1)
        basic.showNumber(mode)
    } else if (gameActive && playerX > 0) {
        playerX += 0 - 1
        Player.set(LedSpriteProperty.X, playerX)
    }
})
input.onButtonPressed(Button.AB, function () {
    if (!(confirmed)) {
        confirmed = true
        if (mode == 1) {
            setupDodgeGame()
        } else if (mode == 2) {
            basic.showLeds(`
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                `)
            basic.showString("SW")
        }
    } else if (mode == 2) {
        // Toggle Stopwatch Logic
        if (!(sw_active)) {
            start_time = input.runningTime()
            sw_active = true
        } else {
            sw_active = false
            basic.clearScreen()
            basic.showString("" + (elapsed))
        }
    }
})
input.onButtonPressed(Button.B, function () {
    if (!(confirmed)) {
        mode = Math.min(2, mode + 1)
        basic.showNumber(mode)
    } else if (gameActive && playerX < 4) {
        playerX += 1
        Player.set(LedSpriteProperty.X, playerX)
    }
})
// --- 2. Dodge Game Setup ---
function setupDodgeGame() {
    basic.clearScreen()
    for (let i = 3; i > 0; i--) {
        basic.showNumber(i)
        basic.pause(200)
    }
    basic.clearScreen()
    // Initialize Game State
    playerX = 2
    score = 0
    speed = 500
    obstacles = []
    obstacleY = []
    Player = game.createSprite(playerX, playerY)
    // Create Initial Obstacles
    for (let index = 0; index < 3; index++) {
        ox = Math.randomRange(0, 4)
        obstacles.push(game.createSprite(ox, 0))
        obstacleY.push(0)
    }
    gameActive = true
}
/**
 * Game Specific Variables
 */
let newX = 0
let ox = 0
let obstacles: game.LedSprite[] = []
let score = 0
let elapsed = 0
let start_time = 0
let sw_active = false
let Player: game.LedSprite = null
let gameActive = false
let confirmed = false
let speed = 0
let playerY = 0
let playerX = 0
let mode = 0
let obstacleY: number[] = []
// --- Global Variables ---
mode = 1
playerX = 2
playerY = 4
speed = 500
// --- 3. Main Loops ---
// Stopwatch Loop
basic.forever(function () {
    if (confirmed && mode == 2 && sw_active) {
        elapsed = (input.runningTime() - start_time) / 1000
        whaleysans.showNumber(Math.floor(elapsed))
    }
})
// Dodge Game Loop
basic.forever(function () {
    if (gameActive) {
        for (let k = 0; k <= obstacles.length - 1; k++) {
            obstacleY[k]++
            obstacles[k].set(LedSpriteProperty.Y, obstacleY[k])
            // Collision Detection
            if (obstacleY[k] == playerY && obstacles[k].get(LedSpriteProperty.X) == playerX) {
                gameActive = false
                basic.pause(500)
                game.setScore(score)
                game.gameOver()
            }
            // Obstacle Recycling
            if (obstacleY[k] > 4) {
                score += 1
                // Increase speed
                speed = Math.max(150, speed - 10)
                newX = Math.randomRange(0, 4)
                obstacles[k].set(LedSpriteProperty.X, newX)
                obstacleY[k] = 0
                obstacles[k].set(LedSpriteProperty.Y, 0)
            }
        }
        basic.pause(speed)
    }
})
