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
const TEST = args[1] === "t";

const sides_map = [];
const named_sides_map = [];
const face_at = {};
const face_abstract_neighbours = {};

const side_size = TEST ? 4 : 50;
for (let row = 0; row < lines.length - 2; row += side_size) {
  const side_row = [];
  for (let cell = 0; cell < lines[row].length; cell += side_size) {
    side_row.push(lines[row][cell] !== " ");
  }
  sides_map.push(side_row);
}

const side_neighbour_sides = {
  up: ["back", "right", "front", "left"],
  front: ["up", "right", "down", "left"],
  right: ["up", "back", "down", "front"],
  left: ["up", "front", "down", "back"],
  back: ["up", "left", "down", "right"],
  down: ["front", "right", "back", "left"],
};

const opposite_sides = {
  north: "south",
  east: "west",
  south: "north",
  west: "east",
};

const direction_to_coordinate_shift = {
  north: [-1, 0],
  east: [0, 1],
  south: [1, 0],
  west: [0, -1],
};

const coordinate_shift_to_direction = {
  "-1,0": "north",
  "0,1": "east",
  "1,0": "south",
  "0,-1": "west",
};

function at2DYX(array, index_array) {
  if (!array || !array[index_array[0]]) return undefined;
  return array[index_array[0]][index_array[1]];
}
function setAt2DYX(array, indexArray, value) {
  if (!array[indexArray[0]]) array[indexArray[0]] = [];
  return (array[indexArray[0]][indexArray[1]] = value);
}
const eqCoordinates = (first, second) =>
  first[0] === second[0] && first[1] === second[1];

const noNegativesFilter = (val_arr, index, arr) =>
  val_arr[0] >= 0 && val_arr[1] >= 0;

function getCellNeighbours(node_coordinates) {
  return getCellNeighboursUnfiltered(node_coordinates).filter(
    noNegativesFilter
  );
}

// North, East, South, West
function getCellNeighboursUnfiltered(node_coordinates) {
  return [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ].map((shift) => [
    node_coordinates[0] + shift[0],
    node_coordinates[1] + shift[1],
  ]);
}

function localToGlobalCoordinates(position) {
  const { face, local_coordinates } = position;
  const face_location = face_at[face];
  return [
    face_location[0] * side_size + local_coordinates[0],
    face_location[1] * side_size + local_coordinates[1],
  ];
}

function isInbounds(local_coordinates) {
  return (
    isInRange(local_coordinates[0], 0, side_size) &&
    isInRange(local_coordinates[1], 0, side_size)
  );
}

// Inclusive -> Exclusive
function isInRange(num, min, max) {
  return num >= min && num < max;
}

function outOfBoundsToDirection(local_coordinates) {
  return coordinate_shift_to_direction[
    local_coordinates.map((num) =>
      isInRange(num, 0, side_size) ? 0 : Math.sign(num)
    )
  ];
}

function addCoordinates(first, second) {
  return [first[0] + second[0], first[1] + second[1]];
}

function toOppositeEdge(coordinates, direction) {
  const flip_index = { north: 0, east: 1, south: 0, west: 1 }[direction];
  return coordinates.map((num, num_index) => {
    if (num_index !== flip_index || isInRange(num, 1, side_size - 1)) {
      return num;
    } else
      return {
        0: side_size - 1,
        [side_size - 1]: 0,
      }[num];
  });
}

function rotateClockwise(coordinates) {
  return [coordinates[1], side_size - 1 - coordinates[0]];
}

//--------------------------------------------------

const up_side_location = [0, sides_map[0].indexOf(true)];
setAt2DYX(named_sides_map, up_side_location, "up");
setAt2DYX(
  named_sides_map,
  getCellNeighbours(up_side_location).filter((coordinates) =>
    at2DYX(sides_map, coordinates)
  )[0],
  "front"
);

const queue = [];
const visited = [];
queue.push(up_side_location);
setAt2DYX(visited, up_side_location, true);

