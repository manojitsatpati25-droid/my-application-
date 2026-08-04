// ==========================================
// COLOUR PREDICTION SERVER
// Part 1
// Express + Socket.IO
// ==========================================

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// -------------------------------
// Middleware
// -------------------------------

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// -------------------------------
// Socket.IO
// -------------------------------

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// -------------------------------
// Config
// -------------------------------

const PORT = process.env.PORT || 3000;

// -------------------------------
// Game Config
// -------------------------------

const BET_TIME = 30;

const RESULT_TIME = 5;

const COLORS = [
    "RED",
    "GREEN",
    "BLUE"
];

// -------------------------------
// Global Game State
// -------------------------------

let game = {

    round: 1,

    timer: BET_TIME,

    state: "BETTING",

    result: null,

    adminResult: null,

    users: 0,

    bets: [],

    history: []

};

// -------------------------------
// Health Check
// -------------------------------

app.get("/", (req, res) => {

    res.json({

        success: true,

        server: "Running",

        version: "1.0",

        game

    });

});

// -------------------------------
// Current Game
// -------------------------------

app.get("/game", (req, res) => {

    res.json(game);

});

// -------------------------------
// Socket Events
// -------------------------------

io.on("connection", (socket) => {

    console.log("Connected :", socket.id);

    game.users++;

    io.emit("users", game.users);

    socket.emit("game", game);

    socket.on("disconnect", () => {

        console.log("Disconnected :", socket.id);

        if (game.users > 0)
            game.users--;

        io.emit("users", game.users);

    });

});

// -------------------------------
// Start Server
// -------------------------------

server.listen(PORT, () => {

    console.log("");

    console.log("================================");

    console.log("Colour Prediction Server Started");

    console.log("Port :", PORT);

    console.log("================================");

});// ==========================================
// PART 2
// GAME ENGINE + ROUND MANAGER
// ==========================================

// Current timer
game.timer = BET_TIME;

// Current state
game.state = "BETTING";

// Start Game Engine
function startGameEngine() {

    console.log("Game Engine Started");

    setInterval(() => {

        // --------------------
        // BETTING TIME
        // --------------------

        if (game.state === "BETTING") {

            game.timer--;

            io.emit("timer", {
                round: game.round,
                timer: game.timer,
                state: game.state
            });

            // Lock Bets Last 5 Seconds
            if (game.timer === 5) {

                io.emit("betLocked");

                console.log("Bet Locked");

            }

            // Timer Finished
            if (game.timer <= 0) {

                finishRound();

            }

        }

    }, 1000);

}

// ----------------------------
// Finish Current Round
// ----------------------------

function finishRound() {

    game.state = "RESULT";

    game.timer = RESULT_TIME;

    // Admin Override
    if (game.adminResult) {

        game.result = game.adminResult;

        game.adminResult = null;

    }

    // Auto Result
    else {

        game.result =
            COLORS[Math.floor(Math.random() * COLORS.length)];

    }

    console.log("Result :", game.result);

    io.emit("result", {

        round: game.round,

        result: game.result

    });

    // Show Result For 5 Seconds

    let resultInterval = setInterval(() => {

        game.timer--;

        io.emit("resultTimer", {

            timer: game.timer,

            result: game.result

        });

        if (game.timer <= 0) {

            clearInterval(resultInterval);

            nextRound();

        }

    }, 1000);

}

// ----------------------------
// Start Next Round
// ----------------------------

function nextRound() {

    game.round++;

    game.timer = BET_TIME;

    game.state = "BETTING";

    game.result = null;

    game.bets = [];

    io.emit("newRound", {

        round: game.round,

        timer: game.timer,

        state: game.state

    });

    console.log("Round :", game.round);

}

// ----------------------------
// Start Automatically
// ----------------------------

startGameEngine();// ==========================================
// PART 3
// BET API + BET VALIDATION
// ==========================================

// Place Bet
app.post("/bet", (req, res) => {

    const { userId, color, amount } = req.body;

    // Check Game State
    if (game.state !== "BETTING") {

        return res.status(400).json({
            success: false,
            message: "Betting Closed"
        });

    }

    // Last 5 Seconds Lock
    if (game.timer <= 5) {

        return res.status(400).json({
            success: false,
            message: "Bet Locked"
        });

    }

    // Validate
    if (!userId || !color || !amount) {

        return res.status(400).json({
            success: false,
            message: "Missing Fields"
        });

    }

    const selectedColor = color.toUpperCase();

    if (!COLORS.includes(selectedColor)) {

        return res.status(400).json({
            success: false,
            message: "Invalid Color"
        });

    }

    if (Number(amount) <= 0) {

        return res.status(400).json({
            success: false,
            message: "Invalid Amount"
        });

    }

    // Prevent Duplicate Bet
    const exists = game.bets.find(
        bet => bet.userId === userId
    );

    if (exists) {

        return res.status(400).json({
            success: false,
            message: "Already Bet In This Round"
        });

    }

    // Save Bet
    const bet = {

        userId,

        color: selectedColor,

        amount: Number(amount),

        round: game.round,

        time: Date.now()

    };

    game.bets.push(bet);

    // Live Update
    io.emit("newBet", bet);

    io.emit("betStats", {

        round: game.round,

        totalBets: game.bets.length,

        totalAmount:
            game.bets.reduce(
                (sum, item) => sum + item.amount,
                0
            ),

        red:
            game.bets.filter(
                b => b.color === "RED"
            ).length,

        green:
            game.bets.filter(
                b => b.color === "GREEN"
            ).length,

        blue:
            game.bets.filter(
                b => b.color === "BLUE"
            ).length

    });

    res.json({

        success: true,

        message: "Bet Accepted",

        bet

    });

});

// --------------------------
// Get Current Bets
// --------------------------

app.get("/bets", (req, res) => {

    res.json({

        round: game.round,

        total: game.bets.length,

        bets: game.bets

    });

});