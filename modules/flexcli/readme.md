
## 安装

```bash
npm install -g flexcli
```

或在本地安装后通过 `npx` 直接调用。

---

## 基本用法

### 命令格式

```bash
flexcli [全局选项] <command> [命令选项]
```

- **全局选项**  
  - `--port <number>`：指定 WebSocket 端口，默认 `60109`。

### 插件操作（`plugin`）

1. **link**  
   - 用途：链接插件到系统  
   - 参数：  
     - `--path <path>`：文件夹路径  
     - `--uuid <uuid>`：插件 UUID  
   - 示例：
     ```bash
     flexcli plugin link --path /path/to/plugin --uuid 12345
     ```

2. **restart**  
   - 用途：重启指定插件  
   - 参数：  
     - `--uuid <uuid>`：插件 UUID  
   - 示例：
     ```bash
     flexcli plugin restart --uuid 12345
     ```

3. **unlink**  
   - 用途：解除插件链接  
   - 参数：  
     - `--uuid <uuid>`：插件 UUID  
   - 示例：
     ```bash
     flexcli plugin unlink --uuid 12345
     ```

4. **debug**  
   - 用途：启动插件调试  
   - 参数：  
     - `--uuid <uuid>`：插件 UUID  
   - 示例：
     ```bash
     flexcli plugin debug --uuid 12345
     ```
   - 执行成功后，命令行会返回一个调试端口号。

5. **list**  
   - 用途：列出所有插件信息  
   - 示例：
     ```bash
     flexcli plugin list
     ```

---

## 典型示例

```bash
# 指定端口 60110，链接插件
flexcli --port 60110 plugin link --path /path/to/plugin --uuid 12345

# 默认端口，重启插件
flexcli plugin restart --uuid 12345

# 调试插件
flexcli plugin debug --uuid 12345
```
