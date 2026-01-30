# atcExemptProposal

## 功能说明
获取ATC问题的豁免建议。对于某些检查发现，可能需要豁免（不修复），此工具提供豁免的建议和理由。

## 调用方法
```json
{
  "tool": "atcExemptProposal",
  "arguments": {
    "markerId": "find_001"
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| markerId | string | 是 | 问题标记ID |

## 返回结果示例
```json
{
  "status": "success",
  "proposal": {
    "markerId": "find_001",
    "canExempt": true,
    "reason": "Legacy code, refactoring planned for Q2 2024",
    "expiryDate": "2024-06-30",
    "approver": "QUALITY_MANAGER"
  }
}
```

## 使用场景
为检查发现创建豁免请求。

---

## 相关工具
- [atcRequestExemption](atcRequestExemption.md) - 请求豁免
- [atcWorklists](atcWorklists.md) - 获取工作列表
