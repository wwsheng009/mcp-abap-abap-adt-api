# unitTestEvaluation - 评估单元测试结果

## 功能说明

`unitTestEvaluation` 工具用于评估和获取单元测试的详细结果信息。它提供比 `unitTestRun` 更详细的测试结果分析，包括性能指标和详细报告。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("unitTestEvaluation", {
  clas: "ZCL_TEST_CLASS",
  flags: "detailed"
});
```

## 参数说明

- **clas** (string, 必需): 要评估的测试类名称
- **flags** (string, 可选): 评估标志，控制返回信息的详细程度

常见标志值：
- `detailed`: 返回详细信息
- `performance`: 包含性能指标
- `history`: 包含历史比较
- `warnings`: 包含警告信息

## 返回结果

返回 JSON 格式的评估结果：

```json
{
  "status": "success",
  "result": {
    "className": "ZCL_TEST_CLASS",
    "evaluationTime": "2024-01-30T10:30:00Z",
    "overallStatus": "warning",
    "metrics": {
      "testCount": 15,
      "passRate": 93.3,
      "averageDuration": "45ms",
      "stabilityIndex": 0.95
    },
    "details": [
      {
        "methodName": "test_calculation",
        "status": "passed",
        "duration": "32ms",
        "assertions": 5,
        "performance": "good",
        "warnings": []
      },
      {
        "methodName": "test_boundary",
        "status": "warning",
        "duration": "78ms",
        "assertions": 3,
        "performance": "slow",
        "warnings": [
          "Test execution time exceeds threshold",
          "Consider optimizing test logic"
        ]
      }
    ],
    "coverage": {
      "line": 85.5,
      "branch": 78.2,
      "method": 92.3
    },
    "recommendations": [
      "Optimize test_boundary method for better performance",
      "Add more edge case tests for calculation logic"
    ]
  }
}
```

## 注意事项

1. 类名称必须准确区分大小写
2. 评估结果可能包含大量数据
3. 某些高级评估可能需要额外权限
4. 历史数据可能不可用于新测试类

## 参数限制

- `clas` 必须是有效的 ABAP 类名
- 标志必须受系统支持
- 某些标志可能要求特定系统版本

## 与其他工具的关联性

- 与 `unitTestRun` 配合使用，先运行后评估
- 使用 `classComponents` 获取类方法列表
- 使用 `getObjectSourceV2` 查看测试代码实现
- 评估结果可用于指导代码优化

## 使用场景说明

1. **质量分析**: 深入分析测试质量指标
2. **性能评估**: 评估测试性能和稳定性
3. **改进建议**: 获取代码改进建议
4. **趋势分析**: 对比历史评估结果

## 最佳实践

1. 定期评估测试质量和性能
2. 关注稳定性指数和性能警告
3. 根据建议优化测试和代码
4. 追踪评估结果的趋势变化

## 错误处理

可能的错误：
- **类不存在**: 提供的类名不存在
- **无测试结果**: 类没有可评估的测试结果
- **权限不足**: 无权访问评估信息
- **系统错误**: 评估过程发生错误

## 高级用法

```typescript
// 批量评估多个测试类
async function evaluateMultipleClasses(classes, flags) {
  return Promise.all(
    classes.map(clas => mcp.callTool("unitTestEvaluation", { clas, flags }))
  );
}

// 比较两次评估结果
function compareEvaluations(oldEval, newEval) {
  return {
    passRateChange: newEval.metrics.passRate - oldEval.metrics.passRate,
    performanceChange: comparePerformance(oldEval, newEval)
  };
}

// 生成质量报告
function generateQualityReport(evaluation) {
  return {
    grade: calculateQualityGrade(evaluation),
    strengths: identifyStrengths(evaluation),
    weaknesses: identifyWeaknesses(evaluation),
    actions: evaluation.recommendations
  };
}
```

## 示例

```typescript
// 评估测试类并获取详细信息
const result = await mcp.callTool("unitTestEvaluation", {
  clas: "ZCL_TEST_CLASS",
  flags: "detailed,performance"
});

// 显示评估摘要
console.log(`类名: ${result.result.className}`);
console.log(`总体状态: ${result.result.overallStatus}`);
console.log(`通过率: ${result.result.metrics.passRate}%`);
console.log(`平均耗时: ${result.result.metrics.averageDuration}`);
console.log(`稳定性指数: ${result.result.metrics.stabilityIndex}`);

// 显示覆盖率信息
console.log('\n覆盖率:');
console.log(`  代码行: ${result.result.coverage.line}%`);
console.log(`  分支: ${result.result.coverage.branch}%`);
console.log(`  方法: ${result.result.coverage.method}%`);

// 显示改进建议
if (result.result.recommendations.length > 0) {
  console.log('\n改进建议:');
  result.result.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
}
```
