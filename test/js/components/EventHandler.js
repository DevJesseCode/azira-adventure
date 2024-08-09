class EventHandler {
    constructor() {
        this.eventMap = new Map()
    }
}

export class KeyboardHandler extends EventHandler {
    constructor() {
        super()
        this.keysDown = {}
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)
        this.init()
    }

    init() {
        if (window.gameUtils?.eventHandler?.keyboardHandler) return true
        window.gameUtils = { ...{ eventHandler: { keyboardHandler: true } }, ...(window.gameUtils || {}) }
        document.addEventListener("keydown", this.handleKeyDown)
        document.addEventListener("keyup", this.handleKeyUp)
    }

    handleKeyDown(event) { const { key } = event; this.keysDown[key] = true; this.queryListeners(event) }
    handleKeyUp(event) { const { key } = event; this.keysDown[key] = false; this.queryListeners(event) }

    alertInterrupt() {
        for (const key of Object.keys(this.keysDown)) this.keysDown[key] = false // preserve reference to this.keysDown
    }

    listen(keyCombination, callback) {
        if (!keyCombination || typeof keyCombination !== "string") return false

        const prevCallback = this.eventMap.get(keyCombination)
        keyCombination = keyCombination.toLowerCase()

        if (prevCallback) {
            this.eventMap.set(keyCombination, [ ...prevCallback, callback ])
            return true
        }
        this.eventMap.set(keyCombination, [ callback ])
        return true
    }

    stopListen(keyCombination, callback) {
        if (!keyCombination || typeof keyCombination !== "string" || !this.eventMap.has(keyCombination)) return false
        if (callback) {
            let cbs = this.eventMap.get(keyCombination), index = cbs.indexOf(callback)
            if (!(index + 1)) return false
            cbs.splice(index, 1)
            return true
        }
        this.eventMap.delete(keyCombination)
        return true
    }

    queryListeners(event) {
        const activeKeys = new Set()
        for (const [ key, state ] of Object.entries(this.keysDown)) {
            if (state) activeKeys.add(key.toLowerCase())
        }

        for (const comb of this.eventMap.keys()) {
            let compComb = new Set(comb
                .replace(/ /g, "")
                .replace(/-/g, "+")
                .replace(/ctrl/g, "control")
                .replace(/del/g, "delete")
                .replace(/ins/g, "insert")
                .split("+"))
            if (compComb.isSubsetOf(activeKeys) && activeKeys.isSubsetOf(compComb)) this.executeCallbacks(this.eventMap.get(comb), event)
        }
    }

    executeCallbacks(callbackArray, event) { event.preventDefault(); for (const callback of callbackArray) callback(event) }
}