# fragmentMappings功能测试报告

## 测试目的
验证fragmentMappings功能是否能够正确获取对象的片段映射信息

## 测试环境
- 系统：ECC1809
- 开发包：$TMP
- 测试时间：2026-01-30

## 测试步骤
1. 尝试使用CL_GUI_CALENDAR类作为测试对象
2. 调用fragmentMappings功能查找CONSTRUCTOR方法的位置信息
3. 尝试不同的参数组合
4. 检查返回结果

## 测试结果
- 调用失败，返回错误："MCP error -32603: Fragment mappings failed: URI-Mapping cannot be performed due to invalid fragment type=method;name=CONSTRUCTOR"
- 更改参数后仍然失败，返回："MCP error -32603: Fragment mappings failed: URI-Mapping cannot be performed due to invalid workbench request"
- 功能无法正确解析提供的参数

## 结论
fragmentMappings功能在当前环境中无法正常工作，存在URI映射问题。功能本身无法获取对象的片段映射信息。