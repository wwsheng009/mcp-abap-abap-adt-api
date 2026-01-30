# userTransports

获取用户的传输列表。

## 功能说明

此工具用于获取特定用户的传输请求列表，包括工作台传输和自定义传输。可以按目标系统进行分组。

## 调用方法

**参数**:
- `user` (string, 必需): 用户名
- `targets` (boolean, 可选): 是否包含目标系统信息（默认：true）

**返回值**:
```json
{
  "status": "success",
  "transports": {
    "workbench": [
      {
        "tm:name": "P01",
        "tm:desc": "生产系统 P01",
        "modifiable": [
          {
            "tm:number": "DEVK900123",
            "tm:owner": "DEVELOPER",
            "tm:desc": "Feature X",
            "tm:status": "D",
            "tm:uri": "/sap/bc/adt/cts/transportrequests/...",
            "objects": [],
            "tasks": []
          }
        ],
        "released": [
          {
            "tm:number": "DEVK900124",
            "tm:owner": "DEVELOPER",
            "tm:desc": "Feature Y",
            "tm:status": "R"
          }
        ]
      }
    ],
    "customizing": [...]
  }
}
```

**示例**:
```json
{
  "tool": "userTransports",
  "arguments": {
    "user": "DEVELOPER",
    "targets": true
  }
}
```

## 注意事项

1. **用户权限**: 只能返回当前用户有权限访问的传输

2. **传输类型**: 
   - `workbench`: 工作台传输（程序、类等）
   - `customizing`: 自定义传输（配置等）

3. **传输状态**:
   - `modifiable`: 可修改的传输（状态 = D）
   - `released`: 已释放的传输（状态 = R）

4. **目标系统**: 如果 `targets` 为 true，返回按目标系统分组的信息

5. **传输内容**: 包含传输中的对象和任务信息

## 参数限制

| 参数 | 类型 | 必需 | 限制 |
|------|------|------|------|
| user | string | 是 | 有效的 SAP 用户名 |
| targets | boolean | 否 | 默认 true |

## 与其他工具的关联性

1. **传输管理**:
   ```
   userTransports → 选择传输 → transportRelease
   userTransports → 选择传输 → addObjectToTransport
   ```

2. **与 transportInfo 的关系**:
   - `transportInfo` 查看特定对象的传输信息
   - `userTransports` 查看用户的所有传输

3. **与 transportRelease 的关系**:
   - 选择要释放的传输后，使用 `transportRelease` 释放

## 使用场景说明

### 场景 1: 查看所有传输
```json
{
  "tool": "userTransports",
  "arguments": {
    "user": "DEVELOPER",
    "targets": true
  }
}
```

### 场景 2: 查看待释放的传输
```json
{
  "tool": "userTransports",
  "arguments": {
    "user": "DEVELOPER"
  }
}
// 查看每个目标的 modifiable 传输
```

### 场景 3: 查看已释放的传输
```json
{
  "tool": "userTransports",
  "arguments": {
    "user": "DEVELOPER",
    "targets": true
  }
}
// 查看每个目标的 released 传输
```

### 场景 4: 按目标系统查看
```json
{
  "tool": "userTransports",
  "arguments": {
    "user": "DEVELOPER",
    "targets": true
  }
}
// 返回按目标系统（P01, P02, P03）分组的传输
```

## 传输信息结构

### 传输基本信息

| 字段 | 说明 | 示例 |
|------|------|------|
| tm:number | 传输号 | DEVK900123 |
| tm:owner | 所有者 | DEVELOPER |
| tm:desc | 描述 | Feature X |
| tm:status | 状态 | D=可修改, R=已释放 |
| tm:uri | 传输 URI | /sap/bc/adt/cts/... |
| objects | 包含的对象 | 数组 |
| tasks | 包含的任务 | 数组 |

### 目标系统信息

| 字段 | 说明 | 示例 |
|------|------|------|
| tm:name | 目标系统名称 | P01 |
| tm:desc | 目标系统描述 | 生产系统 P01 |
| modifiable | 可修改的传输列表 | 数组 |
| released | 已释放的传输列表 | 数组 |

## 传输状态说明

| 状态码 | 状态名称 | 说明 | 操作 |
|--------|---------|------|------|
| D | 可修改 (Modifiable) | 可以添加对象 | 继续开发或释放 |
| L | 锁定 (Locked) | 有对象被锁定 | 解锁后释放 |
| R | 已释放 (Released) | 已释放到其他系统 | 可以传输到其他系统 |

## 最佳实践

1. **定期检查**: 定期检查传输状态，确保及时释放

2. **描述规范**: 确保传输描述清晰准确

3. **及时释放**: 完成开发后及时释放传输

4. **传输分组**: 相关对象放在同一传输中

5. **文档记录**: 记录传输的详细信息和变更内容

## 完整工作流程

```json
// 传输管理流程

// 1. 查看用户的传输
{
  "tool": "userTransports",
  "arguments": {
    "user": "DEVELOPER",
    "targets": true
  }
}

// 2. 选择要操作的传输
const transport = transports.workbench[0].modifiable[0]

// 3. 查看传输详情
// 可以使用 transportInfo 查看更多信息

// 4. 执行操作
{
  "tool": "transportRelease",
  "arguments": {
    "transportNumber": transport["tm:number"]
  }
}

// 5. 确认操作结果
// 检查返回的状态和消息
```

## 批量操作

### 批量释放
```json
// 释放所有可修改的传输
for each target in transports.workbench:
  for each transport in target.modifiable:
    {
      "tool": "transportRelease",
      "arguments": {
        "transportNumber": transport["tm:number"]
      }
    }
```

### 批量查询
```json
// 查询特定目标系统的所有传输
const p01Transports = transports.workbench.find(t => t["tm:name"] === "P01")
```

## 高级用法

### 按状态过滤
```json
// 只查看可修改的传输
const modifiableTransports = transports.workbench.flatMap(t => t.modifiable)
```

### 按描述搜索
```json
// 查找特定功能的传输
const featureTransports = allTransports.filter(t => 
  t["tm:desc"].includes("Feature")
)
```

### 统计报告
```json
// 生成传输统计报告
const stats = {
  totalModifiable: transports.workbench.reduce((sum, t) => sum + t.modifiable.length, 0),
  totalReleased: transports.workbench.reduce((sum, t) => sum + t.released.length, 0),
  byTarget: {}
}
// 生成统计信息
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 用户不存在 | 用户名不正确 | 检查用户名 |
| 权限不足 | 没有查看权限 | 联系管理员 |
| 传输数据损坏 | 传输信息损坏 | 联系 BASIS 团队 |

## 安全考虑

1. **权限控制**: 确保用户只能查看自己的传输

2. **敏感信息**: 注意传输可能包含敏感的变更信息

3. **审计日志**: 记录传输查看和操作

4. **访问限制**: 限制对传输信息的访问

