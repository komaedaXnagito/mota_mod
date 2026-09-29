using System.Collections.Generic;
using System.Linq;

namespace SimpleHttpServer.Models;

public class HttpRequest
{
	public string Method { get; set; }

	public string Url { get; set; }

	public string Path { get; set; }

	public string Content { get; set; }

	public Route Route { get; set; }

	public Dictionary<string, string> Headers { get; set; }

	public HttpRequest()
	{
		Headers = new Dictionary<string, string>();
	}

	public override string ToString()
	{
		if (!string.IsNullOrWhiteSpace(Content) && !Headers.ContainsKey("Content-Length"))
		{
			Headers.Add("Content-Length", Content.Length.ToString());
		}
		return string.Format("{0} {1} HTTP/1.0\r\n{2}\r\n\r\n{3}", Method, Url, string.Join("\r\n", Headers.Select((KeyValuePair<string, string> x) => $"{x.Key}: {x.Value}")), Content);
	}
}
