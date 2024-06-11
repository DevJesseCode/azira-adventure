window.WebFontConfig = {
	google: {
		families: ["Montserrat", "Nunito", "Pixelify Sans", "Plus Jakarta Sans", "Poppins", "Quicksand", "Roboto Mono"],
	},
    active() {
		init()
	},
};

// PIXI.sound.add("Test", ["/assets/An-Odyssey-Into-The-Past.wav", "/assets/An-Odyssey-Into-The-Past.mp3"])
// PIXI.sound.play("Test")
PIXI.Assets.add({ alias: 'Test', src: '/assets/An-Odyssey-Into-The-Past.{wav,mp3}' });
PIXI.Assets.load('Test').then(sound => sound.play());

(function () {
	const wf = document.createElement('script')
	wf.src = `${
		document.location.protocol === 'https:' ? 'https' : 'http'
	}://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`
    wf.type = 'text/javascript'
    wf.async = 'true'
    const s = document.querySelectorAll('script')[0]
    s.parentNode.insertBefore(wf, s)
})();

(async function() {
	const { Application, Assets, BlurFilter, Container, Graphics, Sprite, TextStyle, Texture } = PIXI
	const app = new Application()
	await app.init({
		background: "#99999910",
		width: window.innerWidth,
		height: window.innerHeight
	})
	document.body.appendChild(app.canvas)

	let background = await Assets.load("./assets/bg0.jpg")
	background = new Sprite(background)
	background.width = app.screen.width
	background.height = app.screen.height
	background.eventMode = "none"
	app.stage.addChild(background)

	{
		const welcome_card = new Container({
			isRenderGroup: true,
			x: app.screen.width * 0.25,
			y: (app.screen.height - 300) / 2
		})
		const welcome_card_background = new Graphics()
			.roundRect(0, 0, app.screen.width / 2, 300, 25)
			.fill("#111111aa")
		const welcome_style = new TextStyle({
			fill: "white",
			fontFamily: ["Quicksand", "Montserrat", "system-ui"],
			fontSize: "40%",
			dropShadow: {
				color: "#ffffff",
				blur: 5,
				distance: 0
			}
		})
		const welcome_text_head = new PIXI.Text({
			text: "Welcome to Azira's Adventure",
			style: welcome_style
		})
		const welcome_text_body = new PIXI.Text({
			text: "This game is still a work in progress🚧. Please forgive any bugs😇.\nYou can send bug reports and suggestions to my Discord.",
			style: welcome_style.clone()
		})
		const background_blur = new BlurFilter()
		background_blur.blur = 1.5
		background.filters = [background_blur]
		welcome_text_head.x = 20
		welcome_text_head.y = 20
		welcome_text_body.x = 20
		welcome_text_body.y = 70
		welcome_text_body.style.fontSize = "20%"
		welcome_text_body.style.fontWeight = "300"
		welcome_text_body.style.dropShadow.blur = "3"
		app.stage.addChild(welcome_card)
		welcome_card.addChild(welcome_card_background)
		welcome_card.addChild(welcome_text_head)
		welcome_card.addChild(welcome_text_body)
	}

})()

localStorage.clear() // Always reset the localStorage (for development purposes only)
const render_div = document.createElement("div")
const asset_manager = new AssetManager()
// const background = new BackgroundManager(document.querySelector("canvas#background"))
const game = JSON.parse(localStorage.getItem("game")) || { saves: [{id: "test", name: "My save", lvl: 99, loc: "cave", time: Date.now()}, {id: "test", name: "My save", lvl: 99, loc: "cave", time: Date.now()}], first_run: true }
const player_id = game.player_id || `player_${generate_random_string(8)}`
localStorage.setItem("game", JSON.stringify(game))

function generate_random_number(...args) {
	if (!args.length) return Math.random()
	const internal_args = [ 0, 0, false ]
	let number = 0

	if (args.length > 1) {
		if (typeof args[1] === "number") {
			internal_args[0] = args[0]
			internal_args[1] = args[1]
			internal_args[2] = Boolean(args[2])
		} else if (typeof args[1] === "boolean") {
			internal_args[1] = args[0]
			internal_args[2] = Boolean(args[1])
		}
	} else {
		internal_args[1] = args[0]
	}

	number = internal_args[0] + Math.random() * (internal_args[1] - internal_args[0])
	if (internal_args[2]) {
		return number
	} else {
		return Number(number.toFixed(0))
	}
}

function get_time_string(time, expanded = false) {
	const divisors = [ 29.0304E9, 2.4192E9, 604.8E6, 86.4E6, 3.6E6, 60000, 1000 ]
	const units = [ "year", "month", "week", "day", "hour", "minute", "second" ]
	const units_compact = [ "y", "mo", "w", "d", "h", "m", "s" ]
	let return_string = ""

	for (let i = 0; i < divisors.length; i++) {
		if (time <= 1000) break
		let quotient = time / divisors[i]
		if (quotient < 1) continue
		if (expanded) {
			return_string += `${Math.floor(quotient)} ${(quotient < 2) ? units[i] : units[i] + "s"} `
		} else {
			return_string += `${Math.floor(quotient)}${units_compact[i]} `
		}
		time = (quotient - Math.floor(quotient)) * divisors[i]
	}

	!return_string && (return_string = `0 ${expanded ? "seconds" : "sec"}`)
	return return_string.trim() + " ago"
}