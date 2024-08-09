CanvasRenderingContext2D.prototype.getPixelData = function () {
	const image = this.getImageData(0, 0, this.canvas.width, this.canvas.height)
	const pixels = Array.from({ length: image.data.length / 4 }, () => [])

	image.data.forEach((pixel, i) => {
		pixels[Math.floor(i / 4)].push(pixel)
		switch (i % 4) {
			case 0:
				pixels[Math.floor(i / 4)].r = pixel
				break
			case 1:
				pixels[Math.floor(i / 4)].g = pixel
				break
			case 2:
				pixels[Math.floor(i / 4)].b = pixel
				break
			case 3:
				pixels[Math.floor(i / 4)].a = pixel
				break
		}
	})

	pixels.rows = function () {
		const rows = Array.from({ length: image.height }, () => [])
		this.forEach((pixel, i) => { rows[Math.floor(i / image.width)].push(pixel) })
		return rows
	}

	pixels.columns = function () {
		const columns = Array.from({ length: image.width }, () => [])
		this.forEach((pixel, i) => { columns[i % image.width].push(pixel) })
		return columns
	}

	pixels.pixelAt = function (x, y) {
		if (x < 0 || y < 0) return false
		if (x > image.width || y > image.height) return false

		return this[x + y * image.width]
	}

	return pixels
}