/**
 * AssetManager class for managing assets in web games.
 * @class AssetManager
 */
export default class AssetManager {
	/**
	 * Creates an instance of AssetManager.
	 * @memberof AssetManager
	 */
	constructor() {
		/**
	     * Map of assets with their respective names.
	     * @type {Map<string, {mime_type: string, blob: Blob, data_url: string}>}
	     */
		this.assets = new Map()
		/**
    	 * Total size of all assets in bytes.
    	 * @type {number}
    	 */
    	this.internal_size = 0
    	/**
    	 * Version number of the AssetManager class.
    	 * @type {string}
    	 */
    	this.version = "0.0.1"
	}

	/**
	 * Reads a blob as a data URL.
	 * @param {Blob} blob - Blob to read.
	 * @returns {Promise<string>} Data URL of the blob.
	 * @private
	 */
	_readAsDataURL(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result)
			reader.onerror = reject
			reader.readAsDataURL(blob)
		})
	}

	/**
	 * Loads one or more assets.
	 * @param {(string|{name: string, url: string})[]} args - Asset names or objects with name and URL.
	 * @returns {Promise<{success: boolean, assets: string[]}>} Success object with loaded asset names.
	 */
	load(args) {
		return new Promise(async (resolve, reject) => {
			if (!args || (Array.isArray(args) && !args.length)) {
				reject("No arguments passed")
			}
			let assets_array = Array.isArray(args) ? args : [args]
			let added_assets = []

			for (const asset of assets_array) {
				let asset_name, asset_url

				switch (typeof asset) {
					case "string":
						asset_name = asset.split("/").pop()
						asset_url = asset
						break
					case "object":
						asset_name = asset.name || asset.alias || asset[0]
						asset_url = asset.url || asset.location || asset[1]
						break
					default:
						throw new Error(`Skipping asset: Invalid asset specification ${typeof asset}`)
				}

				if (!asset_name || !asset_url) {
					console.warn(`Skipping asset: Parse failed for ${JSON.stringify(asset)}`)
					continue
				}

				try {
					const response = await fetch(asset_url)
					if (!response.ok) {
						console.error(`Failed to fetch asset from ${asset_url}`)
						continue
					}

					const size = Number(response.headers.get("content-length"))
					const mime_type = response.headers.get("content-type")
					const blob = await response.blob()

					this.assets.set(asset_name, {
						mime_type,
						blob,
						data_url: await this._readAsDataURL(blob),
						decoded() {
							return atob(this.data_url.split(",")[1])
						} })
					this.internal_size += size
					added_assets.push(asset_name)
				} catch (error) {
					console.error(`Failed to add asset ${asset_name} from ${asset_url}: ${error.message}`)
				}
			}

			if (added_assets.length === 0) {
				reject("Add failed for all assets")
			}

			resolve({ success: true, assets: added_assets })
		})
	}

	/**
	 * Removes one or more assets.
	 * @param {string|string[]} asset_names - Names of assets to remove.
	 * @returns {string[]} Names of removed assets.
	 */
	remove(asset_names) {
		if (!asset_names) return []
		if (!Array.isArray(asset_names)) asset_names = [asset_names]
		const deleted_assets = []
		for (const asset_name of asset_names) {
			if (!this.assets.has(asset_name)) continue
			this.internal_size -= this.assets.get(asset_name).blob.size
			this.assets.delete(asset_name)
			deleted_assets.push(asset_name)
		}
		return deleted_assets
	}

	/**
	 * Gets an asset by its name.
	 * @param {string} assetName - Name of the asset.
	 * @param {boolean} [asDOMElement] - Whether to return the asset as a DOM element.
	 * @returns {(HTMLElement|{mime_type: string, blob: Blob, data_url: string}|null)} Asset or null if not found.
 	 */
	get(assetName, asDOMElement) {
		if (this.assets.has(assetName)) {
			if (asDOMElement) {
				let asset = this.assets.get(assetName)
				let type = asset.mime_type.split("/")[0]
				type = type.charAt(0).toUpperCase() + type.slice(1)

				if (!window[type]) type = "Text"

				const domElement = new window[type]
				domElement.src = asset.data_url
				domElement.textContent = asset.data_url

				return domElement
			}
			return this.assets.get(assetName)
		}
		console.warn(`The asset "${assetName}" does not exist.`)
		return null
	}

	/**
	 * Checks if an asset exists.
	 * @param {string} assetName - Name of the asset.
	 * @returns {boolean} Whether the asset exists.
	 */
	exists(assetName) {
		return this.assets.has(assetName)
	}

	/**
	 * Clears all assets.
	 */
	clear() {
		this.assets.clear()
		this.internal_size = 0
	}

	/**
	 * Gets the total size of one or more assets.
	 * @param {string|string[]} [asset_names] - Names of assets to get the size for.
	 * @returns {number} Total size of assets in bytes.
	 */
	size(asset_names) {
		if (!asset_names?.length) return this.internal_size
		let size = 0
		if (!Array.isArray(asset_names)) asset_names = [asset_names]
		for (const asset_name of asset_names) {
			if (!this.assets.has(asset_name)) {
				console.warn(`The asset "${asset_name}" does not exist.`)
				continue
			}
			size += this.assets.get(asset_name).blob.size
		}
		return size
	}
}