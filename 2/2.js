import fs from "fs/promises";

async function getFile(filename) {
  try {
    return await fs.readFile(filename, { encoding: "utf8" });
  } catch (err) {
    console.log("Error while reading file", err);
    process.exit(1);
  }
}

const args = process.argv.slice(2);

// args[0] - input filename
const input_file = await getFile(args[0]);
const lines = input_file.split("\n");

//--------------------------------------------------

const letter_to_symbol = {
  A: "rock",
  B: "paper",
  C: "scissors",
  X: "rock",
  Y: "paper",
  Z: "scissors",
};

const symbol_to_winning_symbol = {
  rock: "paper",
  paper: "scissors",
  scissors: "rock",
};
const symbol_to_losing_symbol = Object.fromEntries(
  Object.entries(symbol_to_winning_symbol).map((entry) => [entry[1], entry[0]])
);

const symbol_to_points = {
  rock: 1,
  paper: 2,
  scissors: 3,
};

function getPointsForSymbols(opponent_symbol, my_symbol) {
  let points = 0;
  points += symbol_to_points[my_symbol];

  if (my_symbol === symbol_to_winning_symbol[opponent_symbol]) {
    // Win
    points += 6;
  } else if (my_symbol === opponent_symbol) {
    // Draw
    points += 3;
  }
  // Else you lose, no points
  return points;
}

let part1_total = 0;
lines.forEach((line) => {
  if (!/[ABC] [XYZ]/.test(line)) return;
  const letters = line.split(" ");
  const opponent_symbol = letter_to_symbol[letters[0]];
  const my_symbol = letter_to_symbol[letters[1]];
  part1_total += getPointsForSymbols(opponent_symbol, my_symbol);
});

console.log(part1_total);

//--------------------------------------------------
// # Part 2 #

const symbol_to_outcome = {
  X: "lose",
  Y: "draw",
  Z: "win",
};

let part2_total = 0;
lines.forEach((line) => {
  if (!/[ABC] [XYZ]/.test(line)) return;
  const letters = line.split(" ");
  const opponent_symbol = letter_to_symbol[letters[0]];
  const desired_outcome = symbol_to_outcome[letters[1]];

  let my_symbol;
  switch (desired_outcome) {
    case "win":
      my_symbol = symbol_to_winning_symbol[opponent_symbol];
      break;
    case "draw":
      my_symbol = opponent_symbol;
      break;
    case "lose":
      my_symbol = symbol_to_losing_symbol[opponent_symbol];
      break;
  }
  part2_total += getPointsForSymbols(opponent_symbol, my_symbol);
});
console.log(part2_total);
