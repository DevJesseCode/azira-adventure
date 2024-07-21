function typewrite(what, where) {
	return new Promise(function (resolve, reject) {
		if (!where) throw new Error("Invalid typing target. Please pass an element as `where` the second argument.")
		resolve(true)
	})
};