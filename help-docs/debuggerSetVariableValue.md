# debuggerSetVariableValue

## 功能说明
设置调试器中变量的值，用于在调试过程中修改变量以测试不同的代码路径。这是强大的调试功能，可以动态改变程序状态。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerSetVariableValue",
  "arguments": {
    "variableName": "lv_counter",
    "value": "100"
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "updated": true,
    "variableName": "lv_counter",
    "oldValue": "10",
    "newValue": "100"
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| variableName | string | 是 | 变量名 |
| value | string | 是 | 新的变量值 |

## 注意事项

⚠️ **重要提示：**
1. 必须在调试会话中调用
2. 变量必须是可编辑的
3. 修改变量会立即生效，影响后续代码执行
4. 某些系统变量或常量不可修改
5. 修改后的值在调试结束后不会持久化

## 参数限制

- `variableName`：必须是当前上下文中存在的变量
- `value`：必须与变量类型兼容

## 与其他工具的关联性

- **debuggerVariables** - 查看变量列表（获取变量名）
- **debuggerChildVariables** - 查看子变量（修改复杂类型的字段）
- **debuggerAttach** - 附加到调试会话

## 使用场景说明

### 场景1：修改变量值
```json
{
  "variableName": "lv_counter",
  "value": "100"
}
```

### 场景2：修改字符串变量
```json
{
  "variableName": "lv_message",
  "value": "New message"
}
```

### 场景3：设置布尔标志
```json
{
  "variableName": "lv_flag",
  "value": "X"
}
```

## 最佳实践

✅ **推荐做法：**
1. 使用`debuggerVariables`先确认变量存在
2. 检查变量是否可编辑
3. 使用与变量类型兼容的值
4. 记录修改操作以便追踪
5. 测试完成后恢复原始值

❌ **避免做法：**
1. 不要修改系统变量或常量
2. 避免使用与类型不兼容的值
3. 不要修改其他上下文的变量

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Variable not found" | 变量不存在 | 检查变量名是否正确 |
| "Variable is read-only" | 变量不可编辑 | 尝试其他变量 |
| "Type mismatch" | 值类型不匹配 | 使用与变量类型兼容的值 |
| "No active debug session" | 没有活跃的调试会话 | 先附加到调试会话 |

## 高级用法

### 1. 条件测试
```javascript
async function testWithDifferentValues(variableName, testValues) {
  const results = [];
  
  for (const testValue of testValues) {
    // 获取旧值
    const oldVariables = await debuggerVariables({ parents: ["local"] });
    const oldValue = oldVariables.variables.find(v => v.name === variableName).value;
    
    // 设置新值
    await debuggerSetVariableValue({ variableName, value: testValue });
    
    // 执行测试逻辑
    const testResult = await executeTest();
    
    results.push({
      testValue,
      result: testResult
    });
    
    // 恢复旧值
    await debuggerSetVariableValue({ variableName, value: oldValue });
  }
  
  return results;
}
```

### 2. 批量修改变量
```javascript
async function batchSetVariables(variables) {
  const results = [];
  
  for (const { name, value } of variables) {
    try {
      const result = await debuggerSetVariableValue({
        variableName: name,
        value: value
      });
      results.push({ name, status: "updated", result });
    } catch (error) {
      results.push({ name, status: "failed", error: error.message });
    }
  }
  
  return results;
}
```

## 示例

### 示例1：修改变量值
```json
{
  "tool": "debuggerSetVariableValue",
  "arguments": {
    "variableName": "lv_counter",
    "value": "100"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "updated": true,
    "variableName": "lv_counter",
    "oldValue": "10",
    "newValue": "100"
  }
}
```

### 示例2：修改布尔标志
```json
{
  "tool": "debuggerSetVariableValue",
  "arguments": {
    "variableName": "lv_flag",
    "value": "X"
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "updated": true,
    "variableName": "lv_flag",
    "oldValue": " ",
    "newValue": "X"
  }
}
```

---

## 相关工具

- [debuggerVariables](debuggerVariables.md) - 查看变量列表
- [debuggerChildVariables](debuggerChildVariables.md) - 查看子变量
- [debuggerAttach](debuggerAttach.md) - 附加到调试会话
