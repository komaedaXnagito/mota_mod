# 启动服务.exe 反编译结果

本目录由 ILSpy CLI 8.2.0.7535 从当前项目根目录的 `启动服务.exe` 静态反编译生成。C# 文件为反编译结果，不是原作者原始源码；原始注释和部分局部变量名无法恢复。未重新编译或替换原 EXE。

- 原文件长度：59,392 字节
- SHA-256：`c08a45c39db05c609c145c135f71a3e6824721a077df86c41c44c173b9de772a`
- 程序集名称：`mota-js-server`
- 目标框架：.NET Framework 4.0，Windows Forms
- 工具来源：[ILSpy](https://github.com/icsharpcode/ILSpy)、[官方 NuGet 包](https://www.nuget.org/packages/ilspycmd/8.2.0.7535)

## /listFile 的实际行为

见 `mota_js_server/MyRoute.cs` 的 `listFileHandler`：

1. 从请求参数 `name` 读取目录；可指定已知子目录，例如 `./project/images/characters/`。
2. 使用 `Directory.GetFiles(text)`，只枚举当前目录中的文件，不包含子目录，不递归。
3. 使用 `Path.GetFileName` 去掉目录部分，再组成 JSON 数组返回。
4. 没有文件扩展名过滤，WebP 文件也会被枚举。

程序中的 `Directory.GetFileSystemEntries` 出现在删除目录的辅助函数中，与 `/listFile` 无关。

## 路由兼容性

同一文件的路由分发使用 `request.Path.StartsWith("listFile")`，所以 `/listFileRecursive` 也会进入普通列文件处理函数，返回 HTTP 200 和非递归列表，而非 404。项目新增递归接口已改名为 `/listDirectoryRecursive`，避免把旧服务误判为支持递归扫描。

## 重现反编译

在项目根目录运行（工具临时下载在 `tmp/ilspy-8.2/`）：

```powershell
dotnet tmp/ilspy-8.2/package/tools/net6.0/any/ilspycmd.dll --project --outputdir tools/decompiled/mota-js-server --referencepath C:/Windows/Microsoft.NET/Framework64/v4.0.30319 '启动服务.exe'
```

生成的工程文件是反编译器输出，尚未验证重新编译；本机仅安装 .NET 运行时，没有 .NET SDK。
