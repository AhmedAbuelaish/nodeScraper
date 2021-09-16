// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                How To
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Command line:
// node vessekSearch.js [vesselName] [pagenumber: optional] [--new: optional]
// vesselName: use '%' instead of 'space'
//

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                Dependencies
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const { start } = require('repl')
// const async = require('async')

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//            Node Command Line Inputs
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const vesselName = process.argv[2] // <------------- use '%' instead of 'space'
var pageNumber = process.argv[3] // <-------------- default = 1
var fileCommand = process.argv[4] // <------------- use '--new' to erase previous results and replace
var firstImg = 1
var imgNumber = 1
// check if optional argument 3 exists
if (isNaN(process.argv[3])) {
	pageNumber = 1
	fileCommand = process.argv[3]
}
// if (pageNumber) {
// 	firstImg = (pageNumber - 1) * 30 + 1
// }

for (var i = 1; i <= pageNumber; i++) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                Scraping Target
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	const searchURL = `https://www.vesselfinder.com/vessels?name=${vesselName}`
	const parentURL = 'https://www.vesselfinder.com'
	var vesselURL, vesselNameSpaces, vesselCoordinates
	const header = {
		'user-agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
	}

	const aclass = '.ship-link'
	const txtclass = '.text2'
	const beginningTextMarker = 'coordinates '
	const endTextMarker = ')'

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Scraper for URL
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Run the scraper function
	getVesselURL()

	// Scraper function
	function getVesselURL() {
		console.log(`1`)
		// Returns an array of data items
		console.log(`[Requesting...]`, searchURL)

		request({ url: searchURL, headers: header }, (error, response, html) => {
			console.log(`2`)
			if (!error && response.statusCode == 200) {
				const $ = cheerio.load(html)
				const dataArray = []
				console.log(`3`)
				$(aclass).each(async function (i, el) {
					var dataItem = $(el)[0].attribs.href
					console.log(`4`)
					// Push the result into an array
					vesselNameSpaces = vesselName.replace('+', ' ')
					vesselURL = parentURL + '' + dataItem
					console.log(`5`)
					vesselCoordinates = await getVesselCoordinates(vesselURL)
					console.log(`10`)
					dataArray.push(vesselNameSpaces + ',' + vesselURL + ',' + vesselCoordinates + '\n')
				})

				// ~~~~~~~~~~SAVE DATA OPTIONS~~~~~~~~~~~~~~~~~~
				console.log(`11`)
				writeToFile(dataArray + ',', 'data/data.csv')
			} else {
				throw response.statusCode
			}
		})
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                    Scraper for coordinates
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// Scraper function
	function getVesselCoordinates(vURL) {
		// Returns an array of data items
		console.log(`6`)
		console.log(`[Requesting...]`, vURL)
		console.log(`7`)
		request({ url: vURL, headers: header }, (error, response, html) => {
			if (!error && response.statusCode == 200) {
				const $ = cheerio.load(html)
				console.log(`8`)
				$(txtclass).each(function (i, el) {
					var scrapedText = $(el).text().trim()
					var startI = scrapedText.search(beginningTextMarker) + beginningTextMarker.length
					var coordinateString = scrapedText.substring(startI, scrapedText.indexOf(endTextMarker, startI))
					coordinateString = coordinateString.replace(' /', ',')
					console.log(`coordinateString`, coordinateString)
					console.log(`9`)

					return new Promise((resolve) => resolve(coordinateString))
				})
			} else {
				throw response.statusCode
			}
		})
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                File Functions
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function writeToFile(dataToWrite, fileName) {
		if (fileCommand == '--new') {
			fs.writeFile(fileName, dataToWrite, (err) => {
				if (err) {
					return console.log(err)
				}
				console.log(`[Saved] ${vesselName} data into ${fileName}`)
			})
		} else {
			fs.appendFile(fileName, dataToWrite, (err) => {
				if (err) {
					return console.log(err)
				}
				console.log(`[Appended] ${vesselName} data into ${fileName}`)
			})
		}
	}

	// End for loop
}
