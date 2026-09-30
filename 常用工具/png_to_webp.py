"""PNG 批量转 WebP：无参数打开窗口，也可通过命令行转换文件夹。"""
import argparse
import os
from pathlib import Path
import queue
import tempfile
import threading


def convert_one(source, target, lossless=True, quality=85, overwrite=False):
    from PIL import Image

    if not overwrite and target.exists():
        return None
    temporary = None
    try:
        with Image.open(source) as image:
            if image.format != "PNG":
                raise ValueError("文件内容不是 PNG")
            if getattr(image, "n_frames", 1) > 1:
                raise ValueError("暂不支持动画 PNG，避免丢失动画帧")
            image.load()
            options = dict(lossless=lossless, quality=quality, method=6, exact=True)
            for key in ("icc_profile", "exif"):
                if image.info.get(key):
                    options[key] = image.info[key]
            target.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(dir=target.parent, suffix=".tmp", delete=False) as handle:
                temporary = Path(handle.name)
            with image.convert("RGBA") as rgba:
                rgba.save(temporary, format="WEBP", **options)
        size = temporary.stat().st_size
        if overwrite:
            os.replace(temporary, target)
        else:
            # Windows 的 rename 不覆盖目标，也适用于不支持硬链接的磁盘。
            try:
                if os.name == "nt":
                    os.rename(temporary, target)
                else:
                    os.link(temporary, target)
            except FileExistsError:
                return None
        return source.stat().st_size, size
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def convert_batch(source, output, recursive=True, lossless=True, quality=85,
                  overwrite=False, report=None, cancel=None):
    source, output = Path(source).resolve(), Path(output).resolve()
    if not source.is_dir():
        raise ValueError("请选择有效的 PNG 输入文件夹")
    if not 0 <= quality <= 100:
        raise ValueError("质量必须在 0 到 100 之间")
    report = report or (lambda *args: None)
    stats = dict(success=0, skipped=0, failed=0, before=0, after=0, cancelled=False)
    report("status", "正在扫描 PNG 文件…")
    files = sorted(path for path in (source.rglob("*") if recursive else source.iterdir())
                   if path.is_file() and path.suffix.lower() == ".png")
    report("total", len(files))
    for index, path in enumerate(files, 1):
        if cancel is not None and cancel.is_set():
            stats["cancelled"] = True
            break
        relative = path.relative_to(source)
        try:
            sizes = convert_one(path, output / relative.with_suffix(".webp"),
                                lossless, quality, overwrite)
            if sizes is None:
                stats["skipped"] += 1
                report("log", f"跳过（已存在）：{relative}")
            else:
                stats["success"] += 1
                stats["before"] += sizes[0]
                stats["after"] += sizes[1]
                report("log", f"完成：{relative}  ·  {sizes[0]:,} → {sizes[1]:,} 字节")
        except Exception as exc:
            stats["failed"] += 1
            report("log", f"失败：{relative}  ·  {exc}")
        report("progress", index)
    return stats


def summary(stats):
    text = (f"{'已停止' if stats['cancelled'] else '转换结束'}：成功 {stats['success']}，"
            f"跳过 {stats['skipped']}，失败 {stats['failed']}")
    if stats["before"]:
        percent = (1 - stats["after"] / stats["before"]) * 100
        text += f"；成功文件体积{'减少' if percent >= 0 else '增加'} {abs(percent):.1f}%"
    return text


