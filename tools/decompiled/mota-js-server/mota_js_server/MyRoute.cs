using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using SimpleHttpServer.Models;
using SimpleHttpServer.RouteHandlers;

namespace mota_js_server;

internal class MyRoute
{
	private FileSystemRouteHandler handler = new FileSystemRouteHandler
	{
		BasePath = ".",
		ShowDirectories = true
	};

	public HttpResponse getHandler(HttpRequest request)
	{
		if (request.Path.StartsWith("__all_floors__.js"))
		{
			int num = request.Path.IndexOf("&id=");
			if (num >= 0)
			{
				string[] array = request.Path.Substring(num + 4).Split(',');
				string text = "";
				string[] array2 = array;
				foreach (string text2 in array2)
				{
					string path = "project/floors/" + text2 + ".js";
					if (!File.Exists(path))
					{
						return new HttpResponse
						{
							ContentAsUTF8 = "Request Not found.",
							ReasonPhrase = "Not Found",
							StatusCode = "404"
						};
					}
					text = text + File.ReadAllText(path, Encoding.UTF8) + "\n";
				}
				return new HttpResponse
				{
					ContentAsUTF8 = text,
					StatusCode = "200",
					ReasonPhrase = "OK"
				};
			}
		}
		if (request.Path.StartsWith("__all_animates__"))
		{
			int num2 = request.Path.IndexOf("&id=");
			if (num2 >= 0)
			{
				string[] array3 = request.Path.Substring(num2 + 4).Split(',');
				List<string> list = new List<string>();
				string[] array4 = array3;
				foreach (string text3 in array4)
				{
					string path2 = "project/animates/" + text3 + ".animate";
					list.Add(File.Exists(path2) ? File.ReadAllText(path2, Encoding.UTF8) : "");
				}
				return new HttpResponse
				{
					ContentAsUTF8 = string.Join("@@@~~~###~~~@@@", list),
					StatusCode = "200",
					ReasonPhrase = "OK"
				};
			}
		}
		if (request.Path.StartsWith("favicon.ico"))
		{
			return new HttpResponse
			{
				ContentAsUTF8 = "",
				StatusCode = "200",
				ReasonPhrase = "OK"
			};
		}
		return handler.Handle(request);
	}

	public HttpResponse postHandler(HttpRequest request)
	{
		if (request.Path.StartsWith("games/upload.php"))
		{
			return new HttpResponse
			{
				ContentAsUTF8 = "",
				StatusCode = "200",
				ReasonPhrase = "OK"
			};
		}
		string[] array = request.Content.Split('&');
		Dictionary<string, string> dictionary = new Dictionary<string, string>();
		string[] array2 = array;
		foreach (string text in array2)
		{
			int num = text.IndexOf("=");
			if (num > 0)
			{
				dictionary.Add(text.Substring(0, num), text.Substring(num + 1));
			}
		}
		if (request.Path.StartsWith("readFile"))
		{
			return readFileHandler(dictionary);
		}
		if (request.Path.StartsWith("writeFile"))
		{
			return writeFileHandler(dictionary);
		}
		if (request.Path.StartsWith("writeMultiFiles"))
		{
			return writeMultiFilesHandler(dictionary);
		}
		if (request.Path.StartsWith("listFile"))
		{
			return listFileHandler(dictionary);
		}
		if (request.Path.StartsWith("makeDir"))
		{
			return makeDirHandler(dictionary);
		}
		if (request.Path.StartsWith("moveFile"))
		{
			return moveFileHandler(dictionary);
		}
		if (request.Path.StartsWith("deleteFile"))
		{
			return deleteFileHandler(dictionary);
		}
		return new HttpResponse
		{
			ContentAsUTF8 = "Request Not found.",
			ReasonPhrase = "Not Found",
			StatusCode = "404"
		};
	}

	private static HttpResponse readFileHandler(Dictionary<string, string> dictionary)
	{
		string text = dictionary["type"];
		if (text == null || !text.Equals("base64"))
		{
			text = "utf8";
		}
		string text2 = dictionary["name"];
		if (text2 == null || !File.Exists(text2))
		{
			if (text2.StartsWith("_saves/"))
			{
				return new HttpResponse
				{
					ContentAsUTF8 = "",
					StatusCode = "200",
					ReasonPhrase = "OK"
				};
			}
			return new HttpResponse
			{
				ContentAsUTF8 = "File Not Exists!",
				StatusCode = "404",
				ReasonPhrase = "Not found"
			};
		}
		byte[] array = File.ReadAllBytes(text2);
		return new HttpResponse
		{
			ContentAsUTF8 = ((text == "base64") ? Convert.ToBase64String(array) : Encoding.UTF8.GetString(array)),
			StatusCode = "200",
			ReasonPhrase = "OK"
		};
	}

