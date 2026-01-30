# unitTestOccurrenceMarkers - 获取单元测试位置标记

## 功能说明

`unitTestOccurrenceMarkers` 工具用于获取源代码中单元测试相关的位置标记。这些标记指出哪些代码行被单元测试覆盖，以及测试与源代码之间的关联关系。

## 调用方法

通过 MCP 工具调用：

```typescript
const result = await mcp.callTool("unitTestOccurrenceMarkers", {
  url: "/sap/bc/adt/oo/classes/zcl_my_class",
  source: "CLASS zcl_my_class IMPLEMENTATION.\n  METHOD calculate.\n    result = a + b.\n  ENDMETHOD.\nENDCLASS."
});
```

## 参数说明

- **url** (string, 必需): 对象的 URL 地址
- **source** (string, 必需): 源代码内容

## 返回结果

返回 JSON 格式的位置标记：

```json
{
  "status": "success",
  "markers": [
    {
      "line": 3,
      "column": 4,
      "length": 12,
      "type": "covered",
      "testClass": "ZCL_TEST_CLASS",
      "testMethod": "test_calculate_addition",
      "coverage": "full"
    },
    {
      "line": 3,
      "column": 18,
      "length": 12,
      "type": "covered",
      "testClass": "ZCL_TEST_CLASS",
      "testMethod": "test_calculate_addition",
      "coverage": "full"
    },
    {
      "line": 5,
      "column": 5,
      "length": 8,
      "type": "uncovered",
      "coverage": "none"
    }
  ]
}
```

## 注意事项

1. 源代码内容必须与系统中的实际代码匹配
2. 标记位置基于源代码的行列号
3. 覆盖率信息基于最近运行的单元测试
4. 未运行的测试不会产生标记

## 参数限制

- `url` 必须是有效的 ADT 对象 URL
- `source` 必须是完整、有效的 ABAP 源代码
- 源代码格式必须正确

## 与其他工具的关联性

- 与 `unitTestRun` 配合，先运行测试再获取标记
- 使用 `getObjectSourceV2` 获取源代码
- 与 `codeCompletion` 结合使用，在编辑时显示覆盖信息
- 标记信息可用于生成可视化覆盖报告

## 使用场景说明

1. **覆盖可视化**: 在编辑器中直观显示代码覆盖情况
2. **测试导航**: 从代码快速跳转到相关测试
3. **质量评估**: 识别未覆盖的代码区域
4. **重构支持**: 在重构时验证测试覆盖

## 最佳实践

1. 在运行测试后获取最新标记
2. 在 IDE 中可视化标记信息
3. 优先为未覆盖代码编写测试
4. 使用标记信息指导测试改进

## 错误处理

可能的错误：
- **URL 无效**: 对象 URL 不正确
- **源代码不匹配**: 提供的源代码与系统不一致
- **无测试数据**: 对象没有相关的单元测试数据
- **解析错误**: 源代码解析失败

## 高级用法

```typescript
// 渲染覆盖标记到编辑器
function renderCoverageMarkers(editor, markers, source) {
  markers.forEach(marker => {
    const style = getMarkerStyle(marker.type);
    editor.highlight({
      line: marker.line,
      column: marker.column,
      length: marker.length,
      style
    });
  });
}

// 计算覆盖率百分比
function calculateCoveragePercentage(markers, totalLines) {
  const coveredLines = new Set(
    markers.filter(m => m.type === 'covered').map(m => m.line)
  );
  return (coveredLines.size / totalLines) * 100;
}

// 查找未覆盖的方法
function findUncoveredMethods(markers, methods) {
  const coveredLines = new Set(
    markers.filter(m => m.type === 'covered').map(m => m.line)
  );
  return methods.filter(method => {
    return !method.lines.every(line => coveredLines.has(line));
  });
}
```

## 示例

```typescript
// 获取测试类的源代码
const sourceResult = await mcp.callTool("getObjectSourceV2", {
  url: "/sap/bc/adt/oo/classes/zcl_my_class"
});

// 获取单元测试位置标记
const result = await mcp.callTool("unitTestOccurrenceMarkers", {
  url: "/sap/bc/adt/oo/classes/zcl_my_class",
  source: sourceResult.content
});

// 分析覆盖情况
const totalLines = sourceResult.content.split('\n').length;
const coveredCount = result.markers.filter(m => m.type === 'covered').length;
const uncoveredCount = result.markers.filter(m => m.type === 'uncovered').length;
const coverage = (coveredCount / result.markers.length) * 100;

console.log(`总标记数: ${result.markers.length}`);
console.log(`已覆盖: ${coveredCount}`);
console.log(`未覆盖: ${uncoveredCount}`);
console.log(`覆盖率: ${coverage.toFixed(2)}%`);

// 显示未覆盖的位置
if (uncoveredCount > 0) {
  console.log('\n未覆盖的代码位置:');
  result.markers
    .filter(m => m.type === 'uncovered')
    .forEach(marker => {
      console.log(`  行 ${marker.line}, 列 ${marker.column}`);
    });
}
```
