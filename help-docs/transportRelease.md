# transportRelease

释放传输请求。

## 功能说明

此工具用于释放传输请求，使其可以被传输到其他系统。释放后的传输请求将包含所有已修改的对象，不能再添加新对象。

## 调用方法

**参数**:
- `transportNumber` (string, 必需): 传输请求号
- `ignoreLocks` (boolean, 可选): 是否忽略锁定（默认：false）
- `IgnoreATC` (boolean, 可选): 是否忽略 ATC 检查错误（默认：false）

**返回值**:
```json
{
  "status": "success",
  "reports": [
    {
      "chkrun:reporter": "ATC",
      "chkrun:triggeringUri": "/sap/bc/adt/cts/transportrequests/...",
      "chkrun:status": "released",
      "chkrun:statusText": "Transport released successfully",
      "messages": []
    }
  ]
}
```

**示例**:
```json
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": "DEVK900123"
  }
}
```

## 注意事项

1. **不可逆操作**: 释放后无法撤销，不能再添加对象到传输

2. **ATC 检查**: 默认情况下会进行 ATC 检查，如果有严重错误会阻止释放

3. **锁定检查**: 默认情况下会检查对象锁定，有锁定会阻止释放

4. **任务释放**: 释放传输请求会同时释放所有关联的任务

5. **系统传输**: 只有可修改的传输才能释放（TRSTATUS = D）

6. **依赖检查**: 释放时会检查对象的依赖关系

7. **释放后**: 传输请求变为只读，但仍可查看和传输到其他系统

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| transportNumber | string | 是 | 必须是有效的传输请求号 |
| ignoreLocks | boolean | 否 | 默认 false |
| IgnoreATC | boolean | 否 | 默认 false |

## 与其他工具的关联性

1. **传输管理流程**:
   ```
   transportInfo → lock → setObjectSource → activateByName → transportRelease
   ```

2. **用户传输**:
   ```
   userTransports → 选择传输 → transportRelease
   ```

3. **ATC 检查**:
   ```
   createAtcRun → atcWorklists → 修复问题 → transportRelease
   ```

4. **与 activateByName 的关系**:
   - 释放前应该确保所有对象都已激活

## 使用场景说明

### 场景 1: 标准释放
```json
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": "DEVK900123"
  }
}
```

### 场景 2: 忽略 ATC 检查
```json
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": "DEVK900123",
    "IgnoreATC": true
  }
}
```

### 场景 3: 忽略锁定
```json
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": "DEVK900123",
    "ignoreLocks": true
  }
}
```

### 场景 4: 检查后释放
```json
// 步骤 1: 查看 ATC 结果
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "atc_run_id"
  }
}

// 步骤 2: 确保所有对象已激活
{
  "tool": "inactiveObjects",
  "arguments": {}
}

// 步骤 3: 释放传输
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": "DEVK900123"
  }
}
```

## 释放状态

| 状态 | 说明 | 含义 |
|------|------|------|
| released | 释放成功 | 传输已成功释放 |
| abortrelapifail | 释放失败 | 有错误阻止释放 |
| partial | 部分释放 | 部分对象释放失败 |

## 释放检查清单

释放前确保：

- [ ] 所有对象已激活
- [ ] ATC 检查通过或确认可以忽略
- [ ] 没有对象锁定（或确认可以忽略）
- [ ] 传输请求描述正确
- [ ] 所有必需的对象都已添加
- [ ] 检查了依赖关系
- [ ] 备份了相关信息

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 对象未激活 | 有未激活对象 | 使用 activateObjects 激活 |
| ATC 错误 | ATC 检查发现问题 | 修复问题或设置 IgnoreATC |
| 锁定冲突 | 对象被锁定 | 使用 ignoreLocks 或等待 |
| 权限不足 | 用户没有释放权限 | 联系传输所有者 |
| 依赖错误 | 依赖对象有问题 | 检查并修复依赖对象 |

## 完整工作流程

```json
// 完整的开发-释放工作流

// 1. 开发和测试阶段
// [使用对象操作工具开发和测试代码...]

// 2. 检查未激活对象
{
  "tool": "inactiveObjects",
  "arguments": {}
}
// 确保没有未激活对象

// 3. 运行 ATC 检查（可选但推荐）
{
  "tool": "createAtcRun",
  "arguments": {
    "variant": "DEFAULT",
    "mainUrl": "/sap/bc/adt/oo/classes/zcl_class",
    "maxResults": 100
  }
}

// 4. 获取 ATC 结果
{
  "tool": "atcWorklists",
  "arguments": {
    "runResultId": "run_result_id"
  }
}

// 5. 修复 ATC 发现的问题
// [修复代码...]

// 6. 释放传输
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": "DEVK900123"
  }
}

// 7. 检查释放结果
// 返回释放状态和消息

// 8. 确认释放成功
if status === "released":
  console.log("传输已成功释放")
else:
  console.log("释放失败，需要检查错误")
```

## 批量释放

### 按系统释放
```json
// 释放传输到特定系统
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": "DEVK900123"
  }
}
// 然后在 STMS (Transport Management System) 中传输到目标系统
```

### 多个传输
```json
// 释放多个传输
for each transport in transports:
  {
    "tool": "transportRelease",
    "arguments": {
      "transportNumber": transport.TRKORR
    }
  }
```

## 最佳实践

1. **激活所有对象**: 释放前确保所有对象都已激活

2. **ATC 检查**: 释放前运行 ATC 检查，确保代码质量

3. **检查依赖**: 检查对象的依赖关系

4. **备份信息**: 释放前备份相关信息

5. **测试验证**: 在释放前进行充分的测试

6. **文档记录**: 记录释放的传输和包含的对象

7. **错误处理**: 妥善处理释放错误

## 安全考虑

1. **权限验证**: 确保只有授权用户可以释放传输

2. **变更审核**: 重要变更应该经过审核

3. **影响评估**: 评估释放的影响范围

4. **回滚计划**: 准备回滚计划以防万一

## 高级用法

### 条件释放
```json
// 检查条件后决定是否释放
if all_objects_activated AND atc_passed:
  {
    "tool": "transportRelease",
    "arguments": {
      "transportNumber": "DEVK900123"
    }
  }
else:
  // 不释放，修复问题
```

### 自动化释放
```json
// 在 CI/CD 流程中自动释放
// 前提条件：所有对象激活、ATC 通过
```

### 释放通知
```json
// 释放成功后通知相关人员
// 发送邮件或消息包含传输信息
```

## 释放后操作

1. **传输到其他系统**: 在 STMS 中将释放的传输传输到其他系统

2. **验证传输**: 在目标系统验证传输内容

3. **文档记录**: 记录传输的详细信息

4. **清理工作区**: 清理本地工作区（如果使用 $TMP）

5. **继续开发**: 开始下一个开发周期