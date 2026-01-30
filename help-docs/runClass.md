# runClass

运行 ABAP 类。

## 功能说明

此工具用于直接执行 ABAP 类,通常用于:
- 测试类功能
- 运行实用程序类
- 执行后台任务
- 调试和诊断

类必须满足以下条件才能运行:
- 有一个公共静态方法作为入口点
- 或实现了 `IF_OO_ADT_CLASSRUN` 接口

## 调用方法

**参数**:
- `className` (string, 必需): 类名称

**返回值**:
```json
{
  "status": "success",
  "result": {
    "output": "Hello World\nProcess completed successfully\n",
    "returnCode": 0,
    "messages": [
      {
        "type": "info",
        "text": "Starting execution..."
      },
      {
        "type": "output",
        "text": "Hello World"
      },
      {
        "type": "success",
        "text": "Execution completed"
      }
    ],
    "executionTime": 1234
  }
}
```

**示例**:
```json
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_MY_CLASS"
  }
}
```

## 注意事项

1. **类名称**: 使用完整的类名称,包括命名空间前缀

2. **运行条件**:
   - 类必须存在且可激活
   - 必须有公共静态方法作为入口点
   - 或实现 `IF_OO_ADT_CLASSRUN` 接口

3. **输出捕获**:
   - 标准输出会被捕获并返回
   - 包括 `WRITE`、`cl_demo_output=>write()` 等输出

4. **执行时间**:
   - 返回执行时间(毫秒)
   - 用于性能分析

5. **错误处理**:
   - 如果类执行失败,返回错误信息
   - 包含异常类型和消息

6. **权限**:
   - 用户必须有执行该类的权限
   - 需要适当的开发权限

7. **返回代码**:
   - `0`: 成功
   - 非 `0`: 失败或错误

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| className | string | 是 | 必须是有效的类名称 |

## 与其他工具的关联性

1. **与 classComponents 的关系**:
   ```
   classComponents → 查看类结构 → runClass
   ```

2. **与 getObjectSourceV2 的关系**:
   ```
   getObjectSourceV2 (查看代码) → 修改 → runClass (测试)
   ```

3. **开发流程**:
   ```
   编辑类 → 激活 → runClass (测试) → 调试
   ```

4. **与 unitTestRun 的关系**:
   ```
   runClass: 运行单个类
   unitTestRun: 运行单元测试
   ```

## 使用场景说明

### 场景 1: 运行实现了 IF_OO_ADT_CLASSRUN 的类
```json
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_DEMO_CLASS"
  }
}
// 类实现了 IF_OO_ADT_CLASSRUN 接口
// 运行 if_oo_adt_classrun~main 方法
```

### 场景 2: 测试修改后的类
```json
// 步骤 1: 修改类代码
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    ...
  }
}

// 步骤 2: 激活类
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_MY_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 步骤 3: 运行类测试
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_MY_CLASS"
  }
}
```

### 场景 3: 运行实用程序类
```json
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_BATCH_PROCESSOR"
  }
}
// 运行批处理任务
```

### 场景 4: 调试类
```json
// 步骤 1: 设置断点
{
  "tool": "debuggerSetBreakpoints",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "breakpoints": [
      { "line": 25 }
    ]
  }
}

// 步骤 2: 运行类
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_MY_CLASS"
  }
}

// 步骤 3: 在断点处暂停,进行调试
```

### 场景 5: 性能测试
```json
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_PERFORMANCE_TEST"
  }
}
// 检查返回的 executionTime
// 分析性能
```

## 类实现方式

### 方式 1: 实现 IF_OO_ADT_CLASSRUN
```abap
CLASS zcl_demo_class DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
ENDCLASS.

CLASS zcl_demo_class IMPLEMENTATION.
  METHOD if_oo_adt_classrun~main.
    out->write( 'Hello World' ).
  ENDMETHOD.
ENDCLASS.
```

### 方式 2: 静态方法入口
```abap
CLASS zcl_utility_class DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.
    CLASS-METHODS: main.
ENDCLASS.

CLASS zcl_utility_class IMPLEMENTATION.
  METHOD main.
    WRITE: / 'Hello World'.
  ENDMETHOD.
ENDCLASS.
```

## 输出捕获

### WRITE 语句
```abap
WRITE: / 'Line 1'.
WRITE: / 'Line 2'.
```
捕获输出:
```
Line 1
Line 2
```

### cl_demo_output
```abap
cl_demo_output=>write( 'Hello' ).
cl_demo_output=>write( 'World' ).
cl_demo_output=>display( ).
```
捕获输出:
```
Hello
World
```

## 消息类型

| 类型 | 说明 | 示例 |
|------|------|------|
| info | 信息消息 | "Starting execution..." |
| output | 标准输出 | "Hello World" |
| success | 成功消息 | "Execution completed" |
| warning | 警告消息 | "Deprecation warning" |
| error | 错误消息 | "Division by zero" |

