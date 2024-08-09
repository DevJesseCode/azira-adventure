export default class StatMonitor {
	constructor({ stat_list = [], stat_types = [], updateCallback = null } = {}) {
		const def_stat_list = ["health", "mana", "strength", "stamina", "agility", "defense", "magic", "evasion", "crit_chance", "crit_damage"]
		const def_stat_types = ["base", "equipment"]
		
		this.stat_list = [...new Set([...def_stat_list, ...stat_list])]
		this.stat_types = [...new Set([...def_stat_types, ...stat_types])]
		this.updateCallback = updateCallback
		
		this.stats = this._initializeStats()
	}

	_initializeStats() {
		const stats = {}
		for (const stat_type of this.stat_types) {
			stats[stat_type] = {}
			for (const stat of this.stat_list) {
				stats[stat_type][stat] = 0
			}
		}
		return stats
	}

	_getValidStatTypes() {
		return this.stat_types.join(', ')
	}

	_getValidStatNames() {
		return this.stat_list.join(', ')
	}

	getStat(stat_type, stat) {
		if (stat_type === "total") {
			let sum = 0
			for (const type of this.stat_types) {
				sum += this.stats[type]?.[stat] || 0
			}
			return sum
		}

		if (!this.stat_types.includes(stat_type)) {
			throw new Error(`Invalid stat type: ${stat_type}. Valid types are: ${this._getValidStatTypes()}`)
		}
		if (!this.stat_list.includes(stat)) {
			throw new Error(`Invalid stat name: ${stat}. Valid names are: ${this._getValidStatNames()}`)
		}
		return this.stats[stat_type][stat]
	}

	setStat(stat_type, stat, value) {
		if (!this.stat_types.includes(stat_type)) {
			throw new Error(`Invalid stat type: ${stat_type}. Valid types are: ${this._getValidStatTypes()}`)
		}
		if (!this.stat_list.includes(stat)) {
			throw new Error(`Invalid stat name: ${stat}. Valid names are: ${this._getValidStatNames()}`)
		}
		this.stats[stat_type][stat] = value
		this.updateCallback?.call(this, this.stats)
	}

	modifyStat(stat_type, stat, amount) {
		if (!this.stat_types.includes(stat_type)) {
			throw new Error(`Invalid stat type: ${stat_type}. Valid types are: ${this._getValidStatTypes()}`)
		}
		if (!this.stat_list.includes(stat)) {
			throw new Error(`Invalid stat name: ${stat}. Valid names are: ${this._getValidStatNames()}`)
		}
		this.stats[stat_type][stat] += amount
		this.updateCallback?.call(this, this.stats)
	}

	resetStat(stat_type, stat) {
		if (!this.stat_types.includes(stat_type)) {
			throw new Error(`Invalid stat type: ${stat_type}. Valid types are: ${this._getValidStatTypes()}`)
		}
		if (!this.stat_list.includes(stat)) {
			throw new Error(`Invalid stat name: ${stat}. Valid names are: ${this._getValidStatNames()}`)
		}
		this.stats[stat_type][stat] = 0
		this.updateCallback?.call(this, this.stats)
	}

	resetAllStats(stat_type) {
		if (!this.stat_types.includes(stat_type)) {
			throw new Error(`Invalid stat type: ${stat_type}. Valid types are: ${this._getValidStatTypes()}`)
		}
		for (const stat of this.stat_list) {
			this.stats[stat_type][stat] = 0
		}
		this.updateCallback?.call(this, this.stats)
	}
}
