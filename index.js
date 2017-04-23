#!/usr/bin/env node

'use strict';

const Crawler = require('easycrawler')
const cheerio = require('cheerio')
const argv = require('yargs').argv
const URL = require('url').URL

let res = new Map()
let url = argv.url

if(url != null && url.match(/^http/) != null) {
	url = url.replace(/^https?:/, 'http:')
} else {
	url = 'http://' + url
}

let domain = argv.domain || argv.url
let keyOnly = argv.keyOnly != null ? true : false
let thread = argv.thread || 4
let depth = argv.depth || 3
let debug = argv.debug

let myappend = function(src) {
	if(src != null && src.match(/^https?:/) != null) {
		if(src.indexOf('https:') !== -1) {
			src = src.replace(/^https:/, 'http:')
		}

		const myURL = new URL(src)
		const regex = new RegExp(domain + '$')
		const hostname = myURL.hostname

		if(hostname.match(regex) != null) {
			if(res.has(hostname) == false) {
				res[hostname] = new Set()
			}

			res[hostname].add(src)
		}
	}
}

let crawler = new Crawler({
	thread: thread,
	logs: debug,
	depth: depth,

	headers: {
		'user-agent': 'libcurl/7.51.0'
	},

	onlyCrawl: [
		domain
	],

	onSuccess: function(data) {
		let $ = cheerio.load(data.body)

		let myfunc = function(className, attribute) {
			$(className).each(function(){
				var src = $(this).attr(attribute)
				if(src != null) {
					myappend(src)
				}
			})
		}

		myfunc('audio', 'src')
		myfunc('embed', 'src')
		myfunc('form', 'action')
		myfunc('iframe', 'src')
		myfunc('img', 'src')
		myfunc('link', 'href')
		myfunc('object', 'data')
		myfunc('param', 'value')
		myfunc('script', 'src')
		myfunc('source', 'src')
		myfunc('video', 'src')

		// also works on the effective URLs
		myappend(data.response.request.uri.href)
	},

	onError: function(data) {
		// do nothing, nothing need anyway.
		console.log(data)
	},

	onFinished: function(urls) {
		// works on the URL(s)
		const arr_q = urls.crawled
		const arr_d = urls.discovered

		arr_q.forEach(function(element, index, arr) {
			myappend(element)
		})

		arr_d.forEach(function(element, index, arr) {
			myappend(element)
		})

		// constructs sorted array of URL(s)
		if(keyOnly) {
			let keys = []
			for(var key in res) {
				keys.push(key)
			}

			keys.sort(function(a, b) {
				let toka = a.split('.')
				let tokb = b.split('.')

				let tokalen = toka.length - 1
				let tokblen = tokb.length - 1

				while(tokalen >= 0 && tokblen >= 0) {
					if(toka[tokalen] != tokb[tokalen]) {
						return toka[tokalen] < tokb[tokblen] ? -1 : 1
					} else {
						tokalen = tokalen - 1
						tokblen = tokblen - 1
					}
				}
				return tokalen - tokblen ? -1 : 1
			})

			keys.forEach(function(element, index, arr) {
				console.log(element)
			})
		} else {
			console.log(res)
		}
	}
})

crawler.crawl(url)

