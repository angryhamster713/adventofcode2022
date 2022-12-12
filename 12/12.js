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

const unvisited = [];
let start_key;
let end_key;

function coordinatesToKey(y, x) {
  return y + "," + x;
}

function getNeighouringCoordinates(origin_coordinates) {
  const [y, x] = origin_coordinates.split(",").map((num) => parseInt(num));
  return [
    [y - 1, x],
    [y, x - 1],
    [y + 1, x],
    [y, x + 1],
  ]
    .filter(
      (coordinates) =>
        coordinates[0] >= 0 &&
        coordinates[0] < elevation_map.length &&
        coordinates[1] >= 0 &&
        coordinates[1] < elevation_map[0].length
    )
    .map((coordinates) => coordinatesToKey(...coordinates));
}

const grid_data = {};

const elevation_map = [];
lines.forEach((line, line_index) => {
  elevation_map.push(
    line.split("").map((square, row_index) => {
      if (square === "S") {
        start_key = coordinatesToKey(line_index, row_index);
        return 1;
      }
      if (square === "E") {
        end_key = coordinatesToKey(line_index, row_index);
        return 26;
      }
      return parseInt(square.charCodeAt(0)) - 96;
    })
  );
});

const height = elevation_map.length;
const width = elevation_map[0].length;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    unvisited.push(coordinatesToKey(y, x));
    grid_data[coordinatesToKey(y, x)] = {
      distance: Infinity,
      reached_from: undefined,
      height: elevation_map[y][x],
    };
  }
}

// For Part 2, the End point is the pathfinding origin
if (!PART_2) grid_data[start_key].distance = 0;
else grid_data[end_key].distance = 0;

let visiting_counter = 1;
const number_of_hills = height * width;
const progress = (counter) => {
  const completed = Math.floor((counter / number_of_hills) * 50);
  return (
    "[" +
    "=".repeat(completed ? completed - 1 : 0) +
    ">" +
    " ".repeat(50 - (completed || 1)) +
    "]" +
    ` ${counter}/${number_of_hills}`
  );
};

while (unvisited.length) {
  const nearest_unvisited_key = Object.entries(grid_data)
    .filter((hill) => unvisited.includes(hill[0]))
    .map((hill) => [hill[0], hill[1].distance])
    .sort((a, b) => a[1] - b[1])[0][0];
  const current_hill_data = grid_data[nearest_unvisited_key];

  console.log(progress(visiting_counter++));

  const neighbours_coordinates = getNeighouringCoordinates(
    nearest_unvisited_key
  ).filter((neighbour_coordinates) => {
    if (!PART_2)
      return (
        grid_data[neighbour_coordinates].height - current_hill_data.height <= 1
      );
    else
      return (
        current_hill_data.height - grid_data[neighbour_coordinates].height <= 1
      );
  });

  neighbours_coordinates.forEach((neighbour_coordinates) => {
    const neighbour_data = grid_data[neighbour_coordinates];

    if (current_hill_data.distance + 1 < neighbour_data.distance) {
      neighbour_data.distance = current_hill_data.distance + 1;
      neighbour_data.reached_from = nearest_unvisited_key;
    }
  });
  unvisited.splice(unvisited.indexOf(nearest_unvisited_key), 1);
}

// await fs.writeFile("output.txt", JSON.stringify(grid_data));

if (!PART_2) console.log(grid_data[end_key].distance);
else
  console.log(
    Object.entries(grid_data)
      .filter((hill) => hill[1].height === 1)
      .map((hill) => hill[1].distance)
      .sort((a, b) => a - b)[0]
  );
