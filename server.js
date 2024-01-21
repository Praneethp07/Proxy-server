const express = require("express");
const puppeteer = require("puppeteer");
const replace = require("absolutify");
const winston = require("winston");
const path = require("path");
const fs = require("fs");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");
const app = express();

// Configure caching
const cacheMemory = new NodeCache({ stdTTL: 60 });


// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });
  
// Apply rate limiter to all requests
app.use(limiter);
  
// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});


app.get('/', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        app.use(express.static(path.join(__dirname, 'public')));
        const htmlFilePath = path.join(__dirname, 'public', 'index.html');
        fs.readFile(htmlFilePath, 'utf8', async (err, htmlContent) => {
            if (err) {
                logger.error(`Error reading HTML file: ${err}`);
                return res.status(500).send('Internal Server Error');
            }
            logger.info('Serving local HTML file');
            return res.send(htmlContent);
        });
    } else {
        try {
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: 'new' });
            const key = req.url;
            const KeyVal = key.split('=');
            const cachedResponse = cacheMemory.get(KeyVal[1]);

            if (cachedResponse) {
                logger.info(`User requested URL: ${url} | User Agent: ${req.get('user-agent')}`);
                console.log("cache-prax","this is cached content");
                // console.log(cacheMemory);
                return res.send(cachedResponse);
            }
            const page = await browser.newPage();
            await page.goto(`https://${url}`);
            let document = await page.evaluate(() => document.documentElement.outerHTML);
            document = replace(document, `/?url=${url.split('/')[0]}`);

            // Log the user data
            logger.info(`User requested URL: ${url} | User Agent: ${req.get('user-agent')}`);
            cacheMemory.set(KeyVal[1], document);
            return res.send(document);
        } catch (err) {
            logger.error(`Error: ${err}`);
            return res.send(err.toString());
        }
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


//praneeth