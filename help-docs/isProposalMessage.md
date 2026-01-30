# isProposalMessage

## 功能说明
检查给定对象是否为ATC建议消息。建议消息通常提供代码改进建议，不是必须修复的错误。

## 调用方法
```json
{
  "tool": "isProposalMessage",
  "arguments": {
    "proposal": {
      "markerId": "find_001",
      "type": "syntax"
    }
  }
}
```

## 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| proposal | object | 是 | 提案对象 |

## 返回结果示例
```json
{
  "status": "success",
  "isProposal": true,
  "proposal": {
    "markerId": "find_001",
    "type": "proposal",
    "message": "Consider using modern ABAP syntax"
  }
}
```

## 使用场景
判断检查发现是否为建议消息。

---

## 相关工具
- [atcWorklists](atcWorklists.md) - 获取工作列表
- [atcExemptProposal](atcExemptProposal.md) - 获取豁免建议
