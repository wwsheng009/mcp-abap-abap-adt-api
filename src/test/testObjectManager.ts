/**
 * Test Object Manager
 * Creates and deletes test objects in SAP for integration testing
 */

import { ADTClient } from 'abap-adt-api';
import type { CreatableTypeIds } from 'abap-adt-api';

export interface TestObject {
  name: string;
  type: CreatableTypeIds;
  url: string;
  parentName: string;
  parentPath: string;
  description: string;
  responsible?: string;
}

export class TestObjectManager {
  private client: ADTClient;
  private createdObjects: TestObject[] = [];
  private transport?: string;
  private autoActivate: boolean;

  constructor(client: ADTClient, transport?: string, autoActivate: boolean = true) {
    this.client = client;
    this.transport = transport;
    this.autoActivate = autoActivate;
  }

  /**
   * Activate an object after creation
   */
  private async activateObject(name: string, url: string): Promise<void> {
    if (!this.autoActivate) return;

    try {
      const result = await this.client.activate(name, url);
      if (result.success === false) {
        console.warn(`[TestObjectManager] Activation warnings for ${name}`);
      } else {
        console.log(`[TestObjectManager] Activated object: ${name}`);
      }
    } catch (error: any) {
      console.warn(`[TestObjectManager] Activation failed for ${name}: ${error.message}`);
      // Don't throw - object may still be usable
    }
  }

