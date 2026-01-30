# unitTestRun - 运行单元测试

## 功能说明

`unitTestRun` 工具用于在 ABAP 系统中运行单元测试。它可以执行单个测试类或多个测试类的测试，并返回详细的测试结果。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("unitTestRun", {
  url: "/sap/bc/adt/oo/classes/zcl_test_class",
  flags: "coverage"
});
```

## 参数说明

- **url** (string, 必需): 要测试的对象 URL（通常是测试类的 URL）
- **flags** (string, 可选): 单元测试运行标志，用于控制测试行为

常见标志值：
- `coverage`: 启用代码覆盖率
- `parallel`: 并行运行测试
- `verbose`: 详细输出
- `quick`: 快速模式

## 返回结果

返回 JSON 格式的测试结果：

```json
{
  "status": "success",
  "result": {
    "testClass": "ZCL_TEST_CLASS",
    "status": "passed",
    "duration": "1234ms",
    "tests": [
      {
        "name": "test_method_1",
        "status": "passed",
        "duration": "45ms",
        "message": "Test passed successfully"
      },
      {
        "name": "test_method_2",
        "status": "failed",
        "duration": "78ms",
        "message": "Assertion failed",
        "stackTrace": "..."
      }
    ],
    "summary": {
      "total": 10,
      "passed": 8,
      "failed": 2,
      "skipped": 0
    },
    "coverage": {
      "percentage": 85.5,
      "linesCovered": 342,
      "linesTotal": 400
    }
  }
}
```

## 注意事项

1. URL 必须指向有效的测试类
2. 测试运行时间取决于测试数量和复杂度
3. 某些标志可能需要特定权限
4. 长时间运行的测试可能超时

## 参数限制

- `url` 必须是完整的 ADT 对象 URL
- 标志必须受系统支持
- 某些标志不能组合使用

## 与其他工具的关联性

- 使用 `searchObject` 查找测试类
- 使用 `unitTestEvaluation` 评估测试结果
- 使用 `classComponents` 获取类方法信息
- 使用 `getObjectSourceV2` 查看测试代码

## 使用场景说明

1. **回归测试**: 代码修改后运行测试确保无破坏性变更
2. **持续集成**: 在 CI/CD 流程中自动运行测试
3. **质量保证**: 在发布前验证代码质量
4. **故障排查**: 运行测试定位和诊断问题

## 最佳实践

1. 在开发过程中频繁运行测试
2. 使用 `coverage` 标志监控代码覆盖率
3. 保持测试快速独立
4. 分析失败测试的根本原因

## 错误处理

可能的错误：
- **测试类不存在**: URL 指向的对象不是测试类
- **测试执行失败**: 测试运行时发生错误
- **超时**: 测试运行时间过长
- **权限不足**: 无权运行测试

## 高级用法

```typescript
// 并行运行多个测试类
async function runMultipleTests(urls, flags) {
  return Promise.all(
    urls.map(url => mcp.callTool("unitTestRun", { url, flags }))
  );
}

// 仅运行失败的测试
function runFailedTests(previousResult) {
  const failedTests = previousResult.tests.filter(t => t.status === 'failed');
  // 重新运行失败的测试
}

// 生成测试报告
function generateTestReport(result) {
  return {
    summary: result.summary,
    failed: result.tests.filter(t => t.status === 'failed'),
    coverage: result.coverage
  };
}
```

## 示例

```typescript
// 运行测试类并启用覆盖率
const result = await mcp.callTool("unitTestRun", {
  url: "/sap/bc/adt/oo/classes/zcl_test_class",
  flags: "coverage"
});

// 显示测试结果
console.log(`测试类: ${result.result.testClass}`);
console.log(`状态: ${result.result.status}`);
console.log(`耗时: ${result.result.duration}`);
console.log(`通过: ${result.result.summary.passed}/${result.result.summary.total}`);
console.log(`覆盖率: ${result.result.coverage.percentage}%`);

// 显示失败的测试
const failedTests = result.result.tests.filter(t => t.status === 'failed');
if (failedTests.length > 0) {
  console.log('\n失败的测试:');
  failedTests.forEach(test => {
    console.log(`  - ${test.name}: ${test.message}`);
  });
}
```