while (queue.length) {
  const node = queue.shift();
  const face = at2DYX(named_sides_map, node);
  face_at[face] = node;

  const neighbour_sides = getCellNeighbours(node).filter((coordinates) =>
    at2DYX(sides_map, coordinates)
  );
  //-------------------------
  const unvisited_neigbours = neighbour_sides.filter(
    (candidate) => !at2DYX(visited, candidate)
  );
  queue.push(...unvisited_neigbours);
  unvisited_neigbours.forEach((neighbour) =>
    setAt2DYX(visited, neighbour, true)
  );
  //-------------------------
  // A reference neighbour with its face assigned.
  const named_neighbour = neighbour_sides
    .map((coordinates) => [coordinates, at2DYX(named_sides_map, coordinates)])
    .find((entry) => entry[1]);

  const abstract_neighbour_sides = getCellNeighboursUnfiltered(node).map(
    (value, index) => ({
      coordinates: value,
      direction: ["north", "east", "south", "west"][index],
    })
  );
  // Align so that the known-named neighbour's side is first
  for (
    ;
    !eqCoordinates(abstract_neighbour_sides[0].coordinates, named_neighbour[0]);
    abstract_neighbour_sides.unshift(abstract_neighbour_sides.pop())
  )
    null;

  const face_neighbour_sides = side_neighbour_sides[face];
  // Align so that the known-named neighbour's face is first
  for (
    ;
    face_neighbour_sides[0] !== named_neighbour[1];
    face_neighbour_sides.unshift(face_neighbour_sides.pop())
  )
    null;

  // Combine the aligned arrays
  const abstract_neighbours = abstract_neighbour_sides.map((val, index) => ({
    ...val,
    face: face_neighbour_sides[index],
  }));

  // Update the global variable
  face_abstract_neighbours[face] = abstract_neighbours;

  const real_neighbours = abstract_neighbours.filter((neighbour_entry) =>
    at2DYX(sides_map, neighbour_entry.coordinates)
  );

  // Name the real neighbours their face
  real_neighbours.forEach((entry) =>
    setAt2DYX(named_sides_map, entry.coordinates, entry.face)
  );
}

let direction_index = 1;
const directions = ["north", "east", "south", "west"];
const getDirection = () => directions[direction_index];
const rotateRight = () => (direction_index = (direction_index + 1) % 4);
const rotateLeft = () => (direction_index = (direction_index - 1 + 4) % 4);

const starting_face = named_sides_map[0].find((v) => v);
let position = { face: starting_face, local_coordinates: [0, 0] };

// ! Make sure there is no empty line at the end of the input
const steps_line = lines.at(-1);
const steps = [];
(steps_line + "E").split("").reduce((acc, curr) => {
  if (isNaN(curr)) {
    steps.push(acc, curr);
    return "";
  }
  return (acc += curr);
});
steps.splice(-1, 1); // Remove the E
// console.log(steps);

for (const step of steps) {
  if (isNaN(step)) {
    if (step === "R") rotateRight();
    else rotateLeft();
    continue;
  }
  for (let step_counter = 0; step_counter < step; step_counter++) {
    const direction = getDirection();
    const [next_cell_position, rotation] = getNextCell(position, direction);
    if (at2DYX(lines, localToGlobalCoordinates(next_cell_position)) === "#")
      continue;
    else {
      position = next_cell_position;
      for (let i = 0; i < rotation; i++) rotateRight();
    }
  }
}

function getNextCell(position, direction) {
  const next_cell_local = addCoordinates(
    direction_to_coordinate_shift[direction],
    position.local_coordinates
  );
  if (!isInbounds(next_cell_local)) {
    const target_neighbour = face_abstract_neighbours[position.face].find(
      (entry) => entry.direction === outOfBoundsToDirection(next_cell_local)
    );
    /*     
      opposite_sides[target_neighbour.direction] would be the arrival position
      in Part 1. 
      Instead it should be self_from_neighbour.direction,
      so figure out the rotation
    */
    const self_from_neighbour = face_abstract_neighbours[
      target_neighbour.face
    ].find((entry) => entry.face === position.face);

    // Only for rotation purposes.
    let test_directions = ["north", "east", "south", "west"];
    for (
      ;
      test_directions[0] !== opposite_sides[target_neighbour.direction];
      test_directions.push(test_directions.shift())
    )
      null;

    let rotation_counter = 0;
    for (
      ;
      test_directions[0] !== self_from_neighbour.direction;
      test_directions.push(test_directions.shift())
    )
      rotation_counter++;

    let target_coordinates = toOppositeEdge(
      position.local_coordinates,
      target_neighbour.direction
    );
    for (let i = 0; i < rotation_counter; i++)
      target_coordinates = rotateClockwise(target_coordinates);

    return [
      { face: target_neighbour.face, local_coordinates: target_coordinates },
      rotation_counter,
    ];
  } else {
    return [{ face: position.face, local_coordinates: next_cell_local }, 0];
  }
}

const final_nice_position = localToGlobalCoordinates(position).map(
  (num) => num + 1
);
const final_direction_value = {
  north: 3,
  east: 0,
  south: 1,
  west: 2,
}[getDirection()];
console.log(
  final_nice_position[0] * 1000 +
    final_nice_position[1] * 4 +
    final_direction_value
);
