#!/usr/bin/env node

import { spawn } from "child_process"
import readline from "readline"
import path from "path"
import fs from "fs"

// 👇 CJS 环境天然可用
const SERVER_ENTRY = path.resolve(__dirname, "index.js")

// ===== File Logging =====
const logDir = path.resolve(__dirname, "logs")
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const logFile = path.join(logDir, `bridge-${new Date().toISOString().split('T')[0]}.log`)
const logStream = fs.createWriteStream(logFile, { flags: 'a' })

function log(level: string, message: string, data?: any) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  }
  logStream.write(JSON.stringify(entry) + '\n')
}

const child = spawn(process.execPath, [SERVER_ENTRY], {
  stdio: ["pipe", "pipe", "pipe"],
  env: {
    ...process.env,
    MCP_STDIO_MODE: 'true',  // 子进程知道自己运行在 MCP stdio 模式
    LOG_CONSOLE: 'false',    // 禁用 console 输出
    LOG_FILE: 'true'         // 启用文件日志
  }
})

log('INFO', 'Bridge started', {
  serverEntry: SERVER_ENTRY,
  pid: child.pid,
  mcpStdioMode: process.env.MCP_STDIO_MODE,
  logFile: logFile
})

// Discard all stderr output from child process to prevent protocol pollution
child.stderr?.on('data', (chunk) => {
  const output = chunk.toString()
  log('DEBUG', 'Child stderr output (discarded)', { output })
})

child.on("exit", (code) => {
  log('INFO', 'Child process exited', { code })
  process.exit(code ?? 1)
})

// ===== 输入 =====
const rlIn = readline.createInterface({
  input: process.stdin,
  terminal: false
})

// 旧 → 新
rlIn.on("line", (line) => {
  if (!line.trim()) return

  try {
    const msg = JSON.parse(line)
    log('DEBUG', 'Received from client', {
      method: msg.method,
      hasJsonrpc: !!msg.jsonrpc,
      messagePreview: line.substring(0, 100)
    })

    const out = msg.jsonrpc === "2.0"
      ? msg
      : {
          jsonrpc: "2.0",
          id: "legacy-" + Date.now(),
          method: msg.method,
          params: msg.params ?? {}
        }

    child.stdin.write(JSON.stringify(out) + "\n")
    log('DEBUG', 'Forwarded to child', { method: out.method, id: out.id })
  } catch (error) {
    log('ERROR', 'Failed to parse input', { line, error: String(error) })
  }
})

// ===== 输出 =====
const rlOut = readline.createInterface({
  input: child.stdout,
  terminal: false
})

let firstOutputLogged = false

// 新 → 旧：直接转发，不删除 jsonrpc 字段（因为客户端期望完整的 JSON-RPC 2.0 格式）
rlOut.on("line", (line) => {
  if (!line.trim()) return

  // Log first output
  if (!firstOutputLogged) {
    log('INFO', 'First output from child', {
      line: line,
      length: line.length,
      isJson: line.startsWith('{') || line.startsWith('[')
    })
    firstOutputLogged = true
  }

  try {
    const msg = JSON.parse(line)
    log('DEBUG', 'Received from child', { hasJsonrpc: !!msg.jsonrpc, messagePreview: line.substring(0, 100) })

    // 直接转发，保持完整的 JSON-RPC 格式
    const output = JSON.stringify(msg) + "\n"
    process.stdout.write(output)
    log('DEBUG', 'Forwarded to client', {
      messageSize: line.length,
      outputSize: output.length,
      outputPreview: output.substring(0, 100),
      hasJsonrpcInOutput: !!msg.jsonrpc
    })
  } catch (error) {
    log('ERROR', 'Failed to parse output', { line, error: String(error) })
  }
})

process.on("SIGINT", () => {
  log('INFO', 'Received SIGINT, shutting down')
  child.kill("SIGINT")
})

process.on("SIGTERM", () => {
  log('INFO', 'Received SIGTERM, shutting down')
  child.kill("SIGTERM")
})

// Handle child process errors
child.on("error", (error) => {
  log('ERROR', 'Child process error', { error: String(error) })
  process.exit(1);
})
