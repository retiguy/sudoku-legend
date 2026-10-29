const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(__dirname+'/../js/sudoku.js','utf8');
const context=vm.createContext({Math,JSON,Set,Array});vm.runInContext(code+';globalThis.Sudoku=Sudoku;',context);
const {Sudoku}=context;
function choices(g,r,c){const used=new Set([...g[r],...g.map(row=>row[c])]);for(let y=Math.floor(r/3)*3;y<Math.floor(r/3)*3+3;y++)for(let x=Math.floor(c/3)*3;x<Math.floor(c/3)*3+3;x++)used.add(g[y][x]);return [1,2,3,4,5,6,7,8,9].filter(n=>!used.has(n))}
function count(g,limit=2){let best,opts;for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!g[r][c]){let o=choices(g,r,c);if(!o.length)return 0;if(!opts||o.length<opts.length){best=[r,c];opts=o}}if(!best)return 1;let n=0;for(const v of opts){g[best[0]][best[1]]=v;n+=count(g,limit-n);g[best[0]][best[1]]=0;if(n>=limit)break}return n}
for(const diff of ['easy','medium','hard','expert'])for(let seed=1;seed<=5;seed++){const {puzzle,solution}=Sudoku.generate(diff,seed);assert.equal(count(puzzle.map(r=>[...r])),1,`${diff} seed ${seed} uniqueness`);for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(puzzle[r][c])assert.equal(puzzle[r][c],solution[r][c]);}
console.log('PASS: 20 generated puzzles have exactly one solution.');