  /**
   * Create a test program
   */
  async createTestProgram(
    name: string,
    content: string,
    packageName: string = '$TMP',
    description: string = 'MCP V2 Test Program'
  ): Promise<TestObject> {
    const testObj: TestObject = {
      name: name.toUpperCase(),
      type: 'PROG/P',
      url: `/sap/bc/adt/programs/programs/${name.toLowerCase()}`,
      parentName: packageName,
      parentPath: `/sap/bc/adt/programs/programs`,
      description
    };

    try {
      // Create the program
      const createOptions: any = {
        objtype: testObj.type,
        name: testObj.name,
        parentName: testObj.parentName,
        parentPath: testObj.parentPath,
        description: testObj.description,
        responsible: this.client.username
      };

      // Only add transport if provided (not needed for $TMP package)
      if (this.transport) {
        createOptions.transport = this.transport;
      }

      await this.client.createObject(createOptions);

      // Set the source code
      const lock = await this.client.lock(testObj.url, 'MODIFY');
      try {
        await this.client.setObjectSource(
          `${testObj.url}/source/main`,
          content,
          lock.LOCK_HANDLE,
          this.transport
        );
      } finally {
        await this.client.unLock(testObj.url, lock.LOCK_HANDLE);
      }

      this.createdObjects.push(testObj);
      console.log(`[TestObjectManager] Created program: ${testObj.name}`);

      // Activate the program so it can be accessed
      await this.activateObject(testObj.name, testObj.url);

      return testObj;
    } catch (error: any) {
      console.error(`[TestObjectManager] Failed to create program: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a test class
   */
  async createTestClass(
    name: string,
    content: string,
    packageName: string = '$TMP',
    description: string = 'MCP V2 Test Class'
  ): Promise<TestObject> {
    const className = name.toUpperCase();
    const testObj: TestObject = {
      name: className,
      type: 'CLAS/OC',
      url: `/sap/bc/adt/oo/cl/${name.toLowerCase()}`,
      parentName: packageName,
      parentPath: `/sap/bc/adt/oo/classes`,
      description
    };

    try {
      // Create the class
      const createOptions: any = {
        objtype: testObj.type,
        name: testObj.name,
        parentName: testObj.parentName,
        parentPath: testObj.parentPath,
        description: testObj.description,
        responsible: this.client.username
      };

      // Only add transport if provided (not needed for $TMP package)
      if (this.transport) {
        createOptions.transport = this.transport;
      }

      await this.client.createObject(createOptions);

      // Set the main source code
      const lock = await this.client.lock(testObj.url, 'MODIFY');
      try {
        await this.client.setObjectSource(
          `${testObj.url}/source/main`,
          content,
          lock.LOCK_HANDLE,
          this.transport
        );
      } finally {
        await this.client.unLock(testObj.url, lock.LOCK_HANDLE);
      }

      this.createdObjects.push(testObj);
      console.log(`[TestObjectManager] Created class: ${testObj.name}`);

      // Activate the class so it can be accessed
      await this.activateObject(testObj.name, testObj.url);

      return testObj;
    } catch (error: any) {
      console.error(`[TestObjectManager] Failed to create class: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an object by URL (for cleanup of existing objects)
   */
  async deleteObjectByUrl(objectUrl: string, name: string): Promise<boolean> {
    try {
      const lock = await this.client.lock(objectUrl, 'MODIFY');
      try {
        // Only pass transport if provided (not needed for $TMP package)
        const deleteOptions: any = {
          uri: objectUrl,
          lockHandle: lock.LOCK_HANDLE
        };
        if (this.transport) {
          deleteOptions.corrNr = this.transport;
        }

        await this.client.deleteObject(
          objectUrl,
          lock.LOCK_HANDLE,
          this.transport
        );
        console.log(`[TestObjectManager] Deleted object: ${name}`);
        return true;
      } catch (error: any) {
        // If delete fails, try to unlock anyway
        console.error(`[TestObjectManager] Delete error for ${name}: ${error.message}`);
        return false;
      } finally {
        try {
          await this.client.unLock(objectUrl, lock.LOCK_HANDLE);
        } catch (e) {
          // Ignore unlock errors
        }
      }
    } catch (error: any) {
      console.error(`[TestObjectManager] Failed to lock for delete: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete a created test object
   */
  async deleteObject(obj: TestObject): Promise<void> {
    await this.deleteObjectByUrl(obj.url, obj.name);
  }

  /**
   * Clean up all created test objects
   */
  async cleanup(): Promise<void> {
    const errors: Error[] = [];

    for (const obj of this.createdObjects) {
      try {
        await this.deleteObject(obj);
      } catch (error: any) {
        console.error(`[TestObjectManager] Cleanup failed for ${obj.name}: ${error.message}`);
        errors.push(error);
      }
    }

    this.createdObjects = [];

    if (errors.length > 0) {
      throw new Error(`Cleanup failed with ${errors.length} errors`);
    }
  }

  /**
   * Get count of created objects
   */
  get count(): number {
    return this.createdObjects.length;
  }

  /**
   * Get default test program source code
   */
  static getDefaultProgramSource(): string {
    return `*&---------------------------------------------------------------------*
*& Report  ZTEST_MCP_V2
*&---------------------------------------------------------------------*
*&
*&---------------------------------------------------------------------*
REPORT ztest_mcp_v2.

* Simple test program for MCP V2 handlers
WRITE: / 'Hello from MCP V2 Test!'.
WRITE: / 'Timestamp:', sy-datum, sy-uzeit.
`;
  }

  /**
   * Get default test class source code
   */
  static getDefaultClassSource(): string {
    return `*&---------------------------------------------------------------------*
*& Class definition
*&---------------------------------------------------------------------*
CLASS zcl_mcp_test_v2 DEFINITION
  PUBLIC
  CREATE PUBLIC .

  PUBLIC SECTION.
    METHODS:
      constructor,
      calculate_result IMPORTING iv_value1 TYPE i
                                  iv_value2 TYPE i
                RETURNING VALUE(rv_result) TYPE i,
      get_status RETURNING VALUE(rv_status) TYPE string.

  PROTECTED SECTION.

  PRIVATE SECTION.
    DATA: mv_value1 TYPE i,
          mv_value2 TYPE i,
          mv_result  TYPE i,
          mv_status  TYPE string.

ENDCLASS.



*&---------------------------------------------------------------------*
*& Class implementation
*&---------------------------------------------------------------------*
CLASS zcl_mcp_test_v2 IMPLEMENTATION.

  METHOD constructor.
    mv_value1 = 0.
    mv_value2 = 0.
    mv_result = 0.
    mv_status = 'Initialized'.
  ENDMETHOD.

  METHOD calculate_result.
    mv_value1 = iv_value1.
    mv_value2 = iv_value2.
    mv_result = mv_value1 + mv_value2.
    rv_result = mv_result.
    mv_status = |Calculated: { mv_result }|.
  ENDMETHOD.

  METHOD get_status.
    rv_status = mv_status.
  ENDMETHOD.

ENDCLASS.
`;
  }
}
