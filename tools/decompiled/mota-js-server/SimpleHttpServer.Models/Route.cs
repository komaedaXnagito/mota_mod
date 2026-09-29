using System;

namespace SimpleHttpServer.Models;

public class Route
{
	public string Name { get; set; }

	public string UrlRegex { get; set; }

	public string Method { get; set; }

	public Func<HttpRequest, HttpResponse> Callable { get; set; }
}
