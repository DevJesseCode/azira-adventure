(async function() {
    const EventTypes = {
        TEXT: "text_display"
    }

    const game = {
        main_screen: document.querySelector(".main_screen"),
        busy: false,
        tick_array: null,
        tick_index: 0,
        tick_arrays: {
            welcome: [
                { type: EventTypes.TEXT, content: "You wake up in a lush forest." },
                { type: EventTypes.TEXT, content: "Everything feels strange and unknown." },
                { type: EventTypes.TEXT, chance: 0.1, content: [
                    "\\Azira\\:\"I have been here before... many times before\"",
                    "\\Azira\\:\"I am but a pawn\""
                    ]
                },
                { type: EventTypes.TEXT, content: "You hear the voice of someone familiar" },
                { type: EventTypes.TEXT, content: "The voice of your friend, Jesse" },
                { type: EventTypes.TEXT, content: "\\Jesse\\:\"You're awake. Feeling better?\"" }
            ]
        },
        stat_monitor: {
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
            },
            init() {
                this.elements = Object.entries(this.base).reduce((obj, [stat_name, stat_value], i) => {
                    if (!i) {
                        obj.selector = document.querySelector("div#stats")
                    }
                    let stat = document.createElement("div")
                    stat.textContent = `${capitalize(stat_name)}: ${stat_value}`
                    obj.selector.appendChild(stat)
                    obj[stat_name] = stat
                    return obj
                }, {})
                this.current = {
                    health: this.health + this.equipment.health,
                    mana: this.mana + this.equipment.mana
                };
                this.dropdown = new JDropdown(this.elements.selector)
            },
            update_stat(type, stats) {
                if (!this[type]) return false;

                if (Array.isArray(stats)) {
                    for (const [stat_name, stat_value] of stats) {
                        if (this[type][stat_name] !== undefined) {
                            this[type][stat_name] += stat_value
                        }
                    }
                } else if (typeof stats === "object" && stats !== null) {
                    for (const [stat_name, stat_value] of Object.entries(stats)) {
                        if (this[type][stat_name] !== undefined) {
                            this[type][stat_name] += stat_value
                        }
                    }
                }

                for (const [stat_name, stat_value] of Object.entries(this.base)) {
                    const total_value = stat_value + this.equipment[stat_name]
                    this.elements[stat_name].textContent = `${capitalize(stat_name)}: ${total_value}`
                }
            }
        },
        event_handler: {
            main_click_handler() {
                if (this.busy) return false
                this.busy = true
                this.handle_event(this.tick_array[this.tick_index])
                this.tick_index++
            }
        },
        handle_event(event) {
            switch (event.type) {
                case EventTypes.TEXT:
                    let text
                    if (Array.isArray(event.content)) {
                        if (event.content.length > 1) {
                            const new_entry = structuredClone(event)
                            new_entry.chance = 1
                            text = new_entry.content.shift()
                            this.tick_array.splice(this.tick_index + 1, 0, new_entry)
                        } else {
                            text = event.content[0]
                        }
                    } else {
                        text = event.content
                    }

                    text = text.split(":")
                    switch (text[0]) {
                        case "\\Azira\\":
                            this.main_screen.className = "main_screen panels azira-text"
                            typewrite(text[1], this.main_screen).then(() => { this.busy = false })
                            break
                        case "\\Jesse\\":
                            this.main_screen.className = "main_screen panels jesse-text"
                            typewrite(text[1], this.main_screen).then(() => { this.busy = false })
                            break
                        default:
                            this.main_screen.className = "main_screen panels"
                            typewrite(text.join(), this.main_screen).then(() => { this.busy = false })
                    }
                    break
                default:
                    break
            }
        },
        load_tick_array(ta) {
            this.tick_array = ta
            this.tick_index = 0
        },
        init() {
            document.body.setAttribute("style", "--current-health: #080; --current-mana: #080")
            this.inventory = new InventoryHandler(document.querySelector("#inventory_container"))
            this.stat_monitor.init()
            this.load_tick_array(this.tick_arrays.welcome)
            this.main_screen.addEventListener("click", this.event_handler.main_click_handler.bind(this))

            this.inventory.scroll_controller = {
                current: 0,
                scroll(dir) {
                    this.current += (dir === "r" ? 1 : -1)
                    if (this.current < 0) this.current = game.inventory.pages - 1
                    if (this.current >= game.inventory.pages) this.current = 0

                    document.querySelector("#inventory_page_num").textContent = this.current + 1
                    game.inventory.element.children[this.current].scrollIntoView({ behavior: "smooth" })
                }
            }
        }
    }

    game.init = game.init.bind(game)
    window.game = game

    document.addEventListener("DOMContentLoaded", game.init)
})()