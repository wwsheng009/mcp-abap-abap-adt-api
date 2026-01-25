import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

// Test configuration
export const testConfig = {
  sapUrl: process.env.SAP_URL || '',
  sapUser: process.env.SAP_USER || '',
  sapPassword: process.env.SAP_PASSWORD || '',
  sapClient: process.env.SAP_CLIENT || '300',
  sapLanguage: process.env.SAP_LANGUAGE || 'ZH',
  transport: process.env.SAP_TRANSPORT || ''  // Transport request for creating objects
};

// Validate config
if (!testConfig.sapUrl || !testConfig.sapUser || !testConfig.sapPassword) {
  console.warn('Warning: SAP connection not configured. Some tests will be skipped.');
}

// Test objects
export const testObjects = {
  // Simple program - user should have this or tests will be skipped
  programName: 'ZTEST_MCP_V2',
  programUrl: '/sap/bc/adt/programs/programs/ztest_mcp_v2',
  programSourceUrl: '/sap/bc/adt/programs/programs/ztest_mcp_v2/source/main',

  // Class
  className: 'ZCL_MCP_TEST_V2',
  classUrl: '/sap/bc/adt/oo/cl/zcl_mcp_test_v2',
  classMainUrl: '/sap/bc/adt/oo/cl/zcl_mcp_test_v2/source/main',
  classDefinitionsUrl: '/sap/bc/adt/oo/cl/zcl_mcp_test_v2/source/definitions',
  classImplementationsUrl: '/sap/bc/adt/oo/cl/zcl_mcp_test_v2/source/implementations'
};

// Helper to skip tests if SAP is not configured
export function skipIfNoConfig(): boolean {
  return !testConfig.sapUrl || !testConfig.sapUser || !testConfig.sapPassword;
}

/**
 * Helper to check if a test object exists
 * Returns true if object exists, false otherwise
 */
export async function checkObjectExists(client: any, objectUrl: string): Promise<boolean> {
  try {
    await client.objectStructure(objectUrl);
    return true;
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('404')) {
      return false;
    }
    throw error;
  }
}