class ConverterWindow:
    def __init__(self, root):
        import tkinter as tk
        from tkinter import ttk
        from tkinter.scrolledtext import ScrolledText

        self.root = root
        self.messages = queue.Queue()
        self.cancel = threading.Event()
        self.running = False
        self.source = tk.StringVar()
        self.output = tk.StringVar()
        self.recursive = tk.BooleanVar(value=True)
        self.lossless = tk.BooleanVar(value=True)
        self.overwrite = tk.BooleanVar(value=False)
        self.quality = tk.StringVar(value="85")
        self.status = tk.StringVar(value="选择文件夹即可开始，原 PNG 文件会保留。")
        root.title("PNG 批量转 WebP")
        root.geometry("800x540")
        root.minsize(640, 460)
        root.protocol("WM_DELETE_WINDOW", self.close)
        panel = ttk.Frame(root, padding=20)
        panel.pack(fill="both", expand=True)
        panel.columnconfigure(1, weight=1)
        panel.rowconfigure(8, weight=1)
        ttk.Label(panel, text="PNG → WebP", font=("Microsoft YaHei UI", 20, "bold")).grid(
            row=0, column=0, columnspan=3, sticky="w", pady=(0, 8))
        ttk.Label(panel, text="本地批量转换 · 保留透明背景 · 保留文件夹结构").grid(
            row=1, column=0, columnspan=3, sticky="w", pady=(0, 16))
        self.controls = []
        for row, label, variable, command in (
            (2, "输入文件夹", self.source, self.choose_source),
            (3, "输出文件夹", self.output, self.choose_output),
        ):
            ttk.Label(panel, text=label).grid(row=row, column=0, padx=(0, 12))
            entry = ttk.Entry(panel, textvariable=variable)
            entry.grid(row=row, column=1, sticky="ew", pady=6)
            button = ttk.Button(panel, text="选择…", command=command)
            button.grid(row=row, column=2, padx=(10, 0))
            self.controls.extend((entry, button))
        options = ttk.Frame(panel)
        options.grid(row=4, column=0, columnspan=3, sticky="w", pady=12)
        for label, variable in (("包含子文件夹", self.recursive),
                                ("无损模式（推荐像素素材）", self.lossless),
                                ("覆盖已有 WebP", self.overwrite)):
            button = ttk.Checkbutton(options, text=label, variable=variable,
                                     command=self.update_quality)
            button.pack(side="left", padx=(0, 14))
            self.controls.append(button)
        settings = ttk.Frame(panel)
        settings.grid(row=5, column=0, columnspan=3, sticky="w")
        ttk.Label(settings, text="有损质量（0–100）").pack(side="left")
        self.quality_input = ttk.Spinbox(settings, from_=0, to=100, width=6, textvariable=self.quality)
        self.quality_input.pack(side="left", padx=10)
        self.controls.append(self.quality_input)
        ttk.Label(settings, text="无损模式保持像素，图片尺寸不变。").pack(side="left")
        actions = ttk.Frame(panel)
        actions.grid(row=6, column=0, columnspan=3, sticky="ew", pady=14)
        self.start_button = ttk.Button(actions, text="开始转换", command=self.start)
        self.start_button.pack(side="left")
        self.stop_button = ttk.Button(actions, text="停止", command=self.stop, state="disabled")
        self.stop_button.pack(side="left", padx=10)
        ttk.Button(actions, text="打开输出文件夹", command=self.open_output).pack(side="right")
        self.progress = ttk.Progressbar(panel, mode="determinate")
        self.progress.grid(row=7, column=0, columnspan=3, sticky="ew", pady=(0, 10))
        self.log = ScrolledText(panel, height=10, font=("Microsoft YaHei UI", 10), state="disabled")
        self.log.grid(row=8, column=0, columnspan=3, sticky="nsew")
        ttk.Label(panel, textvariable=self.status, wraplength=730).grid(
            row=9, column=0, columnspan=3, sticky="w", pady=(10, 0))
        self.update_quality()
        root.after(100, self.poll)

    def update_quality(self):
        self.quality_input.configure(state="disabled" if self.running or self.lossless.get() else "normal")

    def choose_source(self):
        from tkinter import filedialog
        path = filedialog.askdirectory(title="选择 PNG 输入文件夹")
        if path:
            self.source.set(path)
            self.output.set(str(Path(path) / "webp_output"))

    def choose_output(self):
        from tkinter import filedialog
        path = filedialog.askdirectory(title="选择 WebP 输出文件夹", mustexist=False)
        if path:
            self.output.set(path)

    def start(self):
        from tkinter import messagebox
        try:
            if not self.source.get().strip() or not Path(self.source.get().strip()).is_dir():
                raise ValueError("请选择有效的输入文件夹")
            if not self.output.get().strip():
                raise ValueError("请选择输出文件夹")
            quality = 100 if self.lossless.get() else int(self.quality.get())
            if not 0 <= quality <= 100:
                raise ValueError("质量必须在 0 到 100 之间")
            options = dict(source=self.source.get().strip(), output=self.output.get().strip(),
                           recursive=self.recursive.get(), lossless=self.lossless.get(),
                           quality=quality, overwrite=self.overwrite.get())
        except ValueError as exc:
            messagebox.showerror("检查输入", str(exc))
            return
        self.running = True
        self.cancel.clear()
        self.progress.configure(value=0)
        self.log.configure(state="normal")
        self.log.delete("1.0", "end")
        self.log.configure(state="disabled")
        for widget in self.controls + [self.start_button]:
            widget.configure(state="disabled")
        self.stop_button.configure(state="normal")
        self.status.set("正在扫描 PNG 文件…")
        threading.Thread(target=self.worker, args=(options,), daemon=True).start()

    def worker(self, options):
        try:
            result = convert_batch(**options, cancel=self.cancel,
                                   report=lambda *args: self.messages.put(args))
            self.messages.put(("done", summary(result)))
        except Exception as exc:
            self.messages.put(("done", f"转换失败：{exc}"))

    def poll(self):
        # 每次有限量处理消息，让大量文件转换时窗口仍能响应。
        for _ in range(100):
            try:
                kind, value = self.messages.get_nowait()
            except queue.Empty:
                break
            if kind == "total":
                self.progress.configure(maximum=max(value, 1))
                self.status.set(f"共找到 {value} 张 PNG，正在转换…" if value else "未找到 PNG 文件。")
            elif kind == "progress":
                self.progress.configure(value=value)
            elif kind == "log":
                self.log.configure(state="normal")
                self.log.insert("end", value + "\n")
                self.log.see("end")
                self.log.configure(state="disabled")
            elif kind == "status":
                self.status.set(value)
            elif kind == "done":
                self.running = False
                for widget in self.controls + [self.start_button]:
                    widget.configure(state="normal")
                self.stop_button.configure(state="disabled")
                self.update_quality()
                self.status.set(value)
        self.root.after(100, self.poll)

    def stop(self):
        self.cancel.set()
        self.status.set("正在停止，当前图片转换完成后结束…")
        self.stop_button.configure(state="disabled")

    def open_output(self):
        from tkinter import messagebox
        path = Path(self.output.get().strip()) if self.output.get().strip() else None
        if path is None or not path.is_dir():
            messagebox.showinfo("输出文件夹", "输出文件夹尚未创建，请先完成转换。")
            return
        try:
            os.startfile(str(path.resolve()))
        except OSError as exc:
            messagebox.showerror("无法打开文件夹", str(exc))

    def close(self):
        if self.running:
            self.stop()
            self.root.after(100, self.close)
        else:
            self.root.destroy()


