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

class InventoryHandler {
	constructor(inventory_container, options = {}) {
		if (!(inventory_container instanceof HTMLDivElement)) throw new Error("inventory_container must be a div");
		this.element = inventory_container;
		this.pages = options.pages || 8;
		this.slots = options.slots || 36;
		this.columns = options.columns || 6;
		this.stack_size = options.stack_size || 64;
		this.inventory = Array.from({ length: this.pages * this.slots }, () => null);
		this.lookup_table = null;
		this.init();
	}

	init() {
		this.element.innerHTML = "";  // Clear any existing content
		const df = document.createDocumentFragment();
		for (let i = 0; i < this.pages; i++) {
			const div_frag = document.createElement("div");
			for (let j = 0; j < this.slots; j++) {
				const in_slot = document.createElement("div");
				in_slot.classList.add("inventory_slot");
				div_frag.appendChild(in_slot);
			}
			df.appendChild(div_frag);
		}
		this.element.appendChild(df);
		return true;
	}

	async add_item(item, lookup) {
		let free = -1;
		let data_lookup;

		// Search for an existing stackable slot
		if (item.stackable) {
			for (let i = 0; i < this.inventory.length; i++) {
				if (this.inventory[i]?.id === item.id && this.inventory[i]?.count < this.stack_size) {
					free = i;
					break;
				}
			}
		}

		// If no stackable slot found, find a free slot
		if (free === -1) {
			for (let i = 0; i < this.inventory.length; i++) {
				if (!this.inventory[i]) {
					free = i;
					break;
				}
			}
		}

		// If no free slot found, return false
		if (free === -1) return false;

		data_lookup = lookup ? await this.lookup_data(item) : item;

		if (this.inventory[free]) {
			this.inventory[free].count += data_lookup.count || 1;
		} else {
			this.inventory[free] = { ...data_lookup, count: data_lookup.count || 1 };
		}

		this.update_ui(free);
		return true;
	}

	remove_item(item, count = 1) {
		let index = 0;
		while (!(this.inventory[index]?.id === item.id)) {
			index++;
			if (index >= this.inventory.length) return false;
		}
		this.inventory[index].count -= count;
		if (this.inventory[index].count < 1) {
			let rem_count = Math.abs(this.inventory[index].count);
			this.inventory[index] = null;
			this.update_slot(this.element.children[Math.floor(index / this.slots)].children[index % this.slots], index);
			if (rem_count) this.remove_item(item, rem_count);
		}
		this.update_ui(index);
	}

	async lookup_data(item) {
		if (!this.lookup_table) {
			try {
				let req = await fetch("./assets/item_data.json");
				this.lookup_table = await req.json();
			} catch (error) {
				console.error("Error fetching item data:", error);
				return item;  // Fallback to the provided item if fetch fails
			}
		}
		const to_return = this.lookup_table[item.id] || item;
		to_return.count = item.count || 1;
		to_return.enchants = item.enchants || {};
		to_return.misc = item.misc || {};
		return to_return;
	}

	update_ui(ind) {
		if (ind !== undefined) {
			const el = this.element.children[Math.floor(ind / this.slots)].children[ind % this.slots];
			this.update_slot(el, ind);
		} else {
			this.update_slot();
		}
		return true;
	}

	update_slot(el, ind) {
		if (el && ind !== undefined) {
			if (!(el instanceof HTMLDivElement)) throw new Error("Invalid element in update_slot");
			const icon = document.createElement("img");
			const count = document.createElement("p");
			el.innerHTML = "";

			icon.classList.add("inventory_icon");
			count.classList.add("inventory_item_count");

			icon.src = this.inventory[ind].icon;
			count.textContent = this.inventory[ind].count;
			if (this.inventory[ind].misc?.pixel_art) icon.classList.add("pixel-art");

			el.append(icon, count);
			return true;
		}

		for (let i = 0; i < this.inventory.length; i++) {
			if (!this.inventory[i]) continue;
			const element = this.element.children[Math.floor(i / this.slots)].children[i % this.slots];
			const icon = document.createElement("img");
			const count = document.createElement("p");
			element.innerHTML = "";

			icon.classList.add("inventory_icon");
			count.classList.add("inventory_item_count");

			icon.src = this.inventory[i].icon;
			count.textContent = this.inventory[i].count;
			if (this.inventory[i].misc?.pixel_art) icon.classList.add("pixel-art");

			element.append(icon, count);
		}
		return true;
	}
}
