const { readdirSync, copyFileSync, existsSync, mkdirSync, lstatSync, readFileSync, writeFileSync, writeFile } = require('node:fs')
const nodePath = require('node:path')

const isDir = path => lstatSync(path).isDirectory()

const getArg = (key, def) => {
    const el = process.argv.find(x => x === key)
    if (!el) return def

    const val = process.argv[process.argv.indexOf(el) + 1] ?? def
    return val
}

const input = getArg('--input', "src")
const output = getArg('--output', 'out')

const clarify = (path) => path.replace(input, output)

let volatile = 0;
let desctructed = 0;

const move = (path) => {
    if (path.endsWith('.ts')) return
    copyFileSync(path, clarify(path))

    volatile++
}

const recurs = (path) => {
    if (existsSync(path) && isDir(path)) {
        if (!existsSync(clarify(path))) mkdirSync(clarify(path))
        readdirSync(path).forEach(el => {
            recurs(path + '/' + el)
        })
    } else {
        move(path)
    }
}
const remove = (path) => {
    if (existsSync(path) && isDir(path)) {
        if (isDir(path)) readdirSync(path).forEach((el) => {
            remove(path + '/' + el)
        })
    } else if (path.endsWith('.js')) {
        const content = readFileSync(path).toString().split('\n').filter(x => !x.includes('Object.defineProperty(exports, "__esModule", { value: true });') && !x.includes('import *'))
        const findImports = content.filter(x => x.includes('require(') ).map(x => ([x, x.split(' ')[1]]))

        let final = content.filter(x => !findImports.some(y => y[0] === x)).join('\n')
        for (const [imp, constant] of final) {
            if (constant === "PIXI") continue
            const regex = new RegExp(`\\(\\d+\\, ${constant}\\.([a-zA-Z]{1,255})\\)`, 'g')
            final = final.replace(regex, '$1')
    
            const secondRegex = new RegExp(`${constant}\\.([a-zA-Z]{1,255})`, 'g')
            final = final.replace(secondRegex, '$1')
        }

        writeFileSync(path, final)

        desctructed++;
    }
}
const run = (path) => {
    recurs(path)
    remove(`./${output}/scripts`)

    console.log(`Compiled \x1b[33m${volatile}\x1b[0m files and modified \x1b[33m${desctructed}\x1b[0m existing files`)
    volatile = 0
    desctructed = 0
}

if (!isDir(input)) {
    throw new Error(`${input} is not a directory`)
}
if (!existsSync(output)) mkdirSync(output)
if (input === output) {
    throw new Error("Cannot compile into source")
}

run(input)