def main():
    parser = argparse.ArgumentParser(description="PNG 批量转 WebP（无参数打开中文窗口）")
    parser.add_argument("source", nargs="?", help="PNG 输入文件夹")
    parser.add_argument("-o", "--output", help="输出文件夹，默认：输入文件夹/webp_output")
    parser.add_argument("--lossy", action="store_true", help="使用有损压缩，默认无损")
    parser.add_argument("-q", "--quality", type=int, default=85, help="有损质量 0–100，默认 85")
    parser.add_argument("--no-recursive", action="store_true", help="不包含子文件夹")
    parser.add_argument("--overwrite", action="store_true", help="覆盖已有 WebP")
    args = parser.parse_args()
    try:
        from PIL import features
        if not features.check("webp"):
            raise RuntimeError("Pillow 未启用 WebP 支持，请更新 Pillow。")
    except (ImportError, RuntimeError) as exc:
        print(f"无法启动：{exc}\n请运行：python -m pip install --upgrade Pillow")
        return 1
    if args.source:
        try:
            result = convert_batch(args.source, args.output or Path(args.source) / "webp_output",
                                   recursive=not args.no_recursive, lossless=not args.lossy,
                                   quality=args.quality if args.lossy else 100, overwrite=args.overwrite,
                                   report=lambda kind, value: print(value) if kind == "log" else None)
        except Exception as exc:
            print(f"转换失败：{exc}")
            return 1
        print(summary(result))
        return 1 if result["failed"] else 0
    import tkinter as tk
    root = tk.Tk()
    ConverterWindow(root)
    root.mainloop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
