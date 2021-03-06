const https = require("https");
const http = require("http");
const axios = require("axios").default;
const url = require("url");
const fs = require("fs");
const qs = require("querystring");
const path = require("path");
module.exports = {
  start: async (client, ops) => {
    const httpServer = http.createServer((req, res) => {
      let parsed = url.parse(req.url, true);
      if (parsed.pathname.startsWith("/.well-known/acme-challenge/")) {
        fs.readFile(
          `./.well-known/acme-challenge/${path.parse(parsed.pathname).base}`,
          "utf8",
          (err, data) => {
            if (err) {
              res.writeHead(404, {
                // 'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
              });
              res.end("404 Not Found");
              return;
            }
            res.writeHead(200);
            res.end(data);
          }
        );
      } else {
        res.writeHead(302, {
          Location: `https://${req.headers.host}${req.url}`,
        });
        res.end();
      }
    });
    httpServer.listen(8080, () => {
      console.log("http server started");
    });
    const httpsServer = https.createServer(
      {
        cert: fs.readFileSync(
          "/etc/letsencrypt/live/manager.intteam.co.kr/fullchain.pem"
        ),
        key: fs.readFileSync(
          "/etc/letsencrypt/live/manager.intteam.co.kr/privkey.pem"
        ),
      },
      (req, res) => {
        let parsed = url.parse(req.url, true);
        if (parsed.pathname.startsWith("/static/")) {
          if (parsed.pathname.startsWith("/static/html/")) {
            fs.readFile(
              `./assets/html/${path.parse(parsed.pathname).base}`,
              "utf8",
              (err, data) => {
                if (err) {
                  res.writeHead(404, {
                    "strict-transport-security":
                      "max-age=86400; includeSubDomains; preload",
                  });
                  res.end("404 Not Found");
                  return;
                }
                res.writeHead(200, {
                  "Content-Type": "text/html; charset=UTF-8",
                  "strict-transport-security":
                    "max-age=86400; includeSubDomains; preload",
                });
                res.end(data);
              }
            );
          } else if (parsed.pathname.startsWith("/static/css/")) {
            fs.readFile(
              `./assets/css/${path.parse(parsed.pathname).base}`,
              "utf8",
              (err, data) => {
                if (err) {
                  res.writeHead(404, {
                    "strict-transport-security":
                      "max-age=86400; includeSubDomains; preload",
                  });
                  res.end("404 Not Found");
                  return;
                }
                res.writeHead(200, {
                  "Content-Type": "text/css; charset=UTF-8",
                  "strict-transport-security":
                    "max-age=86400; includeSubDomains; preload",
                });
                res.end(data);
              }
            );
          } else if (parsed.pathname.startsWith("/static/js/")) {
            fs.readFile(
              `./assets/js/${path.parse(parsed.pathname).base}`,
              "utf8",
              (err, data) => {
                if (err) {
                  res.writeHead(404, {
                    "strict-transport-security":
                      "max-age=86400; includeSubDomains; preload",
                  });
                  res.end("404 Not Found");
                  return;
                }
                res.writeHead(200, {
                  "Content-Type": "text/javascript; charset=UTF-8",
                  "strict-transport-security":
                    "max-age=86400; includeSubDomains; preload",
                });
                res.end(data);
              }
            );
          } else if (parsed.pathname.startsWith("/static/image/")) {
            fs.readFile(
              `./assets/image/${path.parse(parsed.pathname).base}`,
              (err, data) => {
                if (err) {
                  res.writeHead(404, {
                    "strict-transport-security":
                      "max-age=86400; includeSubDomains; preload",
                  });
                  res.end("404 Not Found");
                  return;
                }
                res.writeHead(200, {
                  "Content-Type": "image/png",
                  "strict-transport-security":
                    "max-age=86400; includeSubDomains; preload",
                });
                res.end(data);
              }
            );
          } else if (parsed.pathname.startsWith("/static/json/")) {
            fs.readFile(
              `./assets/json/${path.parse(parsed.pathname).base}`,
              (err, data) => {
                if (err) {
                  res.writeHead(404, {
                    "strict-transport-security":
                      "max-age=86400; includeSubDomains; preload",
                  });
                  res.end("404 Not Found");
                  return;
                }
                res.writeHead(200, {
                  "Content-Type": "application/json; charset=UTF-8",
                  "strict-transport-security":
                    "max-age=86400; includeSubDomains; preload",
                });
                res.end(data);
              }
            );
          } else {
            res.writeHead(404, {
              "strict-transport-security":
                "max-age=86400; includeSubDomains; preload",
            });
            res.end("404 Not Found");
          }
        } else if (parsed.pathname == "/manifest.json") {
          res.writeHead(200, {
            "content-type": "application/json; charset=UTF-8",
            "strict-transport-security":
              "max-age=86400; includeSubDomains; preload",
          });
          fs.readFile("./assets/json/manifest.json", "utf8", (err, data) => {
            res.end(data);
          });
        } else if (parsed.pathname == "/serviceWorker.js") {
          res.writeHead(200, {
            "content-type": "text/javascript; charset=UTF-8",
            "strict-transport-security":
              "max-age=86400; includeSubDomains; preload",
          });
          fs.readFile("./assets/js/serviceWorker.js", "utf8", (err, data) => {
            res.end(data);
          });
        } else {
          if (
            req.headers["user-agent"] &&
            (req.headers["user-agent"].includes("MSIE") ||
              req.headers["user-agent"].includes("rv:11.0"))
          ) {
            res.writeHead(200, {
              "Content-Type": "text/html; charset=UTF-8",
              "strict-transport-security":
                "max-age=86400; includeSubDomains; preload",
            });
            fs.readFile("./assets/html/ie.html", "utf8", (err, data) => {
              res.end(data);
            });
            return;
          }
          if (client.paths.get(parsed.pathname)) {
            if (client.paths.get(parsed.pathname).method == req.method) {
              client.paths
                .get(parsed.pathname)
                .run(client, req, res, parsed, ops);
            } else {
              res.writeHead(405, {
                "strict-transport-security":
                  "max-age=86400; includeSubDomains; preload",
              });
              res.end("405 Method Not Allowed");
            }
          } else {
            res.writeHead(404, {
              "strict-transport-security":
                "max-age=86400; includeSubDomains; preload",
            });
            res.end("404 Not Found");
          }
        }
      }
    );
    httpsServer.listen(8443, () => {
      console.log("https server started");
    });
    const io = require("socket.io")(httpsServer);
    io.on("connection", (socket) => {
      socket.on("notifySubscription", (data) => {
        let dbFile = require("data/notifications.json");
        dbFile.subscriptions.push(data);
        fs.writeFile(
          "data/notifications.json",
          JSON.stringify(dbFile),
          () => {}
        );
      });
      socket.on("callNotifySubscription-int", (data) => {
        console.log("a");
        let dbFile = require("data/callint.json");
        dbFile.subscriptions.push(data);
        fs.writeFile("data/callint.json", JSON.stringify(dbFile), () => {});
      });
      socket.on("callNotifySubscription-CSH", (data) => {
        console.log("b");
        let dbFile = require("data/callCSH.json");
        dbFile.subscriptions.push(data);
        fs.writeFile("data/callCSH.json", JSON.stringify(dbFile), () => {});
      });
      socket.on("callNotifySubscription-mswgen", (data) => {
        console.log("c");
        let dbFile = require("data/callmswgen.json");
        dbFile.subscriptions.push(data);
        fs.writeFile("data/callmswgen.json", JSON.stringify(dbFile), () => {});
      });
    });
  },
};
