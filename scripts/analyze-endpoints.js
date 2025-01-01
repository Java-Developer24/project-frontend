import fs from 'fs';
import path from 'path';
import { Parser } from 'acorn';
import { simple as walk } from 'acorn-walk';
import acornJsx from 'acorn-jsx';

// Configuration for directories to scan
const config = {
    frontendDir: path.join(process.cwd(), 'src'),
    excludeDirs: ['node_modules', 'build', 'dist'],
    fileExtensions: ['.js', '.jsx', '.ts', '.tsx']
};

// Store found endpoints
const endpoints = new Map();

// Create a parser that supports JSX
const JSXParser = Parser.extend(acornJsx());

function extractEndpoints(fileContent, filename) {
    try {
        // Use JSXParser for both .jsx and .js files since they might contain JSX
        const ast = JSXParser.parse(fileContent, {
            sourceType: 'module',
            ecmaVersion: 2020,
            plugins: {
                jsx: true
            }
        }, { allowHashBang: true });

        walk.simple(ast, {
            CallExpression(node) {
                if (isHttpCall(node)) {
                    const endpoint = extractEndpointInfo(node);
                    if (endpoint) {
                        endpoints.set(endpoint.url, endpoint);
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error parsing ${path.relative(process.cwd(), filename)}:`, error.message);
    }
}

function isHttpCall(node) {
    // Simplified HTTP call detection
    if (node.callee.type === 'MemberExpression') {
        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        const method = node.callee.property?.name?.toLowerCase();
        return methods.includes(method);
    }

    if (node.callee.type === 'Identifier') {
        return node.callee.name === 'fetch';
    }

    return false;
}

function extractEndpointInfo(node) {
    let url;
    let method;

    // Extract URL
    if (node.arguments[0]) {
        if (node.arguments[0].type === 'Literal') {
            url = node.arguments[0].value;
        } else if (node.arguments[0].type === 'TemplateLiteral') {
            url = node.arguments[0].quasis
                .map(quasi => quasi.value.raw)
                .join('${...}');
        }
    }

    // Extract method
    if (node.callee.type === 'MemberExpression') {
        method = node.callee.property.name;
    }

    if (!url || (!url.includes('/api/') && !url.startsWith('http'))) {
        return null;
    }

    return {
        url,
        method: method?.toLowerCase() || 'get',
        purpose: 'TBD',
        requestSchema: {},
        responseSchema: {}
    };
}

function scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
        throw new Error(`Directory not found: ${dir}`);
    }

    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !config.excludeDirs.includes(file)) {
            scanDirectory(fullPath);
        } else if (config.fileExtensions.includes(path.extname(file))) {
            console.log(`Analyzing file: ${path.relative(process.cwd(), fullPath)}`);
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                extractEndpoints(content, fullPath);
            } catch (error) {
                console.error(`Error processing ${path.relative(process.cwd(), fullPath)}:`, error.message);
            }
        }
    });
}

function generateDocumentation() {
    let documentation = '# Frontend-Backend API Endpoint Mapping\n\n';
    
    endpoints.forEach((endpoint, url) => {
        documentation += `## ${endpoint.method.toUpperCase()} ${url}\n\n`;
        documentation += `- Purpose: ${endpoint.purpose}\n`;
        documentation += `- Request Body: ${JSON.stringify(endpoint.requestSchema, null, 2)}\n`;
        documentation += `- Response: ${JSON.stringify(endpoint.responseSchema, null, 2)}\n\n`;
    });
    
    fs.writeFileSync('frontend_backend_mapping.txt', documentation);
}

// Main execution
try {
    console.log('Starting API endpoint analysis...');
    scanDirectory(config.frontendDir);
    generateDocumentation();
    console.log('Analysis complete. Check frontend_backend_mapping.txt for results.');
} catch (error) {
    console.error('Error during analysis:');
    console.error(error.message);
    process.exit(1);
} 