## 完整工作流程

```json
// 开发、测试和运行流程

// 1. 查找或创建类
{
  "tool": "searchObject",
  "arguments": {
    "name": "ZCL_MY_CLASS",
    "type": "CLAS"
  }
}

// 2. 读取类代码
{
  "tool": "getObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main"
  }
}

// 3. 查看类组件
{
  "tool": "classComponents",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 4. 编辑类代码(客户端)

// 5. 锁定对象
{
  "tool": "lock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 6. 保存修改
{
  "tool": "setObjectSourceV2",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    ...
  }
}

// 7. 激活类
{
  "tool": "activateByName",
  "arguments": {
    "object": "ZCL_MY_CLASS",
    "url": "/sap/bc/adt/oo/classes/zcl_my_class"
  }
}

// 8. 语法检查
{
  "tool": "syntaxCheckCode",
  "arguments": {
    "url": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "code": "..."
  }
}

// 9. 运行类
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_MY_CLASS"
  }
}

// 10. 解锁对象
{
  "tool": "unLock",
  "arguments": {
    "objectUrl": "/sap/bc/adt/oo/classes/zcl_my_class",
    "lockHandle": "..."
  }
}
```

## 最佳实践

1. **实现 IF_OO_ADT_CLASSRUN**: 推荐使用此接口,简单且标准

2. **输出清晰**: 使用清晰的输出信息,便于调试

3. **错误处理**: 在类中实现错误处理

4. **日志记录**: 记录重要的执行步骤

5. **返回代码**: 使用适当的返回代码

6. **测试覆盖**: 为所有公共方法编写测试

7. **性能监控**: 注意执行时间

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 类不存在 | 类名称错误 | 检查类名称 |
| 未激活 | 类未激活 | 先激活类 |
| 无入口方法 | 没有可运行的方法 | 实现 IF_OO_ADT_CLASSRUN 或静态方法 |
| 权限不足 | 没有执行权限 | 联系管理员 |
| 运行时错误 | 代码有错误 | 检查代码逻辑 |
| 超时 | 执行时间过长 | 优化代码或增加超时时间 |

## 高级用法

### 参数化运行
```abap
CLASS zcl_parameterized_run DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
    CLASS-METHODS: set_parameters IMPORTING iv_param TYPE string.
  PRIVATE SECTION.
    CLASS-DATA: mv_param TYPE string.
ENDCLASS.

CLASS zcl_parameterized_run IMPLEMENTATION.
  METHOD if_oo_adt_classrun~main.
    out->write( mv_param ).
  ENDMETHOD.
  METHOD set_parameters.
    mv_param = iv_param.
  ENDMETHOD.
ENDCLASS.
```

### 批量运行
```json
// 运行多个类进行批量测试
for each className in classList:
  {
    "tool": "runClass",
    "arguments": {
      "className": className
    }
  }
```

### CI/CD 集成
```json
// 在持续集成中运行测试类
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_CI_TESTS"
  }
}
// 检查返回代码和输出
// 如果失败,CI 流程失败
```

## 与调试器集成

```json
// 完整的调试流程

// 1. 启动调试监听器
{
  "tool": "debuggerListen",
  "arguments": {
    "port": 12345
  }
}

// 2. 设置断点
{
  "tool": "debuggerSetBreakpoints",
  "arguments": {
    "sourceUrl": "/sap/bc/adt/oo/classes/zcl_my_class/source/main",
    "breakpoints": [
      { "line": 25 },
      { "line": 50 }
    ]
  }
}

// 3. 运行类
{
  "tool": "runClass",
  "arguments": {
    "className": "ZCL_MY_CLASS"
  }
}

// 4. 在断点处暂停

// 5. 查看堆栈跟踪
{
  "tool": "debuggerStackTrace",
  "arguments": {
    "sessionId": "..."
  }
}

// 6. 查看变量
{
  "tool": "debuggerVariables",
  "arguments": {
    "sessionId": "..."
  }
}

// 7. 单步执行
{
  "tool": "debuggerStep",
  "arguments": {
    "sessionId": "...",
    "action": "stepOver"
  }
}
```

## 性能优化建议

1. **避免无限循环**: 确保类有终止条件

2. **优化算法**: 使用高效的算法

3. **减少输出**: 减少不必要的输出

4. **缓存结果**: 缓存计算结果

5. **批量处理**: 批量处理数据

## 安全考虑

1. **权限控制**: 确保只有授权用户可以运行类

2. **输入验证**: 验证输入参数

3. **资源限制**: 限制资源使用

4. **错误处理**: 妥善处理错误

5. **日志记录**: 记录执行日志
