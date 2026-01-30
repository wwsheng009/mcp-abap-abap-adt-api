# debuggerVariables

## 功能说明
获取调试器中的变量列表，显示当前上下文中可访问的所有变量及其值。这是调试时检查程序状态的重要工具。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerVariables",
  "arguments": {
    "parents": ["main", "local"]
  }
}
```

### 返回结果
```json
{
  "status": "success",
  "result": {
    "variables": [
      {
        "name": "lv_result",
        "type": "I",
        "value": "42",
        "isEditable": true
      },
      {
        "name": "ls_order",
        "type": "STRUCTURE",
        "value": "{...}",
        "hasChildren": true,
        "isEditable": true
      },
      {
        "name": "lt_items",
        "type": "TABLE",
        "value": "[...]",
        "hasChildren": true,
        "isEditable": true
      }
    ]
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| parents | array | 是 | 父变量名数组，用于过滤变量范围 |

## 注意事项

⚠️ **重要提示：**
1. 必须在调试会话中调用
2. 变量作用域取决于当前执行的上下文
3. 复杂类型（结构、表）需要使用`debuggerChildVariables`查看详细内容
4. 某些系统变量可能不可见或不可编辑

## 参数限制

- `parents`：必须是非空数组

## 与其他工具的关联性

- **debuggerAttach** - 附加到调试会话（必须先调用）
- **debuggerChildVariables** - 查看子变量（结构、表的字段）
- **debuggerSetVariableValue** - 修改变量值
- **debuggerStackTrace** - 查看堆栈（了解上下文）

## 使用场景说明

### 场景1：获取所有局部变量
```json
{
  "parents": ["local"]
}
```

### 场景2：获取特定作用域的变量
```json
{
  "parents": ["main", "local"]
}
```

## 最佳实践

✅ **推荐做法：**
1. 结合堆栈跟踪使用，理解当前上下文
2. 对于复杂类型，使用子变量工具查看详细内容
3. 定期检查变量值以跟踪程序状态

❌ **避免做法：**
1. 不要在非调试状态下调用

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "No active debug session" | 没有活跃的调试会话 | 先附加到调试会话 |
| "Invalid parent scope" | 父作用域无效 | 检查parents参数 |

## 高级用法

### 1. 变量分析和检查
```javascript
async function analyzeVariables(parents) {
  const result = await debuggerVariables({ parents });
  
  const analysis = {
    total: result.variables.length,
    byType: {},
    editableCount: result.variables.filter(v => v.isEditable).length,
    complexTypes: result.variables.filter(v => v.hasChildren).map(v => v.name)
  };
  
  result.variables.forEach(v => {
    if (!analysis.byType[v.type]) {
      analysis.byType[v.type] = 0;
    }
    analysis.byType[v.type]++;
  });
  
  return analysis;
}
```

### 2. 递归查看复杂变量
```javascript
async function getFullVariableStructure(variableName, parents) {
  // 获取变量
  const result = await debuggerVariables({ parents });
  const variable = result.variables.find(v => v.name === variableName);
  
  if (!variable || !variable.hasChildren) {
    return variable;
  }
  
  // 递归获取子变量
  const childParents = [...parents, variableName];
  const children = await debuggerChildVariables({ parent: childParents });
  
  return {
    ...variable,
    children: await Promise.all(
      children.map(async (child) => {
        if (child.hasChildren) {
          const childParents = [...childParents, child.name];
          return await getFullVariableStructure(child.name, childParents);
        }
        return child;
      })
    )
  };
}
```

## 示例

### 示例1：获取局部变量
```json
{
  "tool": "debuggerVariables",
  "arguments": {
    "parents": ["local"]
  }
}
```

**预期结果：**
```json
{
  "status": "success",
  "result": {
    "variables": [
      {
        "name": "lv_result",
        "type": "I",
        "value": "42",
        "isEditable": true
      },
      {
        "name": "lv_counter",
        "type": "I",
        "value": "10",
        "isEditable": true
      },
      {
        "name": "ls_order",
        "type": "STRUCTURE",
        "value": "{...}",
        "hasChildren": true,
        "isEditable": true
      }
    ]
  }
}
```

---

## 相关工具

- [debuggerAttach](debuggerAttach.md) - 附加到调试会话
- [debuggerChildVariables](debuggerChildVariables.md) - 查看子变量
- [debuggerSetVariableValue](debuggerSetVariableValue.md) - 修改变量值
- [debuggerStackTrace](debuggerStackTrace.md) - 查看堆栈
