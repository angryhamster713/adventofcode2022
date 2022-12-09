//
// For part 2, pass "2" as the second command line argument; see PART_2 variable
//

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
const lines = input_file.split("\n").filter((line) => line !== "");

//--------------------------------------------------

const head_position = [0, 0];
const tails = [];
const PART_2 = args[1] === "2";
const number_of_tails = PART_2 ? 9 : 1;
for (let i = 0; i < number_of_tails; i++) {
  tails.push([0, 0]);
}

const visited_coordinates = new Set();
visited_coordinates.add("0,0");

function getSign(num) {
  if (num === 0) return 0;
  return num / Math.abs(num);
}

lines.forEach((line) => {
  const [direction, repetitions] = line.split(" ");
  for (let i = 0; i < repetitions; i++) {
    switch (direction) {
      case "L":
        head_position[0] = head_position[0] - 1;
        break;
      case "R":
        head_position[0] = head_position[0] + 1;
        break;
      case "U":
        head_position[1] = head_position[1] + 1;
        break;
      case "D":
        head_position[1] = head_position[1] - 1;
        break;
    }
    tails.forEach((tail_position, tail_index) => {
      const knot_before =
        tail_index === 0 ? head_position : tails[tail_index - 1];
      const vertical_distance = knot_before[1] - tail_position[1];
      const horizontal_distance = knot_before[0] - tail_position[0];
      if (
        Math.abs(horizontal_distance) > 1 ||
        Math.abs(vertical_distance) > 1
      ) {
        tail_position[0] = tail_position[0] + getSign(horizontal_distance);
        tail_position[1] = tail_position[1] + getSign(vertical_distance);
        if (tail_index === number_of_tails - 1)
          visited_coordinates.add(`${tail_position[0]},${tail_position[1]}`);
      }
    });
  }
});

console.log(visited_coordinates.size);
