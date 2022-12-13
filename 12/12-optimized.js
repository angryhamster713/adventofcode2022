//
// For part 2, pass "2" as the second command line argument; see PART_2 variable
//

// ! Coordinates are defined as [y, x], not [x, y], due to better array compatibility.

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

const height_map = [];
const visited = [];
const prev = [];
let start_point;
let end_point;
let part2_point;

function at2D(array, indexArray) {
  return array[indexArray[0]][indexArray[1]];
}
function setAt2D(array, indexArray, value) {
  return (array[indexArray[0]][indexArray[1]] = value);
}

function coordinatesEq(coordinates1, coordinates2) {
  return (
    coordinates1[0] === coordinates2[0] && coordinates1[1] === coordinates2[1]
  );
}
function canReach(current_hill, neighbour) {
  return (
    (PART_2 ? -1 : 1) *
      (at2D(height_map, neighbour) - at2D(height_map, current_hill)) <=
    1
  );
}

function getNeighbouringCoordinates(coordinates) {
  const [y, x] = coordinates;
  return [
    [y - 1, x],
    [y + 1, x],
    [y, x - 1],
    [y, x + 1],
  ].filter(
    (neighbour_coordinates) =>
      neighbour_coordinates[0] >= 0 &&
      neighbour_coordinates[0] < height &&
      neighbour_coordinates[1] >= 0 &&
      neighbour_coordinates[1] < width
  );
}

lines.forEach((line, line_index) => {
  const height_row = [];
  const prev_row = [];
  const visited_row = [];
  line.split("").forEach((hill, row_index) => {
    prev_row.push(undefined);
    visited_row.push(false);
    if (hill === "S") {
      start_point = [line_index, row_index];
      height_row.push(1);
    } else if (hill === "E") {
      end_point = [line_index, row_index];
      height_row.push(26);
    } else {
      height_row.push(parseInt(hill.charCodeAt(0)) - 96);
    }
  });
  height_map.push(height_row);
  prev.push(prev_row);
  visited.push(visited_row);
});
const height = height_map.length;
const width = height_map[0].length;

const queue = [];
if (!PART_2) {
  queue.push(start_point);
  setAt2D(visited, start_point, true);
} else {
  queue.push(end_point);
  setAt2D(visited, end_point, true);
}

while (queue.length) {
  const current_hill = queue.shift();
  const neighbours = getNeighbouringCoordinates(current_hill).filter(
    (neighbour) => canReach(current_hill, neighbour)
  );

  if (
    neighbours.some((neighbour) => {
      if (!at2D(visited, neighbour)) {
        queue.push(neighbour);
        setAt2D(visited, neighbour, true);
        setAt2D(prev, neighbour, current_hill);
        if (!PART_2 && coordinatesEq(neighbour, end_point)) return true;
        if (PART_2 && at2D(height_map, neighbour) === 1) {
          part2_point = neighbour;
          return true;
        }
        return false;
      }
    })
  )
    break;
}

// Computed paths include starting point, the result shouldn't
let steps = -1;
for (let hill = PART_2 ? part2_point : end_point; hill; hill = at2D(prev, hill))
  steps++;

console.log(steps);
