#!/usr/bin/env node

const fs = require("fs");
const url = require("url");
const path = require("path");
const mime = require("mime");
const https = require("https");

const options = {
	key: fs.readFileSync("./ssl/key.pem"),
	cert: fs.readFileSync("./ssl/cert.pem")
};

const server = https.createServer(options, (req, res) => {
	const pathname = url.parse(req.url).pathname;
	const file = path.join("./dist/", pathname);
	fs.readFile(file, "utf8", (error, data) => {
		if (error) {
			res.writeHead(500, {
				"Content-Type": "application/json"
			});
			res.write(JSON.stringify(error));
			res.end();
		} else {
			res.writeHead(200, {
				"Content-Type": mime.getType(file)
			});
			res.write(data);
			res.end();
		}
	});
});
server.listen(8443);
