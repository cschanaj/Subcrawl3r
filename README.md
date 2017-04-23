# Subcrawl3r
Search for sub-domains by crawling.

## Introduction

This is a personal project for domain enumeration tool for the purpose of automatic HTTPS-Everywhere ruleset generation. 

Remark: **THIS IS NOT** functionally equivalent to Sublist3r by **@about3la**. If you are looking for Sublist3r, please go to https://github.com/aboul3la/Sublist3r


## Installation
```bash
$ npm install
```

## Usage
```bash
$ nodejs index.js --url 'http://homepage-or-a-working-url.example.com/' \
  --domain 'example.com' --depth 3 --threads 4 
```

## Remark
Subcrawl3r **IS NOT** functionally equivalent to Sublist3r by **@about3la** in the sense that this implementation does not utilize search engines nor DNS/rDNS services. 

If you are looking for Sublist3r, please go to https://github.com/aboul3la/Sublist3r
