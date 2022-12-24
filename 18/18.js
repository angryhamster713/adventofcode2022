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
const lines = input_file.split("\n").filter((l) => l !== "");

//--------------------------------------------------

const cubes = [];
// const cubes_3d = []

lines.forEach((line) => {
  cubes.push(line.split(",").map((num) => parseInt(num)));
});
// const [[min_x, max_x], [min_y, max_y], [min_z, max_z]]
const bounds = [0, 1, 2].map((index) => [
  Math.min(...cubes.map((cube) => cube[index])),
  Math.max(...cubes.map((cube) => cube[index])),
]);
function outOfBounds(cube) {
  return bounds.some(
    ([min, max], index) => cube[index] < min || cube[index] > max
  );
}

function eq3D(first, second) {
  return (
    first[0] === second[0] && first[1] === second[1] && first[2] === second[2]
  );
}

let total = 0;

const air_pocket_candidates = [];

cubes.forEach((cube) => {
  const adjacent = [
    [-1, 0, 0],
    [1, 0, 0],
    [0, -1, 0],
    [0, 1, 0],
    [0, 0, -1],
    [0, 0, 1],
  ].map((side) => [cube[0] + side[0], cube[1] + side[1], cube[2] + side[2]]);
  const air_around = adjacent.filter(
    (neighbour) => cubes.findIndex((cube) => eq3D(cube, neighbour)) === -1
  );
  air_around.forEach((air) =>
    air_pocket_candidates.findIndex((candidate) => eq3D(candidate, air)) === -1
      ? air_pocket_candidates.push(air)
      : null
  );
  total += air_around.length;
});
console.log(total);

//--------------------------------------------------

const air_pockets = [];
const air_outside = [];

air_pocket_candidates.forEach((candidate) => {
  // If air already marked as pocket
  if (
    air_pockets.findIndex((pocket_candidate) =>
      eq3D(pocket_candidate, candidate)
    ) !== -1
  )
    return;
  const visited = [];
  const queue = [];
  queue.push(candidate);
  let is_pocket = true;

  while (queue.length) {
    const node = queue.shift();
    if (
      outOfBounds(node) ||
      air_outside.findIndex((outside_candidate) =>
        eq3D(outside_candidate, node)
      ) !== -1
    ) {
      is_pocket = false;
      break;
    }
    visited.push(node);

    const air_neighbours = [
      [-1, 0, 0],
      [1, 0, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 0, -1],
      [0, 0, 1],
    ]
      .map((side) => [node[0] + side[0], node[1] + side[1], node[2] + side[2]])
      .filter(
        (neighbour) =>
          visited.findIndex((visited_candidate) =>
            eq3D(visited_candidate, neighbour)
          ) === -1
      )
      .filter(
        (neighbour) =>
          cubes.findIndex((lava_candidate) =>
            eq3D(lava_candidate, neighbour)
          ) === -1
      );
    // if (air_neighbours.length) queue.push(..air_neighbours);
    if (air_neighbours.length) queue.push(air_neighbours[0]);
  }
  if (is_pocket) air_pockets.push(...visited);
  else air_outside.push(...visited);
});

// console.log(air_pockets);

cubes.push(...air_pockets);
let total2 = 0;

cubes.forEach((cube) => {
  const adjacent = [
    [-1, 0, 0],
    [1, 0, 0],
    [0, -1, 0],
    [0, 1, 0],
    [0, 0, -1],
    [0, 0, 1],
  ].map((side) => [cube[0] + side[0], cube[1] + side[1], cube[2] + side[2]]);
  const air_around = adjacent.filter(
    (neighbour) => cubes.findIndex((cube) => eq3D(cube, neighbour)) === -1
  );
  total2 += air_around.length;
});

console.log(total2);
