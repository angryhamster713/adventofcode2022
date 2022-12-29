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

const map = [];

const instructions_index = (function () {
  let i = 0;
  for (; i < lines.length; i++) {
    if (!lines[i]) break;
    map[i] = lines[i].split("").map((t) => (t === " " ? undefined : t));
  }
  return i + 1;
})();
// console.log(map);
// console.log(i, lines[i + 1]);

const steps = [];

/* Directions:
  0 - Up
  1 - Right
  2 - Down
  3 - Left
*/
let tmp_direction = 1;
(lines[instructions_index] + "E").split("").reduce((step_digits, current) => {
  if (isNaN(current)) {
    steps.push({ steps: parseInt(step_digits), direction: tmp_direction });
    const direction_increment = { R: 1, L: -1, E: 0 }[current];
    tmp_direction = (tmp_direction + direction_increment + 4) % 4;
    return "";
  } else return step_digits + current;
});

let position = [0, map[0].findIndex((c) => c === ".")];

console.log(steps);
// console.log(position);

function getVerticalSlice(array, index) {
  return array.map((row) => row[index]);
}

function nonEmptyTileFilter(value, index, obj) {
  return value;
}

function findNextTile(from, direction) {
  const direction_adder = { 0: [-1, 0], 1: [0, 1], 2: [1, 0], 3: [0, -1] }[
    direction
  ];
  const first_y = from[0] + direction_adder[0];
  const first_x = from[1] + direction_adder[1];
  if (!map[first_y] || !map[first_y][first_x]) {
    let next_coordinates;
    switch (direction) {
      case 0:
        next_coordinates = [
          map.length -
            1 -
            getVerticalSlice(map, from[1])
              .reverse()
              .findIndex((t) => t),
          from[1],
        ];
        break;
      case 1:
        next_coordinates = [from[0], map[from[0]].findIndex((t) => t)];
        break;
      case 2:
        next_coordinates = [
          getVerticalSlice(map, from[1]).findIndex((t) => t),
          from[1],
        ];
        break;
      case 3:
        next_coordinates = [
          from[0],
          map[from[0]].length -
            1 -
            map[from[0]]
              .slice()
              .reverse()
              .findIndex((t) => t),
        ];
    }
    return next_coordinates;
  } else return [first_y, first_x];
}

function at2DYX(array, indexArray) {
  return array[indexArray[0]][indexArray[1]];
}

// let step_index = 0;
steps.forEach((step) => {
  for (let i = 0; i < step.steps; i++) {
    const next_tile_coordinates = findNextTile(position, step.direction);
    if (at2DYX(map, next_tile_coordinates) === "#") break;
    position = next_tile_coordinates;
  }
  // console.log(findNextTile(position, step.direction));
});
console.log(position);
console.log(
  (position[0] + 1) * 1000 +
    (position[1] + 1) * 4 +
    ((steps.at(-1).direction + 3) % 4)
);
