using System;
using System.IO;
using System.Linq;
using System.Text;
using SimpleHttpServer.Models;

namespace SimpleHttpServer.RouteHandlers;

public class FileSystemRouteHandler
{
	public string BasePath { get; set; }

	public bool ShowDirectories { get; set; }

	public static bool FileExistsCaseSensitive(string filename)
	{
		string directoryName = Path.GetDirectoryName(filename);
		if (directoryName == null)
		{
			return false;
		}
		string real_filename = Path.GetFileName(filename);
		if (!real_filename.All((char c) => char.IsLetterOrDigit(c) || "`~!@#$%^&*()-_=+;,.".Contains(c)))
		{
			return false;
		}
		string[] files = Directory.GetFiles(directoryName);
		return Array.Exists(files, (string s) => Path.GetFileName(s) == real_filename);
	}

	public HttpResponse Handle(HttpRequest request)
	{
		string path = request.Path;
		path = path.Replace("\\..\\", "\\");
		path = path.Replace("/../", "/");
		path = path.Replace("//", "/");
		path = path.Replace("\\\\", "\\");
		path = path.Replace(":", "");
		int num = path.IndexOf('?');
		if (num > 0)
		{
			path = path.Substring(0, num);
		}
		path = path.Replace("/", Path.DirectorySeparatorChar.ToString());
		if (path.Length > 0)
		{
			char c = path.ElementAt(0);
			if (c == '/' || c == '\\')
			{
				path = "." + path;
			}
		}
		string text = Path.Combine(BasePath, path);
		if (ShowDirectories && Directory.Exists(text))
		{
			if (!text.EndsWith("/"))
			{
				text += "/";
			}
			text += "index.html";
			return Handle_LocalFile(request, text);
		}
		if (FileExistsCaseSensitive(text))
		{
			return Handle_LocalFile(request, text);
		}
		return new HttpResponse
		{
			StatusCode = "404",
			ReasonPhrase = $"Not Found ({text}) handler({request.Route.Name})"
		};
	}

	private HttpResponse Handle_LocalFile(HttpRequest request, string local_path)
	{
		string extension = Path.GetExtension(local_path);
		HttpResponse httpResponse = new HttpResponse();
		httpResponse.StatusCode = "200";
		httpResponse.ReasonPhrase = "Ok";
		string mimeType = QuickMimeTypeMapper.GetMimeType(extension);
		if (mimeType.StartsWith("audio/"))
		{
			httpResponse.Headers["Accept-Ranges"] = "bytes";
		}
		httpResponse.Headers["Content-Type"] = mimeType;
		httpResponse.Content = File.ReadAllBytes(local_path);
		return httpResponse;
	}

	private HttpResponse Handle_LocalDir(HttpRequest request, string local_path)
	{
		StringBuilder stringBuilder = new StringBuilder();
		stringBuilder.Append($"<h1> Directory: {request.Url} </h1>");
		string[] files = Directory.GetFiles(local_path);
		foreach (string fileName in files)
		{
			FileInfo fileInfo = new FileInfo(fileName);
			string name = fileInfo.Name;
			stringBuilder.Append(string.Format("<a href=\"{1}\">{1}</a> <br>", name, name));
		}
		return new HttpResponse
		{
			StatusCode = "200",
			ReasonPhrase = "Ok",
			ContentAsUTF8 = stringBuilder.ToString()
		};
	}
}
