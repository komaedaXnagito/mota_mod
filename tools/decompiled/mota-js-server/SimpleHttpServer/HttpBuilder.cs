using SimpleHttpServer.Models;

namespace SimpleHttpServer;

internal class HttpBuilder
{
	public static HttpResponse InternalServerError()
	{
		return new HttpResponse
		{
			ReasonPhrase = "InternalServerError",
			StatusCode = "500",
			ContentAsUTF8 = "Internal Server Error"
		};
	}

	public static HttpResponse NotFound()
	{
		return new HttpResponse
		{
			ReasonPhrase = "NotFound",
			StatusCode = "404",
			ContentAsUTF8 = "Not Found"
		};
	}
}
