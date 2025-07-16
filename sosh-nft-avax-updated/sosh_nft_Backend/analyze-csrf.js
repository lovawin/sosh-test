const http = require('http');

// Force immediate console output
const log = (...args) => {
    console.log(...args);
    process.stdout.write('');
};

log('Starting CSRF analysis...');

// Function to make HTTP request and return response
const makeRequest = (path, method = 'GET', headers = {}, body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8500,
            path: path,
            method: method,
            headers: {
                'Authorization': 'Basic ' + Buffer.from('admin:pass').toString('base64'),
                'Accept': '*/*',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            log(`Response status for ${method} ${path}:`, res.statusCode);
            log(`Response headers for ${method} ${path}:`, res.headers);
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(body);
        }
        req.end();
    });
};

// Function to analyze JavaScript content for CSRF-related code
const analyzeCsrfInJs = (content) => {
    const patterns = [
        // CSRF token patterns
        /csrf/gi,
        /xsrf/gi,
        /_token/gi,
        // Header patterns
        /headers\['x-csrf/gi,
        /headers\['csrf/gi,
        /\.csrf/gi,
        /csrfToken/gi,
        // Form submission patterns
        /form\.submit/gi,
        /\$\.ajax/gi,
        /fetch\(/gi,
        /XMLHttpRequest/gi,
        // Event handlers
        /addEventListener\(['"](submit|click)['"]/gi,
        /on(submit|click)=/gi,
        // Method override patterns
        /_method.*delete/gi,
        /_method.*put/gi
    ];

    log('\nAnalyzing JavaScript content...');
    patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            log(`\nFound ${matches.length} matches for pattern ${pattern}:`);
            // Get surrounding context for each match
            const lines = content.split('\n');
            let foundInLines = new Set();
            for (let i = 0; i < lines.length; i++) {
                if (pattern.test(lines[i])) {
                    foundInLines.add(i);
                    // Include more lines of context
                    for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 3); j++) {
                        foundInLines.add(j);
                    }
                }
            }
            // Log lines with context
            let lastLineNum = -1;
            Array.from(foundInLines).sort((a, b) => a - b).forEach(lineNum => {
                // Add a separator between non-consecutive blocks
                if (lastLineNum !== -1 && lineNum > lastLineNum + 1) {
                    log('...');
                }
                log(`Line ${lineNum + 1}: ${lines[lineNum].trim()}`);
                lastLineNum = lineNum;
            });
        }
    });
};

// Get main page and analyze bundles
const mainPageReq = http.request({
    hostname: 'localhost',
    port: 8500,
    path: '/api',
    method: 'GET',
    headers: {
        'Authorization': 'Basic ' + Buffer.from('admin:pass').toString('base64'),
        'Accept': 'text/html,application/json,application/xhtml+xml'
    }
}, async res => {
    log('Analysis script started, waiting for results...');
    log('Response status for /api:', res.statusCode);
    log('Response headers for /api:', res.headers);

    let sessionCookie;
    if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0].split(';')[0];
        log('Got session cookie:', sessionCookie);

        // Get and analyze vendor bundle
        log('\nFetching vendor bundle...');
        const vendorReq = http.request({
            hostname: 'localhost',
            port: 8500,
            path: '/api/public/vendor-93f5fc3ae20e0dfd68cb.min.js',
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from('admin:pass').toString('base64'),
                'Accept': 'application/javascript',
                'Cookie': sessionCookie
            }
        }, vendorRes => {
            log('Response status for /api/public/vendor-93f5fc3ae20e0dfd68cb.min.js:', vendorRes.statusCode);
            log('Response headers for /api/public/vendor-93f5fc3ae20e0dfd68cb.min.js:', vendorRes.headers);

            let vendorData = '';
            vendorRes.on('data', chunk => {
                vendorData += chunk;
            });

            vendorRes.on('end', () => {
                log('\nAnalyzing vendor bundle for CSRF-related code...');
                analyzeCsrfInJs(vendorData);

                // Now get index bundle
                const indexReq = http.request({
                    hostname: 'localhost',
                    port: 8500,
                    path: '/api/public/index-56afe067afbbbde795be.min.js',
                    method: 'GET',
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from('admin:pass').toString('base64'),
                        'Accept': 'application/javascript',
                        'Cookie': sessionCookie
                    }
                }, indexRes => {
                    log('\nFetching index bundle...');
                    log('Response status for /api/public/index-56afe067afbbbde795be.min.js:', indexRes.statusCode);
                    log('Response headers for /api/public/index-56afe067afbbbde795be.min.js:', indexRes.headers);

                    let indexData = '';
                    indexRes.on('data', chunk => {
                        indexData += chunk;
                    });

                    indexRes.on('end', () => {
                        log('\nAnalyzing index bundle for CSRF-related code...');
                        analyzeCsrfInJs(indexData);
                    });
                });

                indexReq.end();
            });
        });

        vendorReq.end();
    } else {
        log('No session cookie received');
    }
});

mainPageReq.end();
