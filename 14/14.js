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

const columns = [];

// Inclusive -> Inclusive
function range(start, end) {
  const [left, right] = start < end ? [start, end] : [end, start];
  return new Array(right - left + 1).fill(undefined).map((_, i) => i + left);
}

function pointsInBetween(point1, point2) {
  if (point1[0] === point2[0]) {
    return range(point1[1], point2[1]).map((num) => [point1[0], num]);
  } else {
    return range(point1[0], point2[0]).map((num) => [num, point1[1]]);
  }
}

lines.forEach((line) => {
  const path_points = line
    .split(" -> ")
    .map((point) => point.split(",").map((coordinate) => parseInt(coordinate)));
  for (let i = 0; i < path_points.length - 1; i++) {
    pointsInBetween(path_points[i], path_points[i + 1]).forEach((point) => {
      if (!columns[point[0]]) columns[point[0]] = [];
      columns[point[0]][point[1]] = true;
    });
  }
});

const max_rock_depth_index =
  columns
    .map((column) => column.length)
    .reduce(
      (collector, current) => (current > collector ? current : collector),
      0
    ) - 1;

function at2D(array, indexArray) {
  if (!array || !array[indexArray[0]]) return undefined;
  return array[indexArray[0]][indexArray[1]];
}
function setAt2D(array, indexArray, value) {
  if (!array[indexArray[0]]) array[indexArray[0]] = [];
  return (array[indexArray[0]][indexArray[1]] = value);
}

function getObjectAt(array, indexArray) {
  if (indexArray[1] === max_rock_depth_index + 2) return true;
  return at2D(array, indexArray);
}

let sand_position = [500, 0];
let settled_counter = 0;
while (true) {
  if (!PART_2 && sand_position[1] > max_rock_depth_index) break;
  if (PART_2 && getObjectAt(columns, [500, 0])) break;

  const [x, y] = sand_position;

  if (!getObjectAt(columns, [x, y + 1])) sand_position = [x, y + 1];
  else if (!getObjectAt(columns, [x - 1, y + 1]))
    sand_position = [x - 1, y + 1];
  else if (!getObjectAt(columns, [x + 1, y + 1]))
    sand_position = [x + 1, y + 1];
  else {
    setAt2D(columns, sand_position, true);
    settled_counter++;
    sand_position = [500, 0];
  }
}
console.log(settled_counter);
