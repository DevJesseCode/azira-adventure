class JDropdown {
    constructor(drop_el, style_opts) {
        if (!(drop_el instanceof HTMLDivElement)) throw new Error("drop_el must be a div element")
        if (style_opts && !(style_opts instanceof Object)) throw new Error("style_opts must be an object")
        this.style_opts = style_opts || {}
        this.dropdown = drop_el
        this.grid_div = document.createElement("div")
        this.options = Array.from(drop_el.children)
        this.unique_id = JDropdown.assign_id()
        this.snap_timeout = null
        this.opened = false

        this.setupHTML()
        this.assign_styles()
        this.insert_global_styles()
        this.insert_local_styles()

        this.click_callback = this.click_callback.bind(this)
        this.close_dropdown = this.close_dropdown.bind(this)
        this.mousescroll_callback = this.mousescroll_callback.bind(this)

        // Event Listeners
        this.dropdown.addEventListener("scroll", this.mousescroll_callback)
        this.dropdown.addEventListener("click", this.click_callback)
    }

    static assign_id() {
        const chars = Array.from("AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz012345679😊💀🙄👌")
        return new Array(12).fill("").map(c => chars[Math.floor(Math.random() * chars.length)]).join("")
    }
    setupHTML() {
        this.dropdown.id = this.unique_id
        this.dropdown.innerHTML = ""
        this.grid_div.appendChild(this.options.reduce((frag, opt) => {
            opt.classList.add("drop_item")
            frag.appendChild(opt)
            return frag
        }, document.createDocumentFragment()))
        this.dropdown.appendChild(this.grid_div)
        return true
    }

    mousescroll_callback(e) {
        let custom_pos = typeof e === "number" ? e : null
        clearTimeout(+this.snap_timeout) // recently learnt that +null is 0
        this.snap_timeout = setTimeout(() => {
            // This will snap the dropdown after 1s. Looks pretty cool on the page, actually :)
            let height = this.options[0].getBoundingClientRect().height
            let pos = custom_pos || this.dropdown.scrollTop
            pos = Math.round(Math.max(Math.min(pos, (this.options.length - 1) * height), 0))
            if (pos % height < height / 2) {
                pos = Math.floor(pos / height) * height
            } else {
                pos = Math.ceil(pos / height) * height
            }
            this.dropdown.scrollTo({ top: pos, left: 0, behavior: "smooth" })
            this.selected = this.options[pos / height]
        }, 1e3)
    }

    click_callback(e) {
        if (!Array.from(this.grid_div.children).includes(e.target)) return false
        let height = this.options[0].getBoundingClientRect().height
        if (this.opened) {
            let pos = this.options.indexOf(e.target) * height
            this.grid_div.style.removeProperty("padding")
            this.dropdown.style.removeProperty("height")
            this.dropdown.classList.remove("dropdown_open")
            this.selected = this.options.indexOf(e.target)
            document.removeEventListener("click", this.close_dropdown)
            this.dropdown.addEventListener("scroll", this.mousescroll_callback)
            setTimeout(() => this.dropdown.scrollTo({ top: pos, left: 0, behavior: "smooth" }), 500)
        } else {
            this.dropdown.classList.add("dropdown_open")
            this.grid_div.style.paddingTop = this.style_opts.height || "clamp(50px, 8vh, 70px)"
            this.dropdown.style.height = `${4 * height}px`
            this.dropdown.scrollTo({ top: 0, left: 0, behavior: "smooth" })
            document.addEventListener("click", this.close_dropdown)
            this.dropdown.removeEventListener("scroll", this.mousescroll_callback)
        }
        this.opened = !this.opened
    }

    close_dropdown(event) {
        if (!this.dropdown.contains(event.target)) {
            this.opened = false
            let height = this.options[0].getBoundingClientRect().height
            let pos = (this.options.indexOf(this.selected) || 0) * height
            this.grid_div.style.removeProperty("padding")
            this.dropdown.style.removeProperty("height")
            this.dropdown.classList.remove("dropdown_open")
            setTimeout(() => this.dropdown.scrollTo({ top: pos, left: 0, behavior: "smooth" }), 500)
        }
    }

    assign_styles() {
        const { style_opts } = this
        this.styles = {
            "background-color": style_opts["background-color"] || "#333",
            "font": style_opts["font"] || "16px Arial, sans-serif",
            "height": style_opts["height"] || "clamp(50px, 8vh, 70px)",
            "color": style_opts["color"] || "white",
            "border-radius": style_opts["border-radius"] || ".9rem",
            "loc_transition": style_opts["loc-transition"] || "margin-top .5s ease-out, padding-top .5s ease-out",
            "opt_padding": style_opts["opt_padding"] || "0px 1rem",
            "opt_transition": style_opts["opt_transition"] || "all 1s ease-out",
            "additional": style_opts["additional"] || ""
        }
        return true
    }

    insert_global_styles() {
        let style_el = document.head.querySelector(`#jdropdown-style`)
        if (!style_el) {
            style_el = document.createElement("style")
            style_el.id = `jdropdown-style`
            style_el.textContent =
            `div[jdropdown] {
    overflow-y: scroll;
    scrollbar-width: none;
    transition: all .5s ease-out;
    user-select: none;
}`
            document.head.appendChild(style_el)
        }
        return true
    }

    insert_local_styles() {
        const { styles } = this
        let style_el = document.head.querySelector(`#jdropdown-style-${this.unique_id}`)
        if (!style_el) {
            style_el = document.createElement("style")
            style_el.id = `jdropdown-style-${this.unique_id}`
            document.head.appendChild(style_el)
        }
        if (style_el.textContent) return true
        style_el.textContent =
            `div[jdropdown]#${this.unique_id} {
    background-color: ${styles["background-color"]};
    font: ${styles.font};
    height: ${styles.height};
    color: ${styles.color};
    border-radius: ${styles["border-radius"]};
    position: relative;
}

div[jdropdown]#${this.unique_id} > div {
    display: grid;
    height: 100%;
    grid-auto-rows: ${styles.height};
    align-items: center;
    margin-top: calc(var(--location) * -${styles.height});
    padding-top: 0px;
    transition: ${styles.loc_transition};
}

div[jdropdown]#${this.unique_id} > div > .drop_item {
    height: 100%;
    padding: ${styles.opt_padding};
    align-content: center;
    transition: ${styles.opt_transition};
}

div[jdropdown]#${this.unique_id} > div > .drop_item:hover {
    background-color: #ffffff20;
}
${styles.additional?.replace(/\$id/g, this.unique_id) || ""}`
        return true
    }
}