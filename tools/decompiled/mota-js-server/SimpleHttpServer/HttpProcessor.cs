using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using SimpleHttpServer.Models;

namespace SimpleHttpServer;

public class HttpProcessor
{
	private List<Route> Routes = new List<Route>();

	public void HandleClient(TcpClient tcpClient)
	{
		Stream inputStream = GetInputStream(tcpClient);
		Stream outputStream = GetOutputStream(tcpClient);
		HttpRequest request = GetRequest(inputStream, outputStream);
		HttpResponse httpResponse = RouteRequest(inputStream, outputStream, request);
		if (httpResponse.Content == null && httpResponse.StatusCode != "200")
		{
			httpResponse.ContentAsUTF8 = $"{httpResponse.StatusCode} {request.Url} <p> {httpResponse.ReasonPhrase}";
		}
		WriteResponse(outputStream, httpResponse);
		outputStream.Flush();
		outputStream.Close();
		outputStream = null;
		inputStream.Close();
		inputStream = null;
	}

	private static void WriteResponse(Stream stream, HttpResponse response)
	{
		if (response.Content == null)
		{
			response.Content = new byte[0];
		}
		if (!response.Headers.ContainsKey("Content-Type"))
		{
			response.Headers["Content-Type"] = "text/html";
		}
		response.Headers["Content-Length"] = response.Content.Length.ToString();
		Write(stream, $"HTTP/1.0 {response.StatusCode} {response.ReasonPhrase}\r\n");
		Write(stream, string.Join("\r\n", response.Headers.Select((KeyValuePair<string, string> x) => $"{x.Key}: {x.Value}")));
		Write(stream, "\r\n\r\n");
		stream.Write(response.Content, 0, response.Content.Length);
	}

	public void AddRoute(Route route)
	{
		Routes.Add(route);
	}

	private static string Readline(Stream stream)
	{
		string text = "";
		while (true)
		{
			int num = stream.ReadByte();
			switch (num)
			{
			case -1:
				Thread.Sleep(1);
				break;
			default:
				text += Convert.ToChar(num);
				break;
			case 13:
				break;
			case 10:
				return text;
			}
		}
	}

	private static void Write(Stream stream, string text)
	{
		byte[] bytes = Encoding.UTF8.GetBytes(text);
		stream.Write(bytes, 0, bytes.Length);
	}

	protected virtual Stream GetOutputStream(TcpClient tcpClient)
	{
		return tcpClient.GetStream();
	}

	protected virtual Stream GetInputStream(TcpClient tcpClient)
	{
		return tcpClient.GetStream();
	}

	protected virtual HttpResponse RouteRequest(Stream inputStream, Stream outputStream, HttpRequest request)
	{
		List<Route> source = Routes.Where((Route x) => Regex.Match(request.Url, x.UrlRegex).Success).ToList();
		if (!source.Any())
		{
			return HttpBuilder.NotFound();
		}
		Route route = source.SingleOrDefault((Route x) => x.Method == request.Method);
		if (route == null)
		{
			return new HttpResponse
			{
				ReasonPhrase = "Method Not Allowed",
				StatusCode = "405"
			};
		}
		Match match = Regex.Match(request.Url, route.UrlRegex);
		if (match.Groups.Count > 1)
		{
			request.Path = match.Groups[1].Value;
		}
		else
		{
			request.Path = request.Url;
		}
		request.Route = route;
		try
		{
			return route.Callable(request);
		}
		catch (Exception)
		{
			return HttpBuilder.InternalServerError();
		}
	}

	private HttpRequest GetRequest(Stream inputStream, Stream outputStream)
	{
		string text = Readline(inputStream);
		string[] array = text.Split(' ');
		if (array.Length != 3)
		{
			throw new Exception("invalid http request line");
		}
		string method = array[0].ToUpper();
		string url = array[1];
		string text2 = array[2];
		Dictionary<string, string> dictionary = new Dictionary<string, string>();
		string text3;
		while ((text3 = Readline(inputStream)) != null && !text3.Equals(""))
		{
			int num = text3.IndexOf(':');
			if (num == -1)
			{
				throw new Exception("invalid http header line: " + text3);
			}
			string key = text3.Substring(0, num);
			int i;
			for (i = num + 1; i < text3.Length && text3[i] == ' '; i++)
			{
			}
			string value = text3.Substring(i, text3.Length - i);
			dictionary.Add(key, value);
		}
		string content = null;
		if (dictionary.ContainsKey("Content-Length"))
		{
			int num2 = Convert.ToInt32(dictionary["Content-Length"]);
			int num3 = num2;
			byte[] array2 = new byte[num2];
			while (num3 > 0)
			{
				byte[] array3 = new byte[(num3 > 1024) ? 1024 : num3];
				int num4 = inputStream.Read(array3, 0, array3.Length);
				array3.CopyTo(array2, num2 - num3);
				num3 -= num4;
			}
			content = Encoding.UTF8.GetString(array2);
		}
		return new HttpRequest
		{
			Method = method,
			Url = url,
			Headers = dictionary,
			Content = content
		};
	}
}
