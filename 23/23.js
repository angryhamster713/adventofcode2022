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
const lines = input_file.split("\n");

//--------------------------------------------------
const PART_2 = args[1] === "2";

const directions = ["north", "south", "west", "east"];

function shiftDirections() {
  directions.push(directions.shift());
}

// X, Y coordinates
// X increments right, Y increments down
const elves = [];

lines.forEach((line, line_index) => {
  line.split("").forEach((cell, cell_index) => {
    if (cell === "#") elves.push([cell_index, line_index]);
  });
});

function isElfAtXY(coordinates) {
  return (
    elves.findIndex(
      (elf) => elf[0] === coordinates[0] && elf[1] === coordinates[1]
    ) !== -1
  );
}
function XYToString([x, y]) {
  return `${x},${y}`;
}

function coordinatesEq(coordinates1, coordinates2) {
  return (
    coordinates1[0] === coordinates2[0] && coordinates1[1] === coordinates2[1]
  );
}
function findDuplicateCoordinates(array) {
  const str_duplicates = [];
  array.forEach((coordinates, index) => {
    if (!coordinates) console.log("A false slipped through!");
    if (
      array.findIndex((coords) => coordinatesEq(coords, coordinates)) !==
        index &&
      !str_duplicates.includes(XYToString(coordinates))
    )
      str_duplicates.push(XYToString(coordinates));
  });
  return str_duplicates;
}

const number_of_rounds = PART_2 ? 99999 : 10;
for (let i = 1; i <= number_of_rounds; i++) {
  const proposed_moves = {};
  elves.forEach((elf) => {
    const adjacent = Object.fromEntries(
      Object.entries({
        nw: [-1, -1],
        n: [0, -1],
        ne: [1, -1],
        e: [1, 0],
        se: [1, 1],
        s: [0, 1],
        sw: [-1, 1],
        w: [-1, 0],
      }).map((adj_tile) => [
        adj_tile[0],
        [elf[0] + adj_tile[1][0], elf[1] + adj_tile[1][1]],
      ])
    );

    // If no adjacent elf
    if (!Object.values(adjacent).some((tile) => isElfAtXY(tile)))
      return (proposed_moves[XYToString(elf)] = false);

    const { nw, n, ne, e, se, s, sw, w } = adjacent;
    const direction_checks = {
      north: [n, ne, nw],
      south: [s, se, sw],
      west: [w, nw, sw],
      east: [e, ne, se],
    };
    const direction_destinations = {
      north: n,
      south: s,
      west: w,
      east: e,
    };
    let found_a_way = false;
    for (const direction of directions) {
      if (!direction_checks[direction].some((tile) => isElfAtXY(tile))) {
        proposed_moves[XYToString(elf)] = direction_destinations[direction];
        found_a_way = true;
        break;
      }
    }
    if (!found_a_way) proposed_moves[XYToString(elf)] = false;
  });

  //-------------------------

  let false_counter = 0;
  Object.values(proposed_moves).forEach((destination) =>
    !destination ? false_counter++ : null
  );
  console.log(
    `Round ${i}: ${false_counter}/${elves.length}; ${(
      (false_counter / elves.length) *
      100
    ).toFixed(2)}%`
  );
  if (false_counter === elves.length) {
    console.log("Finished at", i);
    break;
  }

  //-------------------------

  const duplicates_str = findDuplicateCoordinates(
    Object.values(proposed_moves).filter((c) => c)
  );
  Object.entries(proposed_moves)
    .filter((move) => move[1])
    .forEach((move) => {
      if (duplicates_str.includes(XYToString(move[1])))
        proposed_moves[move[0]] = false;
    });

  Object.entries(proposed_moves).forEach((move) => {
    const from = move[0].split(",").map((num) => parseInt(num));
    const to = move[1];
    const elf_index = elves.findIndex((elf) => coordinatesEq(elf, from));
    if (to) elves[elf_index] = to;
  });

  shiftDirections();
}

const rectangle = getRectangle(elves);
// console.log(rectangle.map((row) => row.join("")).join("\n"));
console.log(rectangle.length * rectangle[0].length - elves.length);

function getRectangle(elf_array) {
  const min_x = Math.min(...elf_array.map((elf) => elf[0]));
  const min_y = Math.min(...elf_array.map((elf) => elf[1]));
  const x_increment = min_x < 0 ? -min_x : 0;
  const y_increment = min_y < 0 ? -min_y : 0;
  elf_array = elf_array.map((elf) => [
    elf[0] + x_increment,
    elf[1] + y_increment,
  ]);
  const max_x = Math.max(...elf_array.map((elf) => elf[0]));
  const max_y = Math.max(...elf_array.map((elf) => elf[1]));
  const rectangle = [];
  for (let y = 0; y <= max_y; y++) {
    const row = [];
    for (let x = 0; x <= max_x; x++) {
      row.push(
        elf_array.findIndex((elf) => coordinatesEq([x, y], elf)) !== -1
          ? "#"
          : "."
      );
    }
    rectangle.push(row);
  }
  return rectangle;
}
