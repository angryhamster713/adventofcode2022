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

const map = [];

lines.forEach((line) => {
  map.push(line.split(""));
});

function gcd(a, b) {
  if (!b) {
    return a;
  }
  return gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

const cycle_length = lcm(map.length - 2, map[0].length - 2);
const height = map.length;
const width = map[0].length;

function shiftBlizzards(n) {
  const new_map = [];
  for (; new_map.length < map.length; new_map.push([])) null;
  for (let i = 0; i < height; i++)
    [new_map[i][0], new_map[i][width - 1]] = ["#", "#"];
  for (let i = 0; i < width; i++)
    [new_map[0][i], new_map[height - 1][i]] = ["#", "#"];
  new_map[0][1] = ".";
  new_map[height - 1][width - 2] = ".";
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const cell = map[y][x];
      let new_x;
      let new_y;
      const inner_width = width - 2;
      const inner_height = height - 2;
      switch (cell) {
        case ">":
          new_x = ((x - 1 + n) % inner_width) + 1;
          new_map[y][new_x] = "B";
          break;
        case "<":
          new_x = ((x - 1 - n + 99 * inner_width) % inner_width) + 1;
          new_map[y][new_x] = "B";
          break;
        case "v":
          new_y = ((y - 1 + n) % inner_height) + 1;
          new_map[new_y][x] = "B";
          break;
        case "^":
          new_y = ((y - 1 - n + 99 * inner_height) % inner_height) + 1;
          new_map[new_y][x] = "B";
          break;
      }
    }
  }
  return new_map;
}
const blizzards = [];
function shiftBlizzardsMemoize(n) {
  if (blizzards[n]) return blizzards[n];
  return (blizzards[n] = shiftBlizzards(n));
}

function eq2D(first, second) {
  return first[0] === second[0] && first[1] === second[1];
}
function at2DYX(array, index_array) {
  if (!array || !array[index_array[0]]) return undefined;
  return array[index_array[0]][index_array[1]];
}

const inboundsFilter = (val, index, arr) =>
  val[0] >= 0 && val[0] < height && val[1] >= 0 && val[1] < width;
function isObstacle(val) {
  return val === "#" || val === "B";
}
function visit(visited_arr, node) {
  const cycle = node.cycle_count;
  if (!visited_arr[cycle]) visited_arr[cycle] = [];
  if (!visited_arr[cycle][node.at[0]]) visited_arr[cycle][node.at[0]] = [];
  visited_arr[cycle][node.at[0]][node.at[1]] = true;
}

function findPathLength(initial_node, target_cell) {
  const queue = [];
  const visited = [];
  queue.push(initial_node);
  visit(visited, initial_node);
  let answer;

  while (queue.length) {
    const node = queue.shift();
    if (eq2D(node.at, target_cell)) {
      answer = node.total_cycles;
      break;
    }

    const next_cycle = (node.cycle_count + 1) % cycle_length;
    const next_map = shiftBlizzardsMemoize(next_cycle);
    const neighbours = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, -1],
    ]
      .map((cell) => [node.at[0] + cell[0], node.at[1] + cell[1]])
      .filter(inboundsFilter)
      .filter((cell) => !isObstacle(at2DYX(next_map, cell)))
      .filter((cell) => !at2DYX(visited[next_cycle], cell))
      .map((cell) => {
        return {
          at: cell,
          cycle_count: next_cycle,
          total_cycles: node.total_cycles + 1,
        };
      });

    queue.push(...neighbours);
    neighbours.forEach((neighbour) => visit(visited, neighbour));
  }
  return answer;
}

const start_coordinates = [0, 1];
const end_coordinates = [height - 1, width - 2];
const first_length = findPathLength(
  { at: start_coordinates, cycle_count: 0, total_cycles: 0 },
  end_coordinates
);
console.log(first_length);

const second_length = findPathLength(
  {
    at: end_coordinates,
    cycle_count: first_length % cycle_length,
    total_cycles: first_length,
  },
  start_coordinates
);
const third_length = findPathLength(
  {
    at: start_coordinates,
    cycle_count: second_length % cycle_length,
    total_cycles: second_length,
  },
  end_coordinates
);
console.log(third_length);
