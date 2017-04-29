#!/usr/bin/env node

// Subcrawl3r - Search for sub-domains by crawling.
// Copyright (C) 2017 Pasu CHAN <cschanaj@connect.ust.hk>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
let thread = argv.thread || 4
let depth = argv.depth || 3
let debug = argv.debug

let myappend = function(src) {
	if(src != null && src.match(/^https?:/) != null) {
		if(src.indexOf('https:') !== -1) {
			src = src.replace(/^https:/, 'http:')
		}

		const myURL = new URL(src)
		const regex = new RegExp( '(?:\^|\\.)' + domain + '$')
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
		let keys = []
		for(var key in res) {
			keys.push({
				domain: key,
				data: Array.from(res[key])
			})
		}

		keys.sort(function(a, b) {
			let toka = a.domain.split('.')
			let tokb = b.domain.split('.')
			
			let tokalen = toka.length
			let tokblen = tokb.length

			while(tokalen != -1 && tokblen != -1) {
				if(toka[tokalen] === tokb[tokblen]) {
					tokalen--
					tokblen--
				} else {
					return toka[tokalen] < tokb[tokblen] ? -1 : 1
				}
			}
			return tokalen > tokblen ? 1 : -1
		})
		
		console.log(JSON.stringify(keys, null, 2))
	}
})

crawler.crawl(url)

