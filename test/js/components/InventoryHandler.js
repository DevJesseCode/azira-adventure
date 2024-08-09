export default class InventoryHandler {
	constructor({ pages = 8, slots = 36, stack_size = 64, inventory = null } = {}) {
		this.version = "0.0.1"
		this.pages = pages
		this.slots = slots
		this.stack_size = stack_size
		this.inventory = inventory || new Array(this.pages * this.slots).fill(null)

		this._validateInventorySize()
		this.nested_inventory = this._initializeNestedInventory()
	}

	_validateInventorySize() {
		if (this.inventory.length !== this.pages * this.slots) {
			throw new Error("Inventory slots must be a product of pages and slots.")
		}
	}

	_initializeNestedInventory() {
		return Array.from({ length: this.pages }, () => new Array(this.slots).fill(null))
	}

	addItem(item) {
		if (typeof item !== "object" || Array.isArray(item)) {
			return { success: false, error: "INVALID_ARGS", message: "Item must be an object and not an array." }
		}

		const { freeSlotIndex, idSlot } = this._findSlot(item)
		if (freeSlotIndex === -1 && !idSlot) {
			return { success: false, error: "INVENTORY_FULL", message: "No free slots available." }
		}

		return item.stackable
			? this._addStackableItem(item, idSlot, freeSlotIndex)
			: this._addNonStackableItem(item, freeSlotIndex)
	}

	_findSlot(item) {
		let freeSlotIndex = -1
		let idSlot = null

		for (let i = 0; i < this.inventory.length; i++) {
			const itemInSlot = this.inventory[i]

			if (!itemInSlot && freeSlotIndex === -1) {
				freeSlotIndex = i
			} else if (itemInSlot && itemInSlot.id === item.id && itemInSlot.count < (item.stack_size || this.stack_size)) {
				idSlot = itemInSlot
			}

			if (freeSlotIndex !== -1 && idSlot) break
		}

		return { freeSlotIndex, idSlot }
	}

	_addStackableItem(item, idSlot, freeSlotIndex) {
		if (!idSlot) {
			let itemCopy = structuredClone(item)
			itemCopy.count = 0
			this.inventory[freeSlotIndex] = itemCopy
			idSlot = itemCopy
		}

		let remaining = (item.stack_size || this.stack_size) - idSlot.count

		if (remaining < item.count) {
			let newItem = structuredClone(item)
			idSlot.count += remaining
			newItem.count -= remaining
			return this.addItem(newItem)
		} else {
			idSlot.count += item.count
			return { success: true, operation: "InventoryHandler_ADD_ITEM", item: idSlot }
		}
	}

	_addNonStackableItem(item, freeSlotIndex) {
		if (item.count > 1 /* (item.stack_size || this.stack_size) */) {
			let remaining = item.count - 1 // (item.stack_size || this.stack_size)
			let itemCopy = structuredClone(item)
			itemCopy.count = 1 // (item.stack_size || this.stack_size)
			item.count = remaining
			this.inventory[freeSlotIndex] = itemCopy
			return this.addItem(item)
		} else {
			this.inventory[freeSlotIndex] = structuredClone(item)
			return { success: true, operation: "InventoryHandler_ADD_ITEM", item: this.inventory[freeSlotIndex] }
		}
	}

	getInventory() {
		return this.inventory
	}

	getNestedInventory() {
		this.nested_inventory = this.inventory.reduce((acc, cur, i) => {
			acc[Math.floor(i / this.slots)].push(cur)
			return acc
		}, Array.from({ length: this.pages }, () => []))

		return this.nested_inventory
	}
}
