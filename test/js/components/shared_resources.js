/**
 * Returns a random string of a specified `length`
 * @param {number} length The length of the string to generate
 * @returns {string}
 */
export default function generate_random_string(length = 8) {
	const chars = Array.from("AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz012345679()/.,=-_&#*%")
	return new Array(length).fill("").map(c => chars[Math.floor(Math.random() * chars.length)]).join("")
}