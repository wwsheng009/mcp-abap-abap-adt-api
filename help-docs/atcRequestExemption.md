# atcRequestExemption

## 功能说明
请求ATC问题的豁免。提交豁免请求后，需要经过审批才能生效。

## 调用方法
```json
{
  "tool": "atcRequestExemption",
  "arguments": {
    "proposal": {
      "markerId": "find_001",
      "reason": "Legacy code, refactoring planned for Q2 2024",
      "expiryDate": "2024-06-30"
    }
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| proposal | object | 是 | 豁免提案对象 |
| proposal.markerId | string | 是 | 问题标记ID |
| proposal.reason | string | 是 | 豁免理由 |
| proposal.expiryDate | string | 否 | 过期日期 |

## 返回结果示例
```json
{
  "status": "success",
  "exemption": {
    "id": "exempt_001",
    "status": "pending",
    "submittedBy": "DEVELOPER01",
    "submittedAt": "2024-01-30T10:30:00Z"
  }
}
```

## 使用场景
为无法立即修复的问题请求豁免。

---

## 相关工具
- [atcExemptProposal](atcExemptProposal.md) - 获取豁免建议
- [isProposalMessage](isProposalMessage.md) - 检查是否为建议消息
