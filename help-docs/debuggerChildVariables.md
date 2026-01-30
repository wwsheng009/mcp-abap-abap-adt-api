# debuggerChildVariables

## 功能说明
获取复杂类型变量（结构、表、对象等）的子变量详细信息。当变量包含嵌套数据时，使用此工具可以查看内部字段或元素。

## 调用方法

### 通过MCP工具调用
```json
{
  "tool": "debuggerChildVariables",
  "arguments": {
    "parent": ["local", "ls_order"]
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
        "name": "VBELN",
        "type": "CHAR",
        "length": 10,
        "value": "0000000010",
        "isEditable": true,
        "hasChildren": false
      },
      {
        "name": "KUNNR",
        "type": "CHAR",
        "length": 10,
        "value": "0000000010",
        "isEditable": true,
        "hasChildren": false
      },
      {
        "name": "NETWR",
        "type": "CURR",
        "length": 15,
        "value": "5000.00",
        "isEditable": true,
        "hasChildren": false
      }
    ]
  }
}
```

## 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| parent | array | 否 | 父变量路径数组，用于指定要查看的变量 |

## 注意事项

⚠️ **重要提示：**
1. 必须在调试会话中调用
2. parent路径必须从`debuggerVariables`获取
3. 对于深层嵌套结构，可能需要多次调用
4. 表类型变量返回的是表的行

## 参数限制

- `parent`：必须是有效的变量路径

## 与其他工具的关联性

- **debuggerVariables** - 获取父变量列表（必须先调用）
- **debuggerSetVariableValue** - 修改子变量值
- **debuggerAttach** - 附加到调试会话

## 使用场景说明

### 场景1：查看结构的字段
```json
{
  "parent": ["local", "ls_order"]
}
```

### 场景2：查看表的行
```json
{
  "parent": ["local", "lt_items", "[1]"]
}
```

### 场景3：查看嵌套结构的字段
```json
{
  "parent": ["local", "ls_header", "ls_item"]
}
```

## 最佳实践

✅ **推荐做法：**
1. 先使用`debuggerVariables`获取父变量
2. 使用正确的父变量路径
3. 对于深层嵌套结构，递归调用此工具
4. 结合修改变量值进行测试

❌ **避免做法：**
1. 不要在非调试状态下调用
2. 避免使用无效的父变量路径

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "No active debug session" | 没有活跃的调试会话 | 先附加到调试会话 |
| "Invalid parent path" | 父变量路径无效 | 检查parent参数 |
| "Variable has no children" | 变量没有子变量 | 检查变量类型 |

## 高级用法

### 1. 递归获取完整结构
```javascript
async function getCompleteStructure(parentPath) {
  const result = await debuggerChildVariables({ parent: parentPath });
  
  const variables = [];
  
  for (const variable of result.variables) {
    const fullVariable = { ...variable };
    
    if (variable.hasChildren) {
      const childPath = [...parentPath, variable.name];
      fullVariable.children = await getCompleteStructure(childPath);
    }
    
    variables.push(fullVariable);
  }
  
  return variables;
}
```

### 2. 查找特定字段
```javascript
async function findField(fieldName, startPath = ["local"]) {
  const result = await debuggerChildVariables({ parent: startPath });
  
  for (const variable of result.variables) {
    if (variable.name === fieldName) {
      return variable;
    }
    
    if (variable.hasChildren) {
      const childPath = [...startPath, variable.name];
      const found = await findField(fieldName, childPath);
      if (found) return found;
    }
  }
  
  return null;
}
```

## 示例

### 示例1：查看结构的字段
```json
{
  "tool": "debuggerChildVariables",
  "arguments": {
    "parent": ["local", "ls_order"]
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
        "name": "VBELN",
        "type": "CHAR",
        "length": 10,
        "value": "0000000010",
        "isEditable": true,
        "hasChildren": false
      },
      {
        "name": "KUNNR",
        "type": "CHAR",
        "length": 10,
        "value": "0000000010",
        "isEditable": true,
        "hasChildren": false
      }
    ]
  }
}
```

### 示例2：查看表的行
```json
{
  "tool": "debuggerChildVariables",
  "arguments": {
    "parent": ["local", "lt_items"]
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
        "name": "[1]",
        "type": "STRUCTURE",
        "value": "{...}",
        "isEditable": true,
        "hasChildren": true
      },
      {
        "name": "[2]",
        "type": "STRUCTURE",
        "value": "{...}",
        "isEditable": true,
        "hasChildren": true
      }
    ]
  }
}
```

---

## 相关工具

- [debuggerVariables](debuggerVariables.md) - 获取父变量列表
- [debuggerSetVariableValue](debuggerSetVariableValue.md) - 修改变量值
- [debuggerAttach](debuggerAttach.md) - 附加到调试会话
