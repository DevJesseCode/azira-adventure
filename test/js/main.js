import generate_random_string from "./components/shared_resources.js"
import AssetManager from "./components/AssetManager.js"
import AudioHandler from "./components/AudioHandler.js"
import { KeyboardHandler } from "./components/EventHandler.js"
import InventoryHandler from "./components/InventoryHandler.js"
import StatMonitor from "./components/StatMonitor.js"

(async function() {
	let game = {
		class: { AssetManager, AudioHandler, InventoryHandler, KeyboardHandler, StatMonitor },
		func: {
			generate_random_string,
			wait: function (time = 1000) {
				return new Promise((resolve, reject) => { setTimeout(resolve, time) })
			}
		},
		screen: {
			inventory: document.querySelector(".inventory"),
			stats: document.querySelector(".stats"),
			main: document.querySelector(".main-content"),
			load: document.querySelector(".load-game"),
			save: document.querySelector(".save-game")
		},
		callbacks: {
			statUpdate(stats) {
				let statsTotal = {}
				Object.entries(stats).forEach(entry => {
					Object.entries(entry[1]).forEach(stat => {
						statsTotal[stat[0]] = (statsTotal[stat[0]] || 0) + stat[1]
					})
				})
				
				this.screen.stats.children[0].querySelector("div").innerHTML =
`<p>Health:</p>
<p>${statsTotal.health}</p>
<p>Mana:</p>
<p>${statsTotal.mana}</p>
<p>Strength:</p>
<p>${statsTotal.strength}</p>
<p>Stamina:</p>
<p>${statsTotal.stamina}</p>
<p>Agility:</p>
<p>${statsTotal.agility}</p>
<p>Magic:</p>
<p>${statsTotal.magic}</p>
<p>Defense:</p>
<p>${statsTotal.defense}</p>
<p>Evasion:</p>
<p>${statsTotal.evasion}</p>
<p>Critical chance:</p>
<p>${statsTotal.crit_chance}</p>
<p>Critical damage:</p>
<p>${statsTotal.crit_damage}</p>`
			}
		},
		setupComponents() {
			const { screen } = this
			this.components = {
				am: new this.class.AssetManager(),
				ah: new this.class.AudioHandler(),
				ih: new this.class.InventoryHandler(),
				kh: new this.class.KeyboardHandler(),
				sm: new this.class.StatMonitor({ updateCallback: this.callbacks.statUpdate.bind(this) }),
				sc: {
					displayInventoryScreen() { screen.inventory.scrollIntoView({ behavior: "smooth" }) },
					displayStatsScreen() { screen.stats.scrollIntoView({ behavior: "smooth" }) },
					displayMainScreen() { screen.main.scrollIntoView({ behavior: "smooth" }) },
					displaySaveScreen() { screen.save.scrollIntoView({ behavior: "smooth" }) },
					displayLoadScreen() { screen.load.scrollIntoView({ behavior: "smooth" }) }
				}
			}

			{
				this.components.am.load([["__game_am_test", "./css/main.css"]])
				.then(() => console.info("Test passed: AssetManager successfully loaded test file"))
				.catch((err) => console.warn("Test failed: AssetManager failed to load test file", err))
			}

			{
				try {
					let baseStats = {
						health: 5,
		                mana: 0,
		                strength: 1,
		                stamina: 2,
		                agility: 1,
		                magic: 3,
		                defense: 0,
		                evasion: 1,
		                crit_chance: .01,
		                crit_damage: 1,
					}
					for (const details of Object.entries(baseStats)) {
						this.components.sm.setStat("base", ...details)
					}
					console.info("Test passed: StatMonitor initialised to defaults successfully")
				} catch (error) {
					console.warn("Test failed: StatMonitor initialisation failed", error)
				}
			}
		},
		setupKeyboardHandler() {
			const { kh, sc } = this.components
			kh.listen("ctrl+shift+s", sc.displaySaveScreen)
			kh.listen("ctrl+shift+l", sc.displayLoadScreen)
			kh.listen("shift+m", sc.displayMainScreen)
			kh.listen("shift+s", sc.displayStatsScreen)
			kh.listen("shift+i", sc.displayInventoryScreen)
		},
		init() {
			const mainScreen = this.screen.main
			this.setupComponents()
			this.setupKeyboardHandler()
			mainScreen.scrollIntoView()
		}
	}

	window.game = game
	document.addEventListener("DOMContentLoaded", game.init.bind(game))
})()