	private static HttpResponse writeFileHandler(Dictionary<string, string> dictionary)
	{
		string text = dictionary["type"];
		if (text == null || !text.Equals("base64"))
		{
			text = "utf8";
		}
		string path = dictionary["name"];
		string s = dictionary["value"];
		byte[] array = ((!(text == "base64")) ? Encoding.UTF8.GetBytes(s) : Convert.FromBase64String(s));
		File.WriteAllBytes(path, array);
		return new HttpResponse
		{
			ContentAsUTF8 = Convert.ToString(array.Length),
			StatusCode = "200",
			ReasonPhrase = "OK"
		};
	}

	private static HttpResponse writeMultiFilesHandler(Dictionary<string, string> dictionary)
	{
		string text = dictionary["name"];
		string text2 = dictionary["value"];
		string[] array = text.Split(';');
		string[] array2 = text2.Split(';');
		long num = 0L;
		for (int i = 0; i < array.Length; i++)
		{
			if (i < array2.Length)
			{
				byte[] array3 = Convert.FromBase64String(array2[i]);
				num += array3.LongLength;
				File.WriteAllBytes(array[i], array3);
			}
		}
		return new HttpResponse
		{
			ContentAsUTF8 = Convert.ToString(num),
			StatusCode = "200",
			ReasonPhrase = "OK"
		};
	}

	private static HttpResponse listFileHandler(Dictionary<string, string> dictionary)
	{
		string text = dictionary["name"];
		if (text == null || !Directory.Exists(text))
		{
			return new HttpResponse
			{
				ContentAsUTF8 = "Directory Not Exists!",
				StatusCode = "404",
				ReasonPhrase = "Not found"
			};
		}
		string[] files = Directory.GetFiles(text);
		for (int i = 0; i < files.Length; i++)
		{
			files[i] = "\"" + Path.GetFileName(files[i]) + "\"";
		}
		string contentAsUTF = "[" + string.Join(", ", files) + "]";
		return new HttpResponse
		{
			ContentAsUTF8 = contentAsUTF,
			StatusCode = "200",
			ReasonPhrase = "OK"
		};
	}

	private static HttpResponse makeDirHandler(Dictionary<string, string> dictionary)
	{
		string path = dictionary["name"];
		if (Directory.Exists(path))
		{
			return new HttpResponse
			{
				ContentAsUTF8 = "Directory Already Exists!",
				StatusCode = "200",
				ReasonPhrase = "OK"
			};
		}
		Directory.CreateDirectory(path);
		return new HttpResponse
		{
			ContentAsUTF8 = "Make Directory Success",
			StatusCode = "200",
			ReasonPhrase = "OK"
		};
	}

	private static HttpResponse moveFileHandler(Dictionary<string, string> dictionary)
	{
		string text = dictionary["src"];
		string text2 = dictionary["dest"];
		if (text == null || !File.Exists(text))
		{
			return new HttpResponse
			{
				ContentAsUTF8 = "File Not Exists!",
				StatusCode = "404",
				ReasonPhrase = "Not found"
			};
		}
		if (text2 == null)
		{
			return new HttpResponse
			{
				ContentAsUTF8 = "Must Provide Destination!",
				StatusCode = "404",
				ReasonPhrase = "Not found"
			};
		}
		if (!object.Equals(text, text2))
		{
			if (File.Exists(text2) && !object.Equals(text, text2))
			{
				File.Delete(text2);
			}
			File.Move(text, text2);
		}
		return new HttpResponse
		{
			ContentAsUTF8 = "Move Success",
			StatusCode = "200",
			ReasonPhrase = "OK"
		};
	}

	private static void deleteFile(string path)
	{
		if (File.Exists(path))
		{
			File.Delete(path);
		}
		else if (Directory.Exists(path))
		{
			string[] fileSystemEntries = Directory.GetFileSystemEntries(path);
			foreach (string path2 in fileSystemEntries)
			{
				deleteFile(path2);
			}
			Directory.Delete(path);
		}
	}

	private static HttpResponse deleteFileHandler(Dictionary<string, string> dictionary)
	{
		string text = dictionary["name"];
		if (text == null || (!File.Exists(text) && !Directory.Exists(text)))
		{
			return new HttpResponse
			{
				ContentAsUTF8 = "File Not Exists!",
				StatusCode = "404",
				ReasonPhrase = "Not found"
			};
		}
		deleteFile(text);
		return new HttpResponse
		{
			ContentAsUTF8 = "Delete Success",
			StatusCode = "200",
			ReasonPhrase = "OK"
		};
	}
}
