class AssetManager {
	constructor(assets_array) { // Default argument is there just for VS Code to look nice
		this.assets = new Map()
		this.internal_size = 0
		this.version = "1.0.0" // This will probably never change
		this.audio_handler = new AudioHandler()
		this.fetching = 0 // Added for possible implement of a progress monitor in future
		assets_array && this.add(assets_array)
	}

	add(...args) {
		return new Promise(async (resolve, reject) => {
			if (!args.length || args.length === 1) {
				reject("No arguments passed")
			}
			let assets_array = typeof args[0] === "object" ? args : [args]
			let added_assets = []
	
			for (const asset of assets_array) {
				const asset_name = asset.name || asset[0]
				const asset_url = asset.url || asset.location || asset[1]
	
				if (!asset_name || !asset_url) continue
	
				try {
					const response = await fetch(asset_url)
					if (!response.ok) {
						console.error(`Failed to fetch asset from ${asset_url}`)
						continue
					}
	
					const size = Number(response.headers.get("content-length"))
					const mime_type = response.headers.get("content-type")
					const blob = await response.blob()
	
					this.assets.set(asset_name, { mime_type, blob, data_url: await this._readAsDataURL(blob) })
					this.internal_size += size
					added_assets.push(asset_name)
				} catch (error) {
					console.error(`Failed to add asset ${asset_name} from ${asset_url}: ${error.message}`)
				}
			}
	
			if (added_assets.length === 0) {
				reject("Add failed for all assets")
			}
	
			resolve({ ok: true, assets: added_assets })
		})
	}

	_readAsDataURL(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result)
			reader.onerror = reject
			reader.readAsDataURL(blob)
		})
	}

	remove(...asset_names) {
		const deleted_assets = []
		for (const asset_name of asset_names) {
			if (!this.assets.has(asset_name)) continue
			this.internal_size -= this.assets.get(asset_name).blob.size
			this.assets.delete(asset_name)
			deleted_assets.push(asset_name)
		}
		return deleted_assets
	}

	retrieve(asset_name, as_dom_element) {
		if (!this.assets.has(asset_name)) return false
		const asset = this.assets.get(asset_name)

		if (!as_dom_element) return asset.data_url

		let dom_type = asset.mime_type.split("/")[0]
		dom_type = dom_type.charAt(0).toUpperCase() + dom_type.slice(1)
		if (!window[dom_type]) {
			console.log(`There is no DOM element for ${asset_name}`)
			return false
		}

		const dom_element = document.createElement(dom_type)
		if (dom_type === "Text") {
			dom_element.textContent = asset.data_url
		} else {
			dom_element.src = asset.data_url
		}
		return dom_element
	}

	size(...asset_names) {
		if (!asset_names.length) return this.internal_size
		let size = 0
		for (const asset_name of asset_names) {
			if (!this.assets.has(asset_name)) {
				console.log(`The asset "${asset_name}" does not exist.`)
				continue
			}
			size += this.assets.get(asset_name).blob.size
		}
		return size
	}

	async play_audio(audio_asset, id) {
		if (this.assets.has(audio_asset)) {
			const return_data = await this.audio_handler.play(false, this.retrieve(audio_asset))
			this.assets.get(audio_asset).play_id = return_data.id
			return { playing: return_data.okay, id: return_data.id }
		}

		if (id) {
			const return_data = await this.audio_handler.play(id)
			return { playing: return_data.okay, id: return_data.id }
		}

		return "The asset does not exist."
	}

	pause_audio(play_id) {
		return this.audio_handler.pause(play_id)
	}
}

class AudioHandler {
	constructor() {
		this.audio_players = new Map()
	}

	async play(id, data_url) {
		if (id && this.audio_players.has(id)) {
			this.audio_players.get(id).play()
			return { okay: true, id }
		}

		if (!data_url) return { okay: false, id: null }

		let audio = new Audio()
		id = id || generate_random_string(8)
		audio.src = data_url

		const _okay = await audio.play().then(() => true).catch(() => false)
		if (_okay) {
			audio.onended = () => {
				this.audio_players.delete(id)
			}
			this.audio_players.set(id, audio)
		}

		return { okay: _okay, id }
	}

	pause(id) {
		if (this.audio_players.has(id)) {
			this.audio_players.get(id).pause()
			return true
		}
		return false
	}

	end(id) {
		if (this.audio_players.has(id)) {
			this.audio_players.get(id).currentTime = this.audio_players.get(id).duration
			this.audio_players.get(id).ended = true
			return true
		}
		return false
	}
}

class BackgroundManager {
	constructor(canvas = document.createElement("canvas")) {
		!document.body.contains(canvas) && document.body.prepend(canvas)
		canvas.id = "background"
		canvas.width = innerWidth
		canvas.height = innerHeight
		this.canvas = canvas
		this.ctx = canvas.getContext("2d")
		this.width = innerWidth
		this.height = innerHeight
		this._clear_canvas()
	}

	_clear_canvas() {
		const prev_fill = this.ctx.fillStyle
		this.ctx.clearRect(0, 0, this.width, this.height)
		this.ctx.fillStyle = "#99999910"
		this.ctx.fillRect(0, 0, this.width, this.height)
		this.ctx.fillStyle = prev_fill
		return true
	}

	_get_fps() {
		const self = this
		return new Promise(function (resolve, reject) {
			let count = 0
			let req_int = setInterval(function () {
				requestAnimationFrame(() => { count++ })
			})

			setTimeout(() => {
				clearInterval(req_int)
				self.fps = Math.round(count / 10) * 20
				resolve(self.fps)
			}, 500)
		})
	}

	set(image_data = "") {
		const self = this
		let image
		if (typeof image_data === "object") {
			image = image_data
			draw()
		} else {
			image = new Image()
			image.src = image_data
			image.addEventListener("load", draw)
		}

		function draw() {
			let i = 0
			function conceal() {
				self.ctx.fillStyle = "#00000020"
				self.ctx.fillRect(0, 0, self.width, self.height)
				i++
				if (i < 61) {
					requestAnimationFrame(conceal)
				} else {
					i = 0
					requestAnimationFrame(reveal)
				}
			}
			function reveal() {
				self.ctx.fillStyle = `rgba(0, 0, 0, ${(60 - i) / 60})`
				self.ctx.clearRect(0, 0, self.width, self.height)
				self.ctx.drawImage(image, 0, 0, self.width, self.height)
				self.ctx.fillRect(0, 0, self.width, self.height)
				i++
				if (i < 61) requestAnimationFrame(reveal)
			}
			requestAnimationFrame(conceal)
		}
	}
}

function generate_random_string(length) {
	const string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890#$%&*()^-=+.?"
	let id = ""
	for (let i = 0; i < length; i++) {
		id += string.charAt(Math.floor(Math.random() * string.length))
	}
	return id
}
