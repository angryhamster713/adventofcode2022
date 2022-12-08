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

const height = lines.length;
const width = lines[0].length;

const tree_grid = [];
lines.forEach((line) => {
  tree_grid.push(line.split("").map((tree) => parseInt(tree)));
});

//-------------------------

const isAtEdge = (row, col) =>
  row === 0 || row === height - 1 || col === 0 || col === width - 1;

// -1 is not visible
// other values are trees' scenic scores
const score_grid = [];
for (let i = 0; i < height; i++) {
  const row = [];
  for (let j = 0; j < width; j++) {
    row.push(isAtEdge(i, j) ? 0 : -1);
  }
  score_grid.push(row);
}

//-------------------------

const max = (max, current) => (current > max ? current : max);

function countSeenTrees(my_tree, view) {
  let seenTrees = 0;
  for (const other_tree of view) {
    seenTrees++;
    if (other_tree >= my_tree) break;
  }

  return seenTrees;
}

// These loops omit the edge trees, as they are visible with a score of 0
for (let row_index = 1; row_index < height - 1; row_index++) {
  for (let col_index = 1; col_index < width - 1; col_index++) {
    const tree = tree_grid[row_index][col_index];
    const horizontal_line = tree_grid[row_index];
    const vertical_line = tree_grid.map((line) => line[col_index]);

    const left = horizontal_line.slice(0, col_index).reverse();
    const right = horizontal_line.slice(col_index + 1);
    const up = vertical_line.slice(0, row_index).reverse();
    const down = vertical_line.slice(row_index + 1);
    if (
      tree > left.reduce(max) ||
      tree > right.reduce(max) ||
      tree > up.reduce(max) ||
      tree > down.reduce(max)
    ) {
      score_grid[row_index][col_index] = [left, right, up, down]
        .map((view) => countSeenTrees(tree, view))
        .reduce((collector, current) => collector * current, 1);
    }
  }
}

const sum = (collector, current) => collector + current;

console.log(
  score_grid
    .map((line) => line.map((tree) => tree >= 0).reduce(sum, 0))
    .reduce(sum, 0)
);

console.log(score_grid.flat().reduce(max));
