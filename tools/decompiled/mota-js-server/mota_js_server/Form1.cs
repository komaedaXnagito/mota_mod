using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.NetworkInformation;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;
using SimpleHttpServer;
using SimpleHttpServer.Models;

namespace mota_js_server;

public class Form1 : Form
{
	private Thread thread;

	private int port;

	private string url;

	private bool showError = true;

	private IContainer components = null;

	private Label label1;

	private Button button1;

	private Button button2;

	private Panel panel1;

	private Button button3;

	private Label label2;

	private Button button6;

	private Button button5;

	private Button button4;

	private Button button7;

	private Label label3;

	private Button button8;

	private Button button11;

	private Button button10;

	public Form1()
	{
		InitializeComponent();
		port = 1055;
		while (portInUse(port))
		{
			port++;
		}
		if (port > 1055)
		{
			MessageBox.Show("默认的1055端口已被占用，自动选择" + port + "端口。\n请注意，不同端口下的存档等信息都是不共用的。", "警告", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
		}
		url = "http://127.0.0.1:" + port + "/";
		MyRoute @object = new MyRoute();
		HttpServer object2 = new HttpServer(port, new List<Route>
		{
			new Route
			{
				Callable = @object.getHandler,
				UrlRegex = "^/(.*)$",
				Method = "GET"
			},
			new Route
			{
				Callable = @object.postHandler,
				UrlRegex = "^/(.*)$",
				Method = "POST"
			}
		});
		thread = new Thread(object2.Listen);
		thread.Start();
		label1.Text = "已启动服务：" + url;
		label3.Text = "当前目录：" + Path.GetFileName(Directory.GetCurrentDirectory());
	}

	private bool portInUse(int port)
	{
		IPGlobalProperties iPGlobalProperties = IPGlobalProperties.GetIPGlobalProperties();
		IPEndPoint[] activeTcpListeners = iPGlobalProperties.GetActiveTcpListeners();
		IPEndPoint[] array = activeTcpListeners;
		foreach (IPEndPoint iPEndPoint in array)
		{
			if (iPEndPoint.Port == port)
			{
				return true;
			}
		}
		return false;
	}

	private bool checkChrome()
	{
		RegistryKey registryKey = Registry.LocalMachine.OpenSubKey("SOFTWARE\\WOW6432Node\\Clients\\StartMenuInternet");
		if (registryKey == null)
		{
			registryKey = Registry.LocalMachine.OpenSubKey("SOFTWARE\\Clients\\StartMenuInternet");
		}
		string[] subKeyNames = registryKey.GetSubKeyNames();
		string[] array = subKeyNames;
		foreach (string text in array)
		{
			if (text.ToLower().Contains("chrome"))
			{
				return true;
			}
		}
		return false;
	}

	private void openUrl(string url)
	{
		Process.Start(url);
	}

	private void button1_Click(object sender, EventArgs e)
	{
		openUrl(url + "index.html");
	}

	private void button2_Click(object sender, EventArgs e)
	{
		openUrl(url + "editor.html");
	}

	private void button3_Click(object sender, EventArgs e)
	{
		if (!File.Exists("常用工具\\便捷PS工具.exe"))
		{
			MessageBox.Show("找不到常用工具目录下的便捷PS工具！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		else
		{
			Process.Start("常用工具\\便捷PS工具.exe");
		}
	}

	private void button4_Click(object sender, EventArgs e)
	{
		if (!File.Exists("常用工具\\截图识别器.exe"))
		{
			MessageBox.Show("找不到常用工具目录下的截图识别器！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		else
		{
			Process.Start("常用工具\\截图识别器.exe");
		}
	}

	private void button5_Click(object sender, EventArgs e)
	{
		if (!File.Exists("常用工具\\JS代码压缩工具.exe"))
		{
			MessageBox.Show("找不到常用工具目录下的JS代码压缩工具！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		else
		{
			Process.Start("常用工具\\JS代码压缩工具.exe");
		}
	}

	private void button6_Click(object sender, EventArgs e)
	{
		if (!File.Exists("常用工具\\伤害和临界值计算器.exe"))
		{
			MessageBox.Show("找不到常用工具目录下的伤害和临界值计算器！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		else
		{
			Process.Start("常用工具\\伤害和临界值计算器.exe");
		}
	}

	private void button7_Click(object sender, EventArgs e)
	{
		if (!File.Exists("常用工具\\怪物数据导出器.exe"))
		{
			MessageBox.Show("找不到常用工具目录下的怪物数据导出器！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		else
		{
			Process.Start("常用工具\\怪物数据导出器.exe");
		}
	}

	private void Form1_FormClosed(object sender, FormClosedEventArgs e)
	{
		try
		{
			Environment.Exit(Environment.ExitCode);
		}
		catch (Exception)
		{
		}
	}

	private void button8_Click(object sender, EventArgs e)
	{
		if (!File.Exists("常用工具\\RM动画导出器.exe"))
		{
			MessageBox.Show("找不到常用工具目录下的RM动画导出器！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		else
		{
			Process.Start("常用工具\\RM动画导出器.exe");
		}
	}

	private void button10_Click(object sender, EventArgs e)
	{
		if (!File.Exists("常用工具\\动画编辑器.exe"))
		{
			MessageBox.Show("找不到常用工具目录下的动画编辑器！", "错误", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		else
		{
			Process.Start("常用工具\\动画编辑器.exe");
		}
	}

	private void button11_Click(object sender, EventArgs e)
	{
		openUrl(url + "_docs/");
	}

	protected override void Dispose(bool disposing)
	{
		if (disposing && components != null)
		{
			components.Dispose();
		}
		base.Dispose(disposing);
	}

	private void InitializeComponent()
	{
		this.label1 = new System.Windows.Forms.Label();
		this.button1 = new System.Windows.Forms.Button();
		this.button2 = new System.Windows.Forms.Button();
		this.panel1 = new System.Windows.Forms.Panel();
		this.button11 = new System.Windows.Forms.Button();
		this.button10 = new System.Windows.Forms.Button();
		this.button8 = new System.Windows.Forms.Button();
		this.button7 = new System.Windows.Forms.Button();
		this.button6 = new System.Windows.Forms.Button();
		this.button5 = new System.Windows.Forms.Button();
		this.button4 = new System.Windows.Forms.Button();
		this.button3 = new System.Windows.Forms.Button();
		this.label2 = new System.Windows.Forms.Label();
		this.label3 = new System.Windows.Forms.Label();
		this.panel1.SuspendLayout();
		base.SuspendLayout();
		this.label1.AutoSize = true;
		this.label1.Location = new System.Drawing.Point(30, 23);
		this.label1.Name = "label1";
		this.label1.Size = new System.Drawing.Size(95, 12);
		this.label1.TabIndex = 0;
		this.label1.Text = "正在启动服务...";
		this.button1.Location = new System.Drawing.Point(32, 76);
		this.button1.Name = "button1";
		this.button1.Size = new System.Drawing.Size(75, 23);
		this.button1.TabIndex = 1;
		this.button1.Text = "启动游戏";
		this.button1.UseVisualStyleBackColor = true;
		this.button1.Click += new System.EventHandler(button1_Click);
		this.button2.Location = new System.Drawing.Point(157, 76);
		this.button2.Name = "button2";
		this.button2.Size = new System.Drawing.Size(75, 23);
		this.button2.TabIndex = 2;
		this.button2.Text = "启动编辑器";
		this.button2.UseVisualStyleBackColor = true;
		this.button2.Click += new System.EventHandler(button2_Click);
		this.panel1.BackColor = System.Drawing.SystemColors.Control;
		this.panel1.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
		this.panel1.Controls.Add(this.button10);
		this.panel1.Controls.Add(this.button8);
		this.panel1.Controls.Add(this.button7);
		this.panel1.Controls.Add(this.button6);
		this.panel1.Controls.Add(this.button5);
		this.panel1.Controls.Add(this.button4);
		this.panel1.Controls.Add(this.button3);
		this.panel1.Location = new System.Drawing.Point(32, 152);
		this.panel1.Name = "panel1";
		this.panel1.Size = new System.Drawing.Size(200, 151);
		this.panel1.TabIndex = 3;
		this.button11.Location = new System.Drawing.Point(89, 115);
		this.button11.Name = "button11";
		this.button11.Size = new System.Drawing.Size(143, 23);
		this.button11.TabIndex = 9;
		this.button11.Text = ">>点此查看帮助文档<<";
		this.button11.UseVisualStyleBackColor = true;
		this.button11.Click += new System.EventHandler(button11_Click);
		this.button10.Location = new System.Drawing.Point(107, 77);
		this.button10.Name = "button10";
		this.button10.Size = new System.Drawing.Size(75, 23);
		this.button10.TabIndex = 8;
		this.button10.Text = "动画编辑器";
		this.button10.UseVisualStyleBackColor = true;
		this.button10.Click += new System.EventHandler(button10_Click);
		this.button8.Location = new System.Drawing.Point(107, 44);
		this.button8.Name = "button8";
		this.button8.Size = new System.Drawing.Size(75, 23);
		this.button8.TabIndex = 6;
		this.button8.Text = "RM动画导出";
		this.button8.UseVisualStyleBackColor = true;
		this.button8.Click += new System.EventHandler(button8_Click);
		this.button7.Location = new System.Drawing.Point(13, 44);
		this.button7.Name = "button7";
		this.button7.Size = new System.Drawing.Size(88, 23);
		this.button7.TabIndex = 5;
		this.button7.Text = "怪物数据导出";
		this.button7.UseVisualStyleBackColor = true;
		this.button7.Click += new System.EventHandler(button7_Click);
		this.button6.Location = new System.Drawing.Point(13, 112);
		this.button6.Name = "button6";
		this.button6.Size = new System.Drawing.Size(152, 23);
		this.button6.TabIndex = 4;
		this.button6.Text = "伤害和临界值计算器";
		this.button6.UseVisualStyleBackColor = true;
		this.button6.Click += new System.EventHandler(button6_Click);
		this.button5.Location = new System.Drawing.Point(13, 77);
		this.button5.Name = "button5";
		this.button5.Size = new System.Drawing.Size(88, 23);
		this.button5.TabIndex = 3;
		this.button5.Text = "JS代码压缩";
		this.button5.UseVisualStyleBackColor = true;
		this.button5.Click += new System.EventHandler(button5_Click);
		this.button4.Location = new System.Drawing.Point(107, 11);
		this.button4.Name = "button4";
		this.button4.Size = new System.Drawing.Size(75, 23);
		this.button4.TabIndex = 2;
		this.button4.Text = "截图识别器";
		this.button4.UseVisualStyleBackColor = true;
		this.button4.Click += new System.EventHandler(button4_Click);
		this.button3.Location = new System.Drawing.Point(13, 11);
		this.button3.Name = "button3";
		this.button3.Size = new System.Drawing.Size(88, 23);
		this.button3.TabIndex = 1;
		this.button3.Text = "便捷PS工具";
		this.button3.UseVisualStyleBackColor = true;
		this.button3.Click += new System.EventHandler(button3_Click);
		this.label2.AutoSize = true;
		this.label2.Location = new System.Drawing.Point(30, 120);
		this.label2.Name = "label2";
		this.label2.Size = new System.Drawing.Size(53, 12);
		this.label2.TabIndex = 0;
		this.label2.Text = "常用工具";
		this.label3.AutoSize = true;
		this.label3.Location = new System.Drawing.Point(30, 49);
		this.label3.Name = "label3";
		this.label3.Size = new System.Drawing.Size(0, 12);
		this.label3.TabIndex = 4;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 12f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(266, 329);
		base.Controls.Add(this.button11);
		base.Controls.Add(this.label3);
		base.Controls.Add(this.panel1);
		base.Controls.Add(this.label2);
		base.Controls.Add(this.button2);
		base.Controls.Add(this.button1);
		base.Controls.Add(this.label1);
		base.MaximizeBox = false;
		base.Name = "Form1";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "本地服务器";
		base.FormClosed += new System.Windows.Forms.FormClosedEventHandler(Form1_FormClosed);
		this.panel1.ResumeLayout(false);
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
