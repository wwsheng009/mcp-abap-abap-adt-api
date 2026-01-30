# debuggerStep

执行单步调试。

**参数**:
- `steptype` (string, 必需): 步骤类型（stepInto, stepOver, stepReturn, stepRunToLine, stepJumpToLine）
- `url` (string, 可选): 用于 stepRunToLine 或 stepJumpToLine 的 URL

**返回值**:
```json
{
  "status": "success",
  "result": "Step executed"
}
```

---

## 21. ATC 检查 (ATC)