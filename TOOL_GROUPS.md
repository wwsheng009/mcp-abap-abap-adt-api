# MCP Tool Groups Configuration

The MCP ABAP ADT API server supports tool groups to control which tools are enabled.

## Preset Levels (Recommended)

Use preset levels for simple configuration:

| Level | Description | Tools Included |
|-------|-------------|----------------|
| `minimal` | 只读操作 | auth, object, sourceV2, class, discovery, health |
| `standard` | 基础开发（推荐） | minimal + lock, transport, lifecycle, codeAnalysis, node, ddic |
| `advanced` | 高级功能 | standard + unitTest, rename, git, trace, prettyPrinter |
| `full` | 所有功能（默认） | advanced + debug, atc, query, feed, serviceBinding, revision |

```bash
# 推荐：标准开发（大部分场景）
MCP_TOOLS=standard

# 只读操作（查看代码）
MCP_TOOLS=minimal

# 默认：所有工具
MCP_TOOLS=full
# 或不设置 MCP_TOOLS
```

## Custom Configuration

You can also specify custom groups:

```bash
# 自定义组合
MCP_TOOLS=auth,lock,sourceV2,class,codeAnalysis
```

## Available Tool Groups

| Group | Description | Tools |
|-------|-------------|-------|
| **auth** | Authentication and session management | login, logout, dropSession |
| **transport** | Transport request management | transportInfo, createTransport, hasTransportConfig, transportConfigurations, getTransportConfiguration, setTransportsConfig, createTransportsConfig, userTransports, transportsByConfig, transportDelete, transportRelease, transportSetOwner, transportAddUser, transportReference |
| **lock** | Object lock/unlock operations | lock, unLock |
| **object** | Core object operations | objectStructure, searchObject, findObjectPath, objectTypes, reentranceTicket |
| **source** | Source code operations (V1 - simple) | getObjectSource, setObjectSource |
| **sourceV2** | Source code operations (V2 - optimized) | getObjectSourceV2, grepObjectSource, setObjectSourceV2 |
| **class** | ABAP class operations | classIncludes, classComponents |
| **codeAnalysis** | Code analysis (syntax, completion, navigation) | syntaxCheckCode, syntaxCheckCdsUrl, codeCompletion, findDefinition, usageReferences, syntaxCheckTypes, codeCompletionFull, runClass, codeCompletionElement, usageReferenceSnippets, fixProposals, fixEdits, fragmentMappings, abapDocumentation |
| **lifecycle** | Object lifecycle management | activateObjects, activateByName, inactiveObjects, deleteObject, objectRegistrationInfo, validateNewObject, createObject |
| **node** | Package/node operations | nodeContents, mainPrograms |
| **discovery** | ADT discovery and feature detection | featureDetails, collectionFeatureDetails, findCollectionByUrl, loadTypes, adtDiscovery, adtCoreDiscovery, adtCompatibiliyGraph |
| **ddic** | Data dictionary operations | annotationDefinitions, ddicElement, ddicRepositoryAccess, packageSearchHelp |
| **unitTest** | Unit test operations | unitTestRun, unitTestEvaluation, unitTestOccurrenceMarkers, createTestInclude |
| **prettyPrinter** | ABAP pretty printer | prettyPrinterSetting, setPrettyPrinterSetting, prettyPrinter |
| **serviceBinding** | OData service binding operations | publishServiceBinding, unPublishServiceBinding, bindingDetails |
| **query** | Database query operations | tableContents, runQuery |
| **feed** | Feed and dump operations | feeds, dumps |
| **git** | Git repository operations | gitRepos, gitExternalRepoInfo, gitCreateRepo, gitPullRepo, gitUnlinkRepo, stageRepo, pushRepo, checkRepo, remoteRepoInfo, switchRepoBranch |
| **debug** | Debugger operations | debuggerListeners, debuggerListen, debuggerDeleteListener, debuggerSetBreakpoints, debuggerDeleteBreakpoints, debuggerAttach, debuggerSaveSettings, debuggerStackTrace, debuggerVariables, debuggerChildVariables, debuggerStep, debuggerGoToStack, debuggerSetVariableValue |
| **rename** | Refactoring and rename operations | renameEvaluate, renamePreview, renameExecute, extractMethodEvaluate, extractMethodPreview, extractMethodExecute |
| **atc** | ATC (Automatic Test Config) operations | atcCustomizing, atcCheckVariant, createAtcRun, atcWorklists, atcUsers, atcExemptProposal, atcRequestExemption, isProposalMessage, atcContactUri, atcChangeContact |
| **trace** | Performance trace operations | tracesList, tracesListRequests, tracesHitList, tracesDbAccess, tracesStatements, tracesSetParameters, tracesCreateConfiguration, tracesDeleteConfiguration, tracesDelete |
| **revision** | Revision history operations | revisions |
| **health** | Server health check | healthcheck |

## Environment Variables

Create a `.env` file in the project root:

```env
# SAP Connection
SAP_URL=http://your-sap-server:8080
SAP_USER=your_username
SAP_PASSWORD=your_password
SAP_CLIENT=800
SAP_LANGUAGE=EN

# Tool Groups (optional)
# Options: minimal, standard, advanced, full, or custom comma-separated groups
# Default: full (all tools)
MCP_TOOLS=standard
```
