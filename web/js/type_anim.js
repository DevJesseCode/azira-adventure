function typewrite(what, where, type, cls) {
	return new Promise(function (resolve, reject) {
		if (!where) throw new Error("Invalid typing target. Please pass an element as `where` the second argument.")
		
		function delete_chars(intv) {
			return new Promise((resolve, reject) => {
				let l = where[type].length
				if (!l) resolve()
				for (let i = 0; i < l; i++) {
					setTimeout(() => { where[type] = where[type].slice(0, -1) }, i * intv)
					if (i === l - 1) { setTimeout(resolve, i * intv); break /* just in case */ }
				}
			})
		}

		function type_chars(intv) {
			return new Promise((resolve, reject) => {
				for (let i = 0; i < what.length; i++) {
					setTimeout(() => { where[type] += what[i] }, i * intv)
					if (i === what.length) { setTimeout(resolve, i * intv); break /* just in case, again */ }
				}
			})
		}
		
		delete_chars(50)
		.then(() => { cls & (where.className = cls); type_chars(50) } )
		.then(resolve)
	})
};