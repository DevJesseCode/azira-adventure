const stat_monitor = {
    base: {
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
    },
    equipment: {
        health: 0,
        mana: 0,
        strength: 0,
        stamina: 0,
        agility: 0,
        magic: 0,
        defense: 0,
        evasion: 0,
        crit_chance: 0,
        crit_damage: 0,
    }
}

stat_monitor.elements = Object.entries(stat_monitor.base).reduce((obj, [stat_name, stat_value], i) => {
    if (!i) {
        obj.selector = document.querySelector("select#stats")
    }
    let option = document.createElement("option")
    option.textContent = `${capitalize(stat_name)}: ${stat_value}`
    obj.selector.appendChild(option)
    obj[stat_name] = option
    return obj
}, {})

function update_stat(type, stats) {
    if (!stat_monitor[type]) return false
    if (stats instanceof Array) {
        for (const [stat_name, stat_value] of stats) {
            stat_monitor[type][stat_name] += stat_value
        }
    }

    for (const [stat_name, stat_value] of Object.entries(stat_monitor.base)) {
        stat_monitor.elements[stat_name].textContent = `${capitalize(stat_name)}: ${stat_value + stat_monitor.equipment[stat_name]}`
    }
}

function capitalize(str) {
    if (typeof str !== "string") return str
    return str.split("_").map(w => (w[0] || " ").toUpperCase() + (w || "  ").slice(1)).join(" ").trim()
}