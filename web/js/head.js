function wait(time = 1000) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => resolve(true), time)
    })
}

function capitalize(str) {
    if (typeof str !== "string") return str
    return str.split("_").map(w => (w[0] || " ").toUpperCase() + (w || "  ").slice(1)).join(" ").trim()
}

function generate_random_string(length) {
	const string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890#$%&*()^-=+.?"
	let id = ""
	for (let i = 0; i < length; i++) {
		id += string.charAt(Math.floor(Math.random() * string.length))
	}
	return id
}

function generate_random_number(...args) {
	if (!args.length) return Math.random()
	const internal_args = [ 0, 0, false ]
	let number = 0

	if (args.length > 1) {
		if (typeof args[1] === "number") {
			internal_args[0] = args[0]
			internal_args[1] = args[1]
			internal_args[2] = Boolean(args[2])
		} else if (typeof args[1] === "boolean") {
			internal_args[1] = args[0]
			internal_args[2] = Boolean(args[1])
		}
	} else {
		internal_args[1] = args[0]
	}

	number = internal_args[0] + Math.random() * (internal_args[1] - internal_args[0])
	if (internal_args[2]) {
		return number
	} else {
		return Number(number.toFixed(0))
	}
}

function get_time_string(time, expanded = false) {
	const divisors = [ 29.0304E9, 2.4192E9, 604.8E6, 86.4E6, 3.6E6, 60000, 1000 ]
	const units = [ "year", "month", "week", "day", "hour", "minute", "second" ]
	const units_compact = [ "y", "mo", "w", "d", "h", "m", "s" ]
	let return_string = ""

	for (let i = 0; i < divisors.length; i++) {
		if (time <= 1000) break
		let quotient = time / divisors[i]
		if (quotient < 1) continue
		if (expanded) {
			return_string += `${Math.floor(quotient)} ${(quotient < 2) ? units[i] : units[i] + "s"} `
		} else {
			return_string += `${Math.floor(quotient)}${units_compact[i]} `
		}
		time = (quotient - Math.floor(quotient)) * divisors[i]
	}

	!return_string && (return_string = `0 ${expanded ? "seconds" : "sec"}`)
	return return_string.trim() + " ago"
}