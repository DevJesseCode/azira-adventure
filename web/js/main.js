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

function update_stat(type, stats) {
    if (!stat_monitor[type]) return false;

    if (Array.isArray(stats)) {
        for (const [stat_name, stat_value] of stats) {
            if (stat_monitor[type][stat_name] !== undefined) {
                stat_monitor[type][stat_name] += stat_value
            }
        }
    } else if (typeof stats === "object" && stats !== null) {
        for (const [stat_name, stat_value] of Object.entries(stats)) {
            if (stat_monitor[type][stat_name] !== undefined) {
                stat_monitor[type][stat_name] += stat_value
            }
        }
    }

    for (const [stat_name, stat_value] of Object.entries(stat_monitor.base)) {
        const total_value = stat_value + stat_monitor.equipment[stat_name]
        stat_monitor.elements[stat_name].textContent = `${capitalize(stat_name)}: ${total_value}`
    }
}

function capitalize(str) {
    if (typeof str !== "string") return str
    return str.split("_").map(w => (w[0] || " ").toUpperCase() + (w || "  ").slice(1)).join(" ").trim()
}

function init() {
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

    (function () {
        let items_container = document.querySelector("div#inventory_items")
        let doc_frag = document.createDocumentFragment()
        for (let i = 0; i < 64; i++) {
            const inventory_slot = document.createElement("div")
            // const item_icon = document.createElement("img")
            // const item_count = document.createElement("p")
            inventory_slot.classList.add("inventory_slot")
            doc_frag.appendChild(inventory_slot)
        }
        items_container.appendChild(doc_frag)
    })()
}

document.addEventListener("DOMContentLoaded", init)