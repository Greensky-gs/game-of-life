import * as PIXI from "pixi.js";

const cellSize = 12;
const marginSize = 1.1

let mouseClicked = false
let computing = false

class GameCell  {
	public readonly n: number;
	public readonly m: number;
	public color: number;
	private _graphic: PIXI.Graphics;
	
	constructor(n: number, m: number, color: "black" | "white") {
		this._graphic = new PIXI.Graphics()
		
		this.n = n
		this.m = m
		this.color = color === "black" ? 0x000000 : 0xFFFFFF;
		this._graphic.interactive = true
		this._graphic.width = cellSize
		this._graphic.height = cellSize
		this._graphic.eventMode = "dynamic"
		
		this.setSystem()
	}
	
	private setSystem() {
		let over = false
		let clickable = true
		
		this._graphic.on("pointerdown", () => {
			this.onclick()
			
			mouseClicked = true
		})
		
		this._graphic.on("pointerover", () => {
			over = true
			if (mouseClicked && clickable) {
				this.onclick()
				
				clickable = false
			}
		})
		this._graphic.on("pointerout", () => {
			over = false
		})
		this._graphic.on("pointerup", () => {
			mouseClicked = false
			clickable = true
		})
	}
	
	private onclick() {
		if (computing) return
		this.toggleState()
		this.draw()
	}
	
	public get graphic() {
		return this._graphic
	}
	static X(m: number) {
		return 1.1 + (m * marginSize * cellSize)
	}
	static Y(n: number) {
		return 1.1 + (n * marginSize * cellSize)
	}
	public draw() {
		this._graphic.rect(GameCell.X(this.m), GameCell.Y(this.n), cellSize, cellSize)
		this._graphic.fill(this.color)
		
		return this._graphic
	}
	public get state() {
		return this.color === 0x000000 ? 0 : 1
	}
	public toggleState() {
		this.color = this.color === 0x000000 ? 0xFFFFFF : 0x000000
	}
	public setState(state: 0 | 1) {
		this.color = state === 0 ? 0x000000 : 0xFFFFFF
		return this
	}
};


const waitSpeed = () => 1000 / parseInt((document.getElementById("speed") as HTMLInputElement).getAttribute("value"));

(async() => {
	const app = new PIXI.Application()
	
	await app.init({ background: "#808080", resizeTo: window })
	
	const rows = Math.floor(app.screen.height / cellSize)
	const cols = Math.floor(app.screen.width / cellSize)
	
	let list: GameCell[][] = new Array(rows).fill(0).map((_, n) => new Array(cols).fill(0).map((_, m) => new GameCell(n, m, "black")))
	
	const startComputation = () => {
		if (!computing) return
		
		const aliveNeighbours = (n: number, m: number) => {
			let count = 0
			
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i === 0 && j === 0) continue
					
					const ni = n + i
					const mj = m + j
					
					if (ni < 0 || mj < 0 || ni >= rows || mj >= cols) continue
					
					count += list[ni][mj].state
				}
			}
			
			return count
		}
		
		const nextGeneration = () => {
			const newList = new Array(rows).fill(0).map((_, n) => new Array(cols).fill(0).map((_, m) => {
				const cell = list[n][m]
				return new GameCell(n, m, cell.state === 1 ? "white" : "black")
			}))
			
			list.forEach((row, n) => {
				row.forEach((cell, m) => {
					const count = aliveNeighbours(n, m)
					if (count === 0 && cell.state === 0) return
					
					if (cell.state === 0 && count === 3) {
						newList[n][m].setState(1)
					}
					if (cell.state === 1 && count != 2 && count != 3) {
						newList[n][m].setState(0)
					}
				})
			})
			
			return newList
		}
		
		list = nextGeneration()
		
		renderCells(list)
		
		setTimeout(() => {
			startComputation()
		}, waitSpeed())
	}
	
	const renderCells = (cellList: GameCell[][]) => {
		if (app.stage.children.length) {
			app.stage.children.map(x => x.destroy())
		}
		
		cellList.forEach((row, n) => {
			row.forEach((cell, m) => {
				const graph = cell.draw()
				
				app.stage.addChild(graph)
			})
		})
		
	}
	
	renderCells(list)	
	
	const loadElements = () => {
		const container = document.getElementsByClassName("container")[0] as HTMLDivElement
		
		const btn = document.createElement("img")
		btn.classList.add("computer")
		
		const setBtnState = (state: boolean) => {
			if (state) {
				btn.src = "../assets/pause_icon.png"
				btn.title = "Mettre en pause la simulation"
			} else {
				btn.src = "../assets/play_icon.png"
				btn.title = "Démarrer la simulation"
			}
		}

		btn.src = "../assets/play_icon.png"
		btn.title = "Démarrer la simulation"
		btn.onclick = () => {
			computing = !computing
			if (computing) {
				startComputation()
				setBtnState(true)
			} else {
				setBtnState(false)
			}
		}

		const exit = document.getElementById("exit")
		exit.onclick = () => {
			window.close()
		}

		const reset = document.createElement("img")
		reset.src = "../assets/reset_icon.png"
		reset.title = "Réinitialiser la grille"
		reset.classList.add("reset")
		reset.onclick = () => {
			if (!computing) {
				list = new Array(rows).fill(0).map((_, n) => new Array(cols).fill(0).map((_, m) => new GameCell(n, m, "black")))
				renderCells(list)
			}
		}
		
		window.addEventListener("keydown", (e) => {
			if (e.key === " ") {
				computing = !computing
				if (computing) {
					startComputation()
				}

				setBtnState(computing)
			}
		})

		container.append(btn, reset)
	}

	loadElements()
	document.body.appendChild(app.canvas)
})().catch(console.error)

