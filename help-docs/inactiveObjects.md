# inactiveObjects

获取所有未激活的对象。

## 功能说明

此工具用于列出当前用户的所有未激活对象。未激活对象是指已修改但尚未激活，修改尚未在系统中生效的对象。

## 调用方法

**参数**: 无

**返回值**:
```json
{
  "status": "success",
  "inactiveObjects": [
    {
      "name": "ZCL_MY_CLASS",
      "url": "/sap/bc/adt/oo/classes/zcl_my_class",
      "type": "CLAS"
    }
  ]
}
```

## 注意事项

1. **当前用户**: 只返回当前用户的未激活对象

2. **对象类型**: 可能包括各种类型的对象（类、程序、接口等）

3. **激活要求**: 这些对象需要激活才能在系统中使用

4. **自动更新**: 当对象被激活后，会从此列表中移除

5. **性能考虑**: 如果有大量未激活对象，返回可能较慢

6. **会话范围**: 结果基于当前会话，可能不反映其他用户的修改

7. **临时状态**: 未激活状态只在会话中持久

## 参数限制

- 无参数

## 与其他工具的关联性

1. **配合使用**:
   ```
   inactiveObjects → activateByName（逐个激活）
   inactiveObjects → activateObjects（批量激活）
   ```

2. **编辑工作流**:
   ```
   [编辑操作] → inactiveObjects → 查看需要激活的对象 → activateByName
   ```

3. **与 inactiveObjects 的关系**:
   - 激活后，对象从此列表中移除
   - 新的未激活对象会出现在列表中

## 使用场景说明

### 场景 1: 查看未激活对象
```json
{
  "tool": "inactiveObjects",
  "arguments": {}
}
// 返回所有未激活的对象
```

### 场景 2: 批量激活未激活对象
```json
// 步骤 1: 获取未激活对象列表
{"tool": "inactiveObjects", "arguments": {}}

// 步骤 2: 批量激活
{"tool": "activateObjects", "arguments": {"objects": [...]}}
```

### 场景 3: 选择性激活
```json
// 步骤 1: 获取未激活对象
{"tool": "inactiveObjects", "arguments": {}}

// 步骤 2: 选择特定对象激活
{"tool": "activateByName", "arguments": {"object": "ZCL_CLASS", "url": "..."}}
```

### 场景 4: 状态检查
```json
// 在编辑前检查是否有未激活对象
{"tool": "inactiveObjects", "arguments": {}}
// 如果有未激活对象，先激活它们
```

## 未激活对象类型

未激活对象可能包括：

| 类型 | 说明 | 示例 URL |
|------|------|----------|
| CLAS | 类 | /sap/bc/adt/oo/classes/zcl_* |
| PROG | 程序 | /sap/bc/adt/programs/programs/z* |
| INTF | 接口 | /sap/bc/adt/oo/interfaces/zif_* |
| FUGR | 函数组 | /sap/bc/adt/fugr/fugrs/zfg_* |
| TABL | 表 | /sap/bc/adt/ddic/tables/tables/z* |

## 激活策略

### 策略 1: 立即激活
```json
// 每次编辑后立即激活
// 优点: 确保状态一致
// 缺点: 可能频繁激活
```

### 策略 2: 批量激活
```json
// 多次编辑后批量激活
// 优点: 高效
// 缺点: 需要管理未激活对象列表
```

### 策略 3: 按需激活
```json
// 只在需要时激活
// 优点: 灵活
// 缺点: 可能忘记激活
```

## 最佳实践

1. **定期检查**: 在完成编辑后检查未激活对象

2. **批量激活**: 使用 `activateObjects` 批量激活多个对象

3. **错误处理**: 检查激活结果，处理失败的对象

4. **依赖管理**: 考虑对象间的依赖关系

5. **日志记录**: 记录激活操作以便追踪

## 工作流程示例

```json
// 完整的编辑-激活工作流

// 1. 检查现有未激活对象
{"tool": "inactiveObjects", "arguments": {}}
// 如果有未激活对象，先激活它们

// 2. 执行编辑操作
// [多个编辑操作...]

// 3. 再次检查未激活对象
{"tool": "inactiveObjects", "arguments": {}}

// 4. 激活所有未激活对象
{"tool": "activateObjects", "arguments": {"objects": [...]}}

// 5. 检查激活结果
// 处理任何失败的对象
```

## 结果解析

```json
{
  "inactiveObjects": [
    {
      "name": "ZCL_CLASS1",
      "url": "/sap/bc/adt/oo/classes/zcl_class1",
      "type": "CLAS",
      "mainInclude": "/sap/bc/adt/oo/classes/zcl_class1/source/main"
    },
    {
      "name": "ZPROG1",
      "url": "/sap/bc/adt/programs/programs/zprog1",
      "type": "PROG",
      "mainInclude": "/sap/bc/adt/programs/programs/zprog1/source/main"
    }
  ]
}
```

## 常见问题

### Q1: 为什么对象还在未激活列表中？
**A**: 可能的原因:
- 对象激活失败
- 语法错误阻止激活
- 对象被其他用户锁定

### Q2: 可以激活其他用户的未激活对象吗？
**A**: 不可以，`inactiveObjects` 只返回当前用户的未激活对象

### Q3: 未激活的对象在重启后还存在吗？
**A**: 未激活状态在会话中持久，但建议在会话结束前激活

### Q4: 激活顺序重要吗？
**A**: 是的，建议按依赖关系顺序激活

## 批量激活建议

对于大量未激活对象：

1. **分批激活**: 每批 10-20 个对象

2. **按类型分组**: 同类型的对象一起激活

3. **检查依赖**: 确保依赖对象已激活

4. **错误重试**: 对失败的对象单独重试

5. **日志记录**: 记录每次激活的结果

## 完整示例

```json
// 完整的未激活对象处理流程

// 1. 获取未激活对象
{"tool": "inactiveObjects", "arguments": {}}
// 返回: 10 个未激活对象

// 2. 分批激活
// 第一批: 前 5 个对象
{"tool": "activateObjects", "arguments": {"objects": [对象1-5]}}
// 返回: 全部成功

// 第二批: 后 5 个对象
{"tool": "activateObjects", "arguments": {"objects": [对象6-10]}}
// 返回: 对象8失败

// 3. 处理失败的对象
{"tool": "activateByName", "arguments": {"object": "ZCL_FAILED", "url": "..."}}
// 仍然失败，检查错误消息

// 4. 修复错误后重试
// [修复对象8的语法错误]

// 5. 重试激活失败的对象
{"tool": "activateByName", "arguments": {"object": "ZCL_FAILED", "url": "..."}}
// 成功

// 6. 确认所有对象已激活
{"tool": "inactiveObjects", "arguments": {}}
// 返回: 空
```