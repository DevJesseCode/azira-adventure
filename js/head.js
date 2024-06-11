function wait(time = 1000) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => resolve(true), time)
    })
}