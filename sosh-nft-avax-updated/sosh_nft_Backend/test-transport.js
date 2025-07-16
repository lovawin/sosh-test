const http = require('http');

// Force immediate console output
const log = (...args) => {
    console.log(...args);
    process.stdout.write('');
};

log('Starting test script...');

// Request to get main page and look for CSRF token
const req = http.request({
    hostname: 'sosh_nft_backend-mongo-express-1',
    port: 8081,
    path: '/api',
    method: 'GET',
    headers: {
        'Authorization': 'Basic ' + Buffer.from('admin:pass').toString('base64'),
        'Accept': 'text/html,application/json'
    }
}, (res) => {
    log('Response status:', res.statusCode);
    log('Response headers:', res.headers);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            // Log the full response for debugging
            log('Full response body:', data);
            
            // Look for CSRF token in various forms
            const patterns = [
                // Standard CSRF meta tag
                /<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i,
                // Alternate meta tag format
                /<meta\s+name=["']_csrf["']\s+content=["']([^"']+)["']/i,
                // Hidden input field
                /<input\s+[^>]*name=["']_csrf["'][^>]*value=["']([^"']+)["']/i,
                /<input\s+[^>]*value=["']([^"']+)["'][^>]*name=["']_csrf["']/i,
                // JavaScript variable
                /var\s+csrf(?:Token)?\s*=\s*["']([^"']+)["']/i,
                /window\.csrf(?:Token)?\s*=\s*["']([^"']+)["']/i,
                // Data attribute
                /data-csrf(?:token)?=["']([^"']+)["']/i
            ];

            log('Looking for CSRF token...');
            patterns.forEach((pattern, index) => {
                const match = data.match(pattern);
                if (match) {
                    log(`Found CSRF token with pattern ${index}:`, match[1]);
                }
            });

            // Look for any forms that might contain the token
            const formMatches = data.match(/<form[^>]*>[\s\S]*?<\/form>/gi);
            if (formMatches) {
                log('Found forms in response:');
                formMatches.forEach((form, index) => {
                    log(`Form ${index}:`, form);
                });
            }

            // Look for any script tags that might set the token
            const scriptMatches = data.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
            if (scriptMatches) {
                log('Found scripts in response:');
                scriptMatches.forEach((script, index) => {
                    if (script.includes('csrf') || script.includes('CSRF')) {
                        log(`Script ${index} with potential CSRF token:`, script);
                    }
                });
            }

            // Check HTML head section specifically
            const headMatch = data.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
            if (headMatch) {
                log('Head section:', headMatch[1]);
            }

        } catch (err) {
            log('Error processing response:', err);
        }
    });
});

req.on('error', (error) => {
    log('Request error:', error);
});

req.end();

log('Test script setup complete, waiting for response...');
