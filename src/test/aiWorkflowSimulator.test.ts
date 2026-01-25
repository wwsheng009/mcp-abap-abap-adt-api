/**
 * AI Client Workflow Simulator
 * This test demonstrates the complete AI workflow when using V2 handlers
 */

import { ADTClient, session_types } from 'abap-adt-api';
import { ObjectSourceHandlersV2 } from '../handlersV2/ObjectSourceHandlersV2';
import { testConfig, testObjects, skipIfNoConfig, checkObjectExists } from './setup';
import { TestObjectManager } from './testObjectManager';

describe('AI Client Workflow Simulator', () => {
  let client: ADTClient;
  let handler: ObjectSourceHandlersV2;
  let testObjManager: TestObjectManager;
  let autoCreatedObjects = false;

  const hasConfig = !skipIfNoConfig();

  beforeAll(async () => {
    if (!hasConfig) {
      console.warn('SAP connection not configured. Skipping workflow simulation.');
      return;
    }

    console.log('\n=== Initializing SAP Connection ===');

    client = new ADTClient(
      testConfig.sapUrl,
      testConfig.sapUser,
      testConfig.sapPassword,
      testConfig.sapClient,
      testConfig.sapLanguage
    );

    await client.login();
    console.log('[Setup] Login successful');

    // Enable stateful mode for lock/delete operations
    client.stateful = session_types.stateful;
    console.log('[Setup] Stateful mode enabled');

    handler = new ObjectSourceHandlersV2(client);
    testObjManager = new TestObjectManager(client, testConfig.transport);

    // Check if test objects exist
    let programExists = await checkObjectExists(client, testObjects.programUrl);
    let classExists = await checkObjectExists(client, testObjects.classUrl);

    console.log(`[Setup] Test program exists: ${programExists}`);
    console.log(`[Setup] Test class exists: ${classExists}`);

    // Always try to delete test objects before creating new ones
    console.log('\n=== Cleaning Up Existing Test Objects ===');
    try {
      console.log('[Setup] Attempting to delete test program...');
      await testObjManager.deleteObjectByUrl(testObjects.programUrl, testObjects.programName);
    } catch (error: any) {
      console.log(`[Setup] Program delete: ${error.message}`);
    }
    try {
      console.log('[Setup] Attempting to delete test class...');
      await testObjManager.deleteObjectByUrl(testObjects.classUrl, testObjects.className);
    } catch (error: any) {
      console.log(`[Setup] Class delete: ${error.message}`);
    }
    console.log('[Setup] Cleanup attempt completed\n');

    // Reset existence flags after cleanup attempt
    programExists = false;
    classExists = false;

    // Create test objects in $TMP package
    console.log('\n=== Creating Test Objects in $TMP ===');
    try {
      if (!programExists) {
        await testObjManager.createTestProgram(
          'ZTEST_MCP_V2',
          TestObjectManager.getDefaultProgramSource(),
          '$TMP',
          'MCP V2 Test Program'
        );
        autoCreatedObjects = true;
        programExists = true;
      }
      if (!classExists) {
        await testObjManager.createTestClass(
          'ZCL_MCP_TEST_V2',
          TestObjectManager.getDefaultClassSource(),
          '$TMP',
          'MCP V2 Test Class'
        );
        autoCreatedObjects = true;
        classExists = true;
      }
      console.log('[Setup] Test objects created successfully\n');
    } catch (error: any) {
      console.warn(`[Setup] Creation failed: ${error.message}`);
      console.warn('[Setup] Tests will be skipped\n');
    }
  }, 60000);

  afterAll(async () => {
    // Always clean up test objects after tests complete
    if (client && testObjManager) {
      console.log('\n=== Cleaning Up Test Objects ===');
      try {
        await testObjManager.cleanup();
        console.log('[Setup] Cleanup completed');
      } catch (error: any) {
        console.error('[Setup] Cleanup failed:', error.message);
      }
    }

    if (client && client.loggedin) {
      await client.logout();
      console.log('[Setup] Logged out');
    }
  }, 60000);

  /**
   * Complete AI workflow:
   * 1. User asks AI to modify a specific method in a CLASS
   * 2. AI reads the CLASS structure
   * 3. AI searches for the method
   * 4. AI reads the method implementation
   * 5. AI generates the modification
   * 6. AI locks the object
   * 7. AI applies the modification
   * 8. AI unlocks the object
   */
  test('Complete AI workflow: Modify a CLASS method', async () => {
    if (!hasConfig) {
      console.warn('Test skipped: No SAP configuration');
      return;
    }

    // Check if test class exists
    const classExists = await checkObjectExists(client, testObjects.classUrl);
    if (!classExists) {
      console.warn('Test skipped: Test class does not exist');
      return;
    }

    console.log('\n=== AI Client Workflow Simulation ===\n');

    // Step 1: User request
    const userRequest = 'Add error handling to the CALCULATE_RESULT method in ZCL_MCP_TEST_V2';
    console.log(`[User] ${userRequest}`);
    console.log('[AI] Understanding request...');

    // Step 2: AI reads CLASS structure to get metadata
    console.log('[AI] Step 1: Reading CLASS structure...');
    const structureResult = await handler.handle('getObjectSourceV2', {
      objectUrl: testObjects.classUrl,
      includeType: 'definitions',
      startLine: 1,
      endLine: 50
    });

    const structureData = JSON.parse(structureResult.content[0].text);
    console.log(`[AI] - Read ${structureData.data.lineCount} lines from definitions`);
    console.log(`[AI] - Got token: ${structureData.data.token.substring(0, 30)}...`);

    // Step 3: AI searches for the method
    console.log('[AI] Step 2: Searching for method definition...');
    const grepResult = await handler.handle('grepObjectSource', {
      objectUrl: testObjects.classUrl,
      includeType: 'definitions',
      pattern: 'METHODS.*calculate',
      caseInsensitive: true,
      contextLines: 1
    });

    const grepData = JSON.parse(grepResult.content[0].text);
    console.log(`[AI] - Found ${grepData.data.matchCount} matches`);

    let methodLineNumber = -1;
    for (const match of grepData.data.matches) {
      console.log(`[AI] - Line ${match.lineNumber}: ${match.content.trim()}`);
      methodLineNumber = match.lineNumber;
    }

    if (methodLineNumber === -1) {
      console.log('[AI] Method not found. Creating a new test scenario...');
      // For demo, use a different approach
      methodLineNumber = 10;
    }

    // Step 4: AI reads the implementation
    console.log('[AI] Step 3: Reading method implementation...');
    const implResult = await handler.handle('getObjectSourceV2', {
      objectUrl: testObjects.classUrl,
      includeType: 'implementations',
      startLine: 1,
      endLine: 100
    });

    const implData = JSON.parse(implResult.content[0].text);
    const implLines = implData.data.content.split('\n');
    console.log(`[AI] - Read ${implLines.length} lines from implementations`);
    console.log(`[AI] - First few lines:`);
    implLines.slice(0, 5).forEach((line: string) => console.log(`   ${line}`));

    // Step 5: AI generates modification
    console.log('[AI] Step 4: Generating modification...');
    const newMethodImplementation = `  METHOD calculate_result.
* Added error handling by AI at ${new Date().toISOString()}
    DATA: lv_result TYPE i.

    TRY.
        " Original calculation logic
        lv_result = mv_value1 + mv_value2.
        mr_result = lv_result.

      CATCH cx_root INTO DATA(lx_error).
        " Log error
        WRITE: / 'Error in calculation:', lx_error->get_text( ).
        RAISE EXCEPTION TYPE cx_sy_arithmetic_error.
    ENDTRY.
  ENDMETHOD.`;

    console.log('[AI] - Generated new implementation:');
    console.log(newMethodImplementation.split('\n').map(l => `   ${l}`).join('\n'));

    // Step 6: Lock the object
    console.log('[AI] Step 5: Locking object...');
    const lock = await client.lock(testObjects.classUrl, 'MODIFY');
    console.log(`[AI] - Acquired lock: ${lock.LOCK_HANDLE}`);

    try {
      // Step 7: Apply modification (for demo, just read to verify token)
      console.log('[AI] Step 6: Verifying token before modification...');

      // Get fresh token for implementation
      const freshTokenResult = await handler.handle('getObjectSourceV2', {
        objectUrl: testObjects.classUrl,
        includeType: 'implementations'
      });

      const freshTokenData = JSON.parse(freshTokenResult.content[0].text);
      const token = freshTokenData.token;
      console.log(`[AI] - Fresh token: ${token.substring(0, 30)}...`);

      // Verify token is still valid
      const cache = handler.getCache();
      const isValid = cache.validateToken(
        `${testObjects.classUrl}#implementations`,
        token
      );
      console.log(`[AI] - Token valid: ${isValid}`);

      // Simulate modification (commented out to avoid actual changes)
      /*
      const setResult = await handler.handle('setObjectSourceV2', {
        objectUrl: testObjects.classUrl,
        includeType: 'implementations',
        token: token,
        startLine: 1,
        endLine: implLines.length,
        content: newMethodImplementation,
        lockHandle: lock.LOCK_HANDLE
      });

      const setData = JSON.parse(setResult.content[0].text);
      console.log(`[AI] - Modification result: ${setData.data.updated}`);
      */

      console.log('[AI] Step 7: Modification skipped (demo mode)');

    } finally {
      // Step 8: Always unlock
      console.log('[AI] Step 8: Unlocking object...');
      await client.unLock(testObjects.classUrl, lock.LOCK_HANDLE);
      console.log('[AI] - Lock released');
    }

    console.log('\n[AI] Workflow completed successfully!');
    console.log('[AI] Summary:');
    console.log('  - Read structure with token');
    console.log('  - Searched for method');
    console.log('  - Read implementation');
    console.log('  - Generated new code');
    console.log('  - Validated token');
    console.log('  - Skipped actual modification (demo mode)');
  }, 30000);

  /**
   * Demonstrate cache behavior across multiple operations
   */
  test('Cache behavior demonstration', async () => {
    if (!hasConfig) {
      console.warn('Test skipped: No SAP configuration');
      return;
    }

    console.log('\n=== Cache Behavior Demo ===\n');

    const cache = handler.getCache();

    // Initial state
    console.log('[Cache] Initial state:');
    console.log(`  - Size: ${cache.size}`);
    console.log(`  - Entries: ${cache.getStats().entries.length}`);

    // Read different parts of the CLASS
    console.log('\n[Cache] Reading different includes...');

    const includes = ['definitions', 'main', 'implementations', 'testclasses'] as const;

    for (const include of includes) {
      try {
        await handler.handle('getObjectSourceV2', {
          objectUrl: testObjects.classUrl,
          includeType: include
        });
        console.log(`[Cache] - Cached ${include}`);
      } catch (e: any) {
        console.log(`[Cache] - ${include} not available: ${e.message}`);
      }
    }

    console.log('\n[Cache] Final state:');
    const stats = cache.getStats();
    console.log(`  - Size: ${cache.size}`);
    console.log(`  - Entries:`);

    for (const entry of stats.entries) {
      console.log(`    - ${entry.key}: ${entry.lineCount} lines, TTL: ${entry.ttl}ms`);
    }

    // Demonstrate token validation
    console.log('\n[Cache] Token validation demo:');
    const entry = stats.entries[0];
    if (entry) {
      const mockToken = '1706140800000_aaaaaaaaaaaaaaaa';
      console.log(`  - Checking invalid token: ${cache.validateToken(entry.key, mockToken)}`);
      console.log(`  - Expected: false (token doesn't match)`);
    }
  }, 30000);

  /**
   * Demonstrate grep capabilities
   */
  test('Grep capabilities demonstration', async () => {
    if (!hasConfig) {
      console.warn('Test skipped: No SAP configuration');
      return;
    }

    // Check if test program exists
    const programExists = await checkObjectExists(client, testObjects.programUrl);
    if (!programExists) {
      console.warn('Test skipped: Test program does not exist');
      return;
    }

    console.log('\n=== Grep Capabilities Demo ===\n');

    const patterns = [
      { name: 'Method definitions', pattern: 'METHODS\\s+\\w+', contextLines: 1 },
      { name: 'Data declarations', pattern: 'DATA:\\s*\\w+', contextLines: 0 },
      { name: 'Comments', pattern: '^\\s*\\*.*', contextLines: 0 }
    ];

    for (const { name, pattern, contextLines } of patterns) {
      console.log(`\n[Grep] Searching for: ${name}`);
      console.log(`[Grep] Pattern: ${pattern}`);

      try {
        const result = await handler.handle('grepObjectSource', {
          objectUrl: testObjects.programUrl,
          pattern,
          caseInsensitive: false,
          contextLines,
          maxMatches: 10
        });

        const data = JSON.parse(result.content[0].text);
        console.log(`[Grep] - Found ${data.data.matchCount} matches (truncated: ${data.data.truncated})`);

        for (const match of data.data.matches.slice(0, 3)) {
          console.log(`[Grep] - Line ${match.lineNumber}: ${match.content.trim().substring(0, 60)}...`);
          if (match.contextBefore && match.contextBefore.length > 0) {
            console.log(`[Grep]   Before: ${match.contextBefore.join(' ')}`);
          }
          if (match.contextAfter && match.contextAfter.length > 0) {
            console.log(`[Grep]   After: ${match.contextAfter.join(' ')}`);
          }
        }
      } catch (e: any) {
        console.log(`[Grep] - Error: ${e.message}`);
      }
    }
  }, 30000);

  /**
   * Demonstrate error handling and recovery
   */
  test('Error handling demonstration', async () => {
    if (!hasConfig) {
      console.warn('Test skipped: No SAP configuration');
      return;
    }

    // Check if test program exists
    const programExists = await checkObjectExists(client, testObjects.programUrl);
    if (!programExists) {
      console.warn('Test skipped: Test program does not exist');
      return;
    }

    console.log('\n=== Error Handling Demo ===\n');

    // Test 1: Invalid regular expression
    console.log('[Error] Test 1: Invalid regex pattern');
    try {
      await handler.handle('grepObjectSource', {
        objectUrl: testObjects.programUrl,
        pattern: '[invalid(regex', // Invalid regex
        caseInsensitive: false
      });
      console.log('[Error] - Unexpected: No error thrown');
    } catch (e: any) {
      console.log(`[Error] - Caught expected error: ${e.message}`);
    }

    // Test 2: Invalid includeType
    console.log('\n[Error] Test 2: Non-existent includeType');
    try {
      await handler.handle('getObjectSourceV2', {
        objectUrl: testObjects.classUrl,
        includeType: 'nonexistent' as any
      });
      console.log('[Error] - Unexpected: No error thrown');
    } catch (e: any) {
      console.log(`[Error] - Caught expected error: ${e.message}`);
    }

    // Test 3: Token validation with expired token
    console.log('\n[Error] Test 3: Using expired/stale token');

    // Get a fresh token
    const readResult = await handler.handle('getObjectSourceV2', {
      objectUrl: testObjects.programUrl
    });

    const readData = JSON.parse(readResult.content[0].text);
    const token = readData.data.token;

    // Invalidate the cache entry
    const cache = handler.getCache();
    cache.invalidate(testObjects.programUrl);

    console.log(`[Error] - Token invalidated, attempting to use it...`);

    // Try to use the invalidated token
    let lock;
    try {
      lock = await client.lock(testObjects.programUrl, 'MODIFY');
    } catch (lockError: any) {
      // If lock fails, skip this test (object might be locked from previous operation)
      console.log(`[Error] - Could not acquire lock: ${lockError.message}`);
      console.log(`[Error] - Skipping token validation test`);
      return;
    }

    try {
      await handler.handle('setObjectSourceV2', {
        objectUrl: testObjects.programUrl,
        token: token,
        startLine: 1,
        endLine: 1,
        content: '* Test modification',
        lockHandle: lock.LOCK_HANDLE
      });
      console.log('[Error] - Unexpected: No error thrown');
    } catch (e: any) {
      console.log(`[Error] - Caught expected error (cache expired): ${e.message}`);
    } finally {
      try {
        await client.unLock(testObjects.programUrl, lock.LOCK_HANDLE);
      } catch (unlockError: any) {
        console.log(`[Error] - Unlock warning: ${unlockError.message}`);
      }
    }

    console.log('\n[Error] All error handling tests completed');
  }, 30000);
});
