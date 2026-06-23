const fs = require('fs');
const path = require('path');

const TARGET_DIR = process.cwd();
const EXCLUDED_DIRS = ['.git', 'node_modules', 'dist', 'dist2', '.cache', '.prisma_cache'];

function renameFilesAndDirectories(dir) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (err) {
        return;
    }

    // First process contents
    for (const file of files) {
        if (EXCLUDED_DIRS.includes(file)) continue;

        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue;
        }

        if (stat.isDirectory()) {
            renameFilesAndDirectories(fullPath);
        }
    }

    // Then rename current level items if needed
    files = fs.readdirSync(dir);
    for (const file of files) {
        if (EXCLUDED_DIRS.includes(file)) continue;

        const fullPath = path.join(dir, file);
        if (file.includes('tenant') || file.includes('Tenant') || file.includes('TENANT')) {
            let newFile = file;
            newFile = newFile.replace(/tenants/g, 'clients');
            newFile = newFile.replace(/Tenants/g, 'Clients');
            newFile = newFile.replace(/TENANTS/g, 'CLIENTS');
            newFile = newFile.replace(/tenant/g, 'client');
            newFile = newFile.replace(/Tenant/g, 'Client');
            newFile = newFile.replace(/TENANT/g, 'CLIENT');
            
            const newPath = path.join(dir, newFile);
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${fullPath} -> ${newPath}`);
        }
    }
}

function processContent(dir) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (err) {
        return;
    }

    for (const file of files) {
        if (EXCLUDED_DIRS.includes(file)) continue;

        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue;
        }

        if (stat.isDirectory()) {
            processContent(fullPath);
        } else {
            // Process file content
            if (file === 'rename_script.js' || file === '.env') continue;
            
            // Only process text files (skip png, etc)
            if (fullPath.endsWith('.png') || fullPath.endsWith('.pdf')) continue;

            try {
                let content = fs.readFileSync(fullPath, 'utf8');
                let originalContent = content;

                // NorthGate replacements
                content = content.replace(/NorthGate/g, 'Genius-Excel');
                content = content.replace(/Northgate/g, 'Genius-Excel');
                content = content.replace(/northgate/g, 'genius-excel');
                content = content.replace(/NORTHGATE/g, 'GENIUS_EXCEL');

                // Tenant replacements
                content = content.replace(/Tenants/g, 'Clients');
                content = content.replace(/tenants/g, 'clients');
                content = content.replace(/TENANTS/g, 'CLIENTS');
                content = content.replace(/Tenant/g, 'Client');
                content = content.replace(/tenant/g, 'client');
                content = content.replace(/TENANT/g, 'CLIENT');

                if (content !== originalContent) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Updated content: ${fullPath}`);
                }
            } catch (err) {
                console.error(`Error reading ${fullPath}: ${err.message}`);
            }
        }
    }
}

console.log('Renaming files and directories...');
renameFilesAndDirectories(TARGET_DIR);
console.log('Updating file contents...');
processContent(TARGET_DIR);
console.log('Done!');
