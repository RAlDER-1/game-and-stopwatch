// -----------------------------
// LOGO shows last timer
// -----------------------------
input.onLogoEvent(TouchButtonEvent.LongPressed, function () {
    basic.showString("" + (Last_time))
})
// -----------------------------
// BUTTON A
// -----------------------------
input.onButtonPressed(Button.A, function () {
    // Menu navigation
    if (menuConfirmed == 0) {
        menuOption = 0
        showMenu()
        return
    }
    // Dodge left
    if (menuOption == 0 && mode == 0 && playerX > 0) {
        playerX += -1
        Player.set(LedSpriteProperty.X, playerX)
    }
})
// -----------------------------
// START TIMER GAME
// -----------------------------
function startTimerGame () {
    running = 1
    start = input.runningTime()
    seconds = 0
}
// -----------------------------
// BUTTON B
// -----------------------------
input.onButtonPressed(Button.B, function () {
    // Menu navigation
    if (menuConfirmed == 0) {
        menuOption = 1
        showMenu()
        return
    }
    // Dodge right
    if (menuOption == 0 && mode == 0 && playerX < 4) {
        playerX += 1
        Player.set(LedSpriteProperty.X, playerX)
    }
})
// -----------------------------
// START DODGE GAME
// -----------------------------
function startDodgeGame () {
    switchToMode0 = 1
    menuOption = 0
}
// -----------------------------
// LOGO PRESS CONFIRM
// -----------------------------
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    // Confirm menu selection
    if (menuConfirmed == 0) {
        menuConfirmed = 1
        basic.clearScreen()
        if (menuOption == 0) {
            startDodgeGame()
        } else {
            startTimerGame()
        }
        return
    }
    // Pause/resume Dodge
    if (menuOption == 0) {
        if (mode == 0) {
            mode = 1
            basic.clearScreen()
        } else {
            mode = 0
            switchToMode0 = 1
            basic.clearScreen()
        }
    }
})
// -----------------------------
// MENU DISPLAY
// -----------------------------
function showMenu () {
    basic.clearScreen()
    if (menuOption == 0) {
        basic.showLeds(`
            . . . . .
            . # # # .
            . # . # .
            . # # # .
            . . . . .
            `)
    } else {
        basic.showLeds(`
            . . . . .
            . # # # .
            . # # # .
            . # # # .
            . . . . .
            `)
    }
}
let waveHits = 0
let score = 0
let start_game = 0
let obstacles: game.LedSprite[] = []
let delay_before_movement = 0
let elapsed = 0
let timerStarted = 0
let switchToMode0 = 0
let seconds = 0
let start = 0
let running = 0
let Player: game.LedSprite = null
let mode = 0
let menuOption = 0
let menuConfirmed = 0
let Last_time = 0
let playerX = 0
let obstacleY: number[] = []
playerX = 2
// prevents instant double-trigger
let abReady = 1
/**
 * -----------------------------
 */
/**
 * -----------------------------
 */
// prevents instant double-trigger
basic.forever(function () {
    if (menuConfirmed == 1 && menuOption == 1 && running == 1) {
        // AB pressed → START timer
        if (input.buttonIsPressed(Button.AB) && timerStarted == 0 && abReady == 1) {
            timerStarted = 1
            // block until AB released
            abReady = 0
            start = input.runningTime()
            basic.showLeds(`
                . # . # .
                # . # . #
                . # . # .
                # . # . #
                . # . # .
                `)
        }
        // AB released → re-arm AB detection
        if (!(input.buttonIsPressed(Button.AB)) && abReady == 0) {
            abReady = 1
        }
        // AB pressed again → STOP timer
        if (input.buttonIsPressed(Button.AB) && timerStarted == 1 && abReady == 1) {
            timerStarted = 0
            running = 0
            // prevent accidental retrigger
            abReady = 0
            elapsed = (input.runningTime() - start) / 1000
            basic.clearScreen()
            basic.showString("" + (elapsed))
            Last_time = elapsed
        }
    }
})
// -----------------------------
// RESET + START DODGE GAME
// -----------------------------
basic.forever(function () {
    if (menuConfirmed == 1 && menuOption == 0 && switchToMode0 == 1) {
        basic.clearScreen()
        basic.pause(200)
        // Reset
        playerX = 2
        delay_before_movement = 500
        obstacleY = []
        obstacles = []
        start_game = 0
        score = 0
        waveHits = 0
        // Remove old player
        if (Player) {
            Player.delete()
        }
        Player = game.createSprite(playerX, 4)
        for (let index = 0; index < 4; index++) {
            obstacles.push(game.createSprite(Math.randomRange(0, 4), 0))
            obstacleY.push(0)
        }
        switchToMode0 = 0
        start_game = 1
    }
})
// -----------------------------
// DODGE GAME LOOP
// -----------------------------
basic.forever(function () {
    if (menuConfirmed == 1 && menuOption == 0 && start_game == 1 && mode == 0) {
        for (let j = 0; j <= obstacles.length - 1; j++) {
            obstacleY[j]++
// Reset at bottom
            if (obstacleY[j] > 4) {
                if (delay_before_movement > 300) {
                    delay_before_movement += 0 - 10
                } else {
                    delay_before_movement = 200
                }
                waveHits += 1
                if (waveHits == obstacles.length) {
                    score += 5
                    waveHits = 0
                    basic.clearScreen()
                }
                obstacleY[j] = 0
                obstacles[j].set(LedSpriteProperty.X, Math.randomRange(0, 4))
            }
            obstacles[j].set(LedSpriteProperty.Y, obstacleY[j])
            // Collision
            if (obstacles[j].get(LedSpriteProperty.X) == playerX && obstacles[j].get(LedSpriteProperty.Y) == 4) {
                start_game = 0
                mode = 1
                basic.clearScreen()
                basic.showLeds(`
                    . # . # .
                    # # # # #
                    # # # # #
                    . # # # .
                    . . # . .
                    `)
                basic.pause(500)
                Player.delete()
                for (let o of obstacles) {
                    o.delete()
                }
                obstacles = []
                basic.clearScreen()
                basic.showString("SCORE:" + score)
            }
        }
        basic.pause(delay_before_movement)
    }
})
