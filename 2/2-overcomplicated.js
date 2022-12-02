/*
  BROKEN
  Part 2 doesn't even work properly
*/

//--------------------------------------------------

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

const number_of_symbols = 3;
const symbols_to_numbers = {
  A: 1,
  B: 2,
  C: 3,
  X: 1,
  Y: 2,
  Z: 3,
};
let round1_total = 0;

/*
  # Part 1 #
  Rock: 1
  Paper: 2
  Scissors: 3

  Elf <- Me

  Difference = Elf - Me

  In order to win, the difference between my move and the elf's move
  needs to be -1 or 2 (Scissors <- Rock). 
  To get a single determining value, I add 3 (number of possible symbols)
  and then take the remainder of dividing by 3. It results as such:
  Draw: 0
  Lose: 1
  Win: 2
*/
function getPointsForTurn(symbol_numbers) {
  let points = 0;
  points += symbol_numbers[1];

  switch ((symbol_numbers[0] - symbol_numbers[1] + number_of_symbols) % 3) {
    case 2: // Win
      points += 6;
      break;
    case 0: // Draw
      points += 3;
      break;
    // Default - do not add any points
  }

  return points;
}

lines.forEach((line) => {
  if (!/[ABC] [XYZ]/.test(line)) return;
  const symbols = line.split(" ");
  round1_total += getPointsForTurn(
    symbols.map((symbol) => symbols_to_numbers[symbol])
  );
});
console.log(round1_total);

//--------------------------------------------------

// Not working !!!
/*
 # Part 2 #
 X - Lose 2
 Y - Draw 0
 Z - Win  1

 For a win, the difference needs to be -1, so add 1 to opponent's symbol.
 For a draw, the symbols need to be the same, so add 0.
 That means adding two to the opponent's symbol will result in a loss.

 For the symbols to stay inbounds, get the result's %3
*/

let round2_total = 0;
const symbol_to_result = {
  X: 2,
  Y: 0,
  Z: 1,
};

lines.forEach((line) => {
  if (!/[ABC] [XYZ]/.test(line)) return;
  const symbols = line.split(" ");
  const turn_result = symbol_to_result[symbols[1]];
  const turn_numbers = [
    symbols_to_numbers[symbols[0]],
    (symbols_to_numbers[symbols[0]] + turn_result) % 3,
  ];
  // console.log(turn_numbers);
  round2_total += getPointsForTurn(turn_numbers);
});
console.log(round2_total);
