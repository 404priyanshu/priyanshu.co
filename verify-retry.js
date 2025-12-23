
const { getBookmarks } = require('./src/lib/raindrop');

// Mock global fetch
const originalFetch = global.fetch;
let callCount = 0;

global.fetch = async (url, options) => {
    callCount++;
    console.log(`Fetch call #${callCount} to ${url}`);

    if (callCount <= 2) {
        console.log('Simulating 429 Too Many Requests');
        return {
            ok: false,
            status: 429,
            text: async () => 'Rate Limit Exceeded'
        };
    }

    console.log('Simulating 200 OK');
    return {
        ok: true,
        status: 200,
        json: async () => ({ items: [] })
    };
};

async function runTest() {
    console.log('Starting retry logic test...');

    try {
        // We need to import the module after mocking fetch, but since it's an ES module 
        // and we are in a CJS context (likely), we might need a different approach.
        // However, since the project uses Bun/Next.js, we can try running this with `bun`.

        // Actually, let's just copy the safeFetch logic here to test it in isolation 
        // if we can't easily import the module due to environment constraints.
        // But let's try to import first.

        // Wait, I can't easily import the ES module 'src/lib/raindrop.js' in a standalone script 
        // without proper setup. 
        // I will instead create a standalone test file that includes the safeFetch code 
        // modified for testing purposes, or just use the existing file if I can run it with bun.

        // Let's try running this script with `bun` which supports ES modules.
        // But I need to point to the right file.

        // Re-importing to ensure we use the mock
        // Note: In ES modules, imports are hoisted, so mocking global.fetch *before* import might work
        // if we use dynamic import.

        const { getBookmarks } = await import('./src/lib/raindrop.js');

        await getBookmarks();

        if (callCount === 3) {
            console.log('✅ Test Passed: Retried 2 times and succeeded on the 3rd.');
        } else {
            console.error(`❌ Test Failed: Expected 3 calls, got ${callCount}`);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test Failed with error:', error);
        process.exit(1);
    } finally {
        global.fetch = originalFetch;
    }
}

runTest();
