const promisify = require("util").promisify
const exec = promisify(require("child_process").exec)
const fs = require("fs")
const access = promisify(fs.access)
const mkdir = promisify(fs.mkdir)
const read = promisify(fs.readFile)
const write = promisify(fs.writeFile)

async function cat(path) {
	const out = await exec(`cat ${ path }`).catch(error => {
		// console.error(error)
	})
	// console.log(out.stdout)
	return out ? out.stdout.trim() : ""
}

async function main() {
	// console.log((await exec(`echo hello`)).stdout)
	await access("./log").catch(async err => {
		// console.log(err)
		console.log("making directory \"./log\"")
		await mkdir("./log")
	})
	const date = new Date()
	const filename = `./log/${ date.getFullYear() }-${ date.getMonth() + 1 }-${ date.getDate() }_${ date.getHours() }-${ date.getMinutes() }-${ date.getSeconds() }.log`
	let count = 0
	const interval = setInterval(async () => {
		const cpuTemp = [await cat("/sys/class/thermal/thermal_zone0/temp"), await cat("/sys/class/thermal/thermal_zone1/temp")]
		// const cpuTemp = [await cat("readme.md"), await cat("readme.md")]
		const logdate = new Date()
		const logstr = `${ logdate.getFullYear() }-${ logdate.getMonth() + 1 }-${ logdate.getDate() }_${ logdate.getHours() }-${ logdate.getMinutes() }-${ logdate.getSeconds() }: ${ cpuTemp[0] } ${ cpuTemp[1] }`
		await access(filename).catch(async err => {
			// console.log(err)
			console.log(`making file \"${ filename }\"`)
			await write(filename, "")
		})
		// console.log(await read(filename).catch(err => { console.log(err) }))
		await write(filename, await read(filename) + logstr + "\n")
		// await write(filename, logstr)
		if(++count >= 1440 * 2) clearInterval(interval)
		// console.log(interval, count)
	}, 60000)
}
main()
