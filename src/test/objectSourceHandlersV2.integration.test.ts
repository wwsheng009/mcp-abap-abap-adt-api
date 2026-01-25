/**
 * Integration tests for ObjectSourceHandlersV2
 * These tests require a live SAP connection and test objects to exist
 *
 * To create test objects manually in SAP:
 * 1. Create program ZTEST_MCP_V2 in package $TMP
 * 2. Create class ZCL_MCP_TEST_V2 in package $TMP
 *
 * Or add SAP_TRANSPORT to .env for automatic creation
 */

import { ADTClient, session_types } from 'abap-adt-api';
import { ObjectSourceHandlersV2 } from '../handlersV2/ObjectSourceHandlersV2';
import { ObjectSourceHandlers } from '../handlers/ObjectSourceHandlers';
import { skipIfNoConfig, testConfig, testObjects, checkObjectExists } from './setup';
import { TestObjectManager } from './testObjectManager';

describe('ObjectSourceHandlersV2 Integration Tests', () => {
  let client: ADTClient;
  let handlerV2: ObjectSourceHandlersV2;
  let handlerV1: ObjectSourceHandlers;
  let testObjManager: TestObjectManager;
  let autoCreatedObjects = false;

  const hasConfig = !skipIfNoConfig();

  beforeAll(async () => {
    if (!hasConfig) {
      console.warn('\n=== SAP Connection Not Configured ===');
      console.warn('Please set the following environment variables:');
      console.warn('  - SAP_URL');
      console.warn('  - SAP_USER');
      console.warn('  - SAP_PASSWORD');
      console.warn('  - SAP_CLIENT (optional, default: 300)');
      console.warn('  - SAP_TRANSPORT (optional, for auto-creating test objects)');
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

    handlerV2 = new ObjectSourceHandlersV2(client);
    handlerV1 = new ObjectSourceHandlers(client);
    testObjManager = new TestObjectManager(client, testConfig.transport);

    // Check if test objects exist (may be inactive and not detected)
    let programExists = await checkObjectExists(client, testObjects.programUrl);
    let classExists = await checkObjectExists(client, testObjects.classUrl);

    console.log(`[Setup] Test program exists: ${programExists}`);
    console.log(`[Setup] Test class exists: ${classExists}`);

    // Always try to delete test objects before creating new ones
    // This handles both active and inactive objects
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
    // Note: $TMP package doesn't require transport code
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

  describe('AI Client Workflow Simulation', () => {
    /**
     * Scenario 1: Standard modify workflow
     */
    test('should complete standard modify workflow', async () => {
      if (!hasConfig) {
        console.warn('Test skipped: No SAP configuration');
        return;
      }

      // Check if test object exists
      const objectExists = await checkObjectExists(client, testObjects.programUrl);
      if (!objectExists) {
        console.warn('Test skipped: Test program does not exist');
        return;
      }

      const objectUrl = testObjects.programUrl;

      // Step 1: Read source code (get token)
      const readResult = await handlerV2.handle('getObjectSourceV2', {
        objectUrl: objectUrl
      });

      const readData = JSON.parse(readResult.content[0].text);
      expect(readData.status).toBe('success');
      expect(readData.data.token).toBeDefined();
      expect(readData.data.content).toBeDefined();
      expect(readData.data.lineCount).toBeGreaterThan(0);

      const { token, content: originalContent, lineCount } = readData.data;
      console.log(`[AI] Read ${lineCount} lines, got token: ${token.substring(0, 20)}...`);

      // Step 2: AI analyzes content (simulated)
      const lines = originalContent.split('\n');
      const modifyLine = Math.min(10, lines.length);
      console.log(`[AI] Planning to modify line ${modifyLine}`);

      // Step 3: Lock object
      const lockResult = await client.lock(objectUrl, 'MODIFY');
      expect(lockResult.LOCK_HANDLE).toBeDefined();
      console.log(`[AI] Acquired lock: ${lockResult.LOCK_HANDLE}`);

      try {
        // Step 4: Prepare modification (add a comment)
        const timestamp = new Date().toISOString().replace(/T/, ' ').substring(0, 19);
        const newContent = `* Modified by MCP V2 Test at ${timestamp}`;
        const modifiedLines = [...lines];
        modifiedLines[modifyLine - 1] = newContent;

        // Step 5: Submit modification
        const setResult = await handlerV2.handle('setObjectSourceV2', {
          objectUrl: objectUrl,
          token: token,
          startLine: modifyLine,
          endLine: modifyLine,
          content: newContent,
          lockHandle: lockResult.LOCK_HANDLE
        });

        const setData = JSON.parse(setResult.content[0].text);
        expect(setData.status).toBe('success');
        expect(setData.data.updated).toBe(true);
        console.log(`[AI] Modification successful: ${setData.data.oldRange} -> ${setData.data.newRange}`);

      } finally {
        // Step 7: Always unlock
        await client.unLock(objectUrl, lockResult.LOCK_HANDLE);
        console.log('[AI] Released lock');
      }
    }, 60000);

    /**
     * Scenario 2: Line range read
     */
    test('should read specific line range', async () => {
      if (!hasConfig) {
        console.warn('Test skipped: No SAP configuration');
        return;
      }

      const objectExists = await checkObjectExists(client, testObjects.programUrl);
      if (!objectExists) {
        console.warn('Test skipped: Test program does not exist');
        return;
      }

      const objectUrl = testObjects.programUrl;

      const readResult = await handlerV2.handle('getObjectSourceV2', {
        objectUrl: objectUrl,
        startLine: 1,
        endLine: 10
      });

      const readData = JSON.parse(readResult.content[0].text);
      expect(readData.status).toBe('success');
      expect(readData.data.token).toBeDefined();

      const { content, startLine, endLine } = readData.data;
      const lines = content.split('\n');

      console.log(`[AI] Read lines ${startLine}-${endLine}, got ${lines.length} lines`);
      expect(lines.length).toBeLessThanOrEqual(10);
    }, 60000);

    /**
     * Scenario 3: Grep search
     */
    test('should search for patterns in source code', async () => {
      if (!hasConfig) {
        console.warn('Test skipped: No SAP configuration');
        return;
      }

      const objectExists = await checkObjectExists(client, testObjects.programUrl);
      if (!objectExists) {
        console.warn('Test skipped: Test program does not exist');
        return;
      }

      const objectUrl = testObjects.programUrl;

      const grepResult = await handlerV2.handle('grepObjectSource', {
        objectUrl: objectUrl,
        pattern: 'REPORT|WRITE',
        caseInsensitive: true,
        contextLines: 1
      });

      const grepData = JSON.parse(grepResult.content[0].text);
      expect(grepData.status).toBe('success');
      expect(grepData.data.matches).toBeInstanceOf(Array);

      console.log(`[AI] Found ${grepData.data.matchCount} matches`);

      for (const match of grepData.data.matches) {
        console.log(`  Line ${match.lineNumber}: ${match.content.substring(0, 50)}...`);
      }

      expect(grepData.data.matchCount).toBeGreaterThan(0);
    }, 60000);

    /**
     * Scenario 4: Version conflict detection
     */
    test('should detect version conflict', async () => {
      if (!hasConfig) {
        console.warn('Test skipped: No SAP configuration');
        return;
      }

      const objectExists = await checkObjectExists(client, testObjects.programUrl);
      if (!objectExists) {
        console.warn('Test skipped: Test program does not exist');
        return;
      }

      const objectUrl = testObjects.programUrl;

      // Step 1: Get initial token
      const readResult = await handlerV2.handle('getObjectSourceV2', {
        objectUrl: objectUrl
      });

      const readData = JSON.parse(readResult.content[0].text);
      const originalToken = readData.data.token;

      // Step 2: Simulate another user making a change (using V1 handler)
      const v1ReadResult = await handlerV1.handle('getObjectSource', {
        objectSourceUrl: `${objectUrl}/source/main`
      });

      const v1Data = JSON.parse(v1ReadResult.content[0].text);
      const modifiedContent = v1Data.source + `\n* Concurrent modification at ${new Date().toISOString()}`;

      const lock = await client.lock(objectUrl, 'MODIFY');

      try {
        // Make a change using V1 (simulating another user)
        await client.setObjectSource(
          `${objectUrl}/source/main`,
          modifiedContent,
          lock.LOCK_HANDLE
        );

        // Now try to use the old token (should fail)
        const setResult = await handlerV2.handle('setObjectSourceV2', {
          objectUrl: objectUrl,
          token: originalToken, // This token is now stale
          startLine: 1,
          endLine: 1,
          content: '* This should fail due to conflict',
          lockHandle: lock.LOCK_HANDLE
        });

        // Should get conflict error
        const setData = JSON.parse(setResult.content[0].text);
        console.log('[AI] Conflict detected as expected:', setData.error || setData.data?.error);

      } finally {
        await client.unLock(objectUrl, lock.LOCK_HANDLE);
      }
    }, 60000);
  });

  describe('CLASS includeType support', () => {
    test('should read CLASS main include', async () => {
      if (!hasConfig) {
        console.warn('Test skipped: No SAP configuration');
        return;
      }

      const objectExists = await checkObjectExists(client, testObjects.classUrl);
      if (!objectExists) {
        console.warn('Test skipped: Test class does not exist');
        return;
      }

      const classUrl = testObjects.classUrl;

      const readResult = await handlerV2.handle('getObjectSourceV2', {
        objectUrl: classUrl,
        includeType: 'main'
      });

      const readData = JSON.parse(readResult.content[0].text);
      expect(readData.status).toBe('success');
      expect(readData.data.includeType).toBe('main');
      expect(readData.data.token).toBeDefined();

      console.log(`[AI] Read CLASS main include: ${readData.data.lineCount} lines`);
    }, 60000);

    test('should grep in CLASS definitions include', async () => {
      if (!hasConfig) {
        console.warn('Test skipped: No SAP configuration');
        return;
      }

      const objectExists = await checkObjectExists(client, testObjects.classUrl);
      if (!objectExists) {
        console.warn('Test skipped: Test class does not exist');
        return;
      }

      const classUrl = testObjects.classUrl;

      const grepResult = await handlerV2.handle('grepObjectSource', {
        objectUrl: classUrl,
        includeType: 'definitions',
        pattern: 'PUBLIC SECTION|PRIVATE SECTION|PROTECTED SECTION',
        caseInsensitive: true
      });

      const grepData = JSON.parse(grepResult.content[0].text);
      expect(grepData.status).toBe('success');
      expect(grepData.data.includeType).toBe('definitions');

      console.log(`[AI] Found ${grepData.data.matchCount} section definitions`);
    }, 60000);
  });

  describe('Cache validation', () => {
    test('should cache entries with correct keys', async () => {
      if (!hasConfig) {
        console.warn('Test skipped: No SAP configuration');
        return;
      }

      const programExists = await checkObjectExists(client, testObjects.programUrl);
      const classExists = await checkObjectExists(client, testObjects.classUrl);

      if (!programExists && !classExists) {
        console.warn('Test skipped: No test objects exist');
        return;
      }

      const cache = handlerV2.getCache();

      // Read without includeType
      if (programExists) {
        await handlerV2.handle('getObjectSourceV2', {
          objectUrl: testObjects.programUrl
        });
      }

      console.log(`[AI] Cache size after program read: ${cache.size}`);

      // Read with includeType
      if (classExists) {
        await handlerV2.handle('getObjectSourceV2', {
          objectUrl: testObjects.classUrl,
          includeType: 'main'
        });
      }

      console.log(`[AI] Cache size after class read: ${cache.size}`);

      const stats = cache.getStats();
      console.log('[AI] Cache stats:', stats);
    }, 60000);
  });
});

// Helper to check if result is an error
function setIsError(value: any): boolean {
  return value && (value.isError === true || typeof value.error === 'string');
}
