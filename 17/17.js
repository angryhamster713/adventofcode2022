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
const PART_2 = args[1] === "2";

const cycle_hashes = [];
const heights = [];
let found_a_match_yet = false;
let skipped_height = 0;

const jet_pattern = lines[0].split("");
let jet_index = -1;
function next_jet() {
  jet_index = (jet_index + 1) % jet_pattern.length;
  return jet_pattern[jet_index];
}

const shapes = [
  [[true, true, true, true]],
  [
    [false, true, false],
    [true, true, true],
    [false, true, false],
  ],
  [
    [false, false, true],
    [false, false, true],
    [true, true, true],
  ],
  [[true], [true], [true], [true]],
  [
    [true, true],
    [true, true],
  ],
];

// Relative to bottom left of the shape
const bottom_hitboxes = [
  [
    [0, -1],
    [1, -1],
    [2, -1],
    [3, -1],
  ],
  [
    [0, 0],
    [1, -1],
    [2, 0],
  ],
  [
    [0, -1],
    [1, -1],
    [2, -1],
  ],
  [[0, -1]],
  [
    [0, -1],
    [1, -1],
  ],
];
const right_hitboxes = [
  [[4, 0]],
  [
    [2, 2],
    [3, 1],
    [2, 0],
  ],
  [
    [3, 2],
    [3, 1],
    [3, 0],
  ],
  [
    [1, 3],
    [1, 2],
    [1, 1],
    [1, 0],
  ],
  [
    [2, 1],
    [2, 0],
  ],
];

const left_hitboxes = [
  [[-1, 0]],
  [
    [0, 2],
    [-1, 1],
    [0, 0],
  ],
  [
    [1, 2],
    [1, 1],
    [-1, 0],
  ],
  [
    [-1, 3],
    [-1, 2],
    [-1, 1],
    [-1, 0],
  ],
  [
    [-1, 1],
    [-1, 0],
  ],
];

// X, Y
function at2D(array, indexArray) {
  if (!array || !array[indexArray[1]]) return undefined;
  return array[indexArray[1]][indexArray[0]];
}
function setAt2D(array, indexArray, value) {
  if (!array[indexArray[1]]) array[indexArray[1]] = [];
  return (array[indexArray[1]][indexArray[0]] = value);
}

let tube = [[true, true, true, true, true, true, true]];

function fillShape(shape_index, shape_position, variable) {
  const shape = shapes[shape_index];
  shape.forEach((shape_row, row_index) => {
    shape_row.forEach((cell, cell_index) => {
      const cell_position = [
        shape_position[0] + cell_index,
        shape_position[1] - row_index + shape.length - 1,
      ];
      setAt2D(variable, cell_position, cell || at2D(variable, cell_position));
    });
  });
}

function localizeHitbox(shape_position, hitbox) {
  return [
    parseInt(shape_position[0]) + parseInt(hitbox[0]),
    parseInt(shape_position[1]) + parseInt(hitbox[1]),
  ];
}

const number_of_rocks = PART_2 ? 1000000000000 : 2022;
for (let i = 0; i < number_of_rocks; i++) {
  const shape_index = i % shapes.length;
  const shape = shapes[shape_index];
  const highest_rock = tube.length - 1;
  const shape_position = [2, highest_rock + 4];
  while (true) {
    const direction = next_jet();

    if (direction === "<" && shape_position[0] !== 0) {
      if (
        !left_hitboxes[shape_index]
          .map((hitbox) => localizeHitbox(shape_position, hitbox))
          .some((hitbox) => at2D(tube, hitbox))
      )
        shape_position[0]--;
    } else if (direction === ">" && shape_position[0] !== 7 - shape[0].length) {
      if (
        !right_hitboxes[shape_index]
          .map((hitbox) => localizeHitbox(shape_position, hitbox))
          .some((hitbox) => at2D(tube, hitbox))
      )
        shape_position[0]++;
    }

    if (
      bottom_hitboxes[shape_index]
        .map((hitbox) => localizeHitbox(shape_position, hitbox))
        .some((hitbox) => at2D(tube, hitbox))
    ) {
      fillShape(shape_index, shape_position, tube);
      break;
    } else shape_position[1]--;
  }

  const depth_map = [];
  for (let i = 0; i < 7; i++) {
    let depth = 0;
    for (let j = tube.length - 1; true; j--) {
      if (tube[j][i]) break;
      else depth++;
    }
    depth_map[i] = depth;
  }

  if (!found_a_match_yet) {
    const cycle_hash = JSON.stringify([depth_map, shape_index, jet_index]);
    heights[i] = tube.length - 1;
    const match_index = cycle_hashes.findIndex((hash) => hash === cycle_hash);
    if (match_index !== -1) {
      // console.log("That's a match!", i, match_index);
      const offset_height = heights[match_index];
      const offset_length = match_index;

      const cycle_length = i - offset_length;
      const cycle_height = tube.length - 1 - offset_height;

      const cycles_to_skip = Math.floor(
        (number_of_rocks - offset_length - cycle_length) / cycle_length
      );
      const iterations_to_skip = cycles_to_skip * cycle_length;
      const height_to_skip = cycles_to_skip * cycle_height;

      skipped_height = height_to_skip;
      i += iterations_to_skip;

      found_a_match_yet = true;
    } else cycle_hashes.push(cycle_hash);
  }
}

console.log(skipped_height + tube.length - 1);

function draw_tube(shape_position, direction, shape_index) {
  if (!shape_position) shape_position = [0, 0];
  const tube_copy = JSON.parse(JSON.stringify(tube));
  if (shape_index != null) fillShape(shape_index, shape_position, tube_copy);
  // setAt2D(reversed_drawn_tube, shape_position, "o");
  // console.log(reversed_drawn_tube);
  console.log(direction);
  Array.from(tube_copy, (row) => (row ? row : []))
    .reverse()
    .forEach((row) => {
      console.log(Array.from(row, (cell) => (cell ? "#" : ".")).join(""));
    });
  console.log();
}
