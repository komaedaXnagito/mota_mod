using System.Collections.Generic;
using System.Text;

namespace SimpleHttpServer.Models;

public class HttpResponse
{
	public string StatusCode { get; set; }

	public string ReasonPhrase { get; set; }

	public byte[] Content { get; set; }

	public Dictionary<string, string> Headers { get; set; }

	public string ContentAsUTF8
	{
		set
		{
			setContent(value, Encoding.UTF8);
		}
	}

	public void setContent(string content, Encoding encoding = null)
	{
		if (encoding == null)
		{
			encoding = Encoding.UTF8;
		}
		Content = encoding.GetBytes(content);
	}

	public HttpResponse()
	{
		Headers = new Dictionary<string, string>();
	}

	public override string ToString()
	{
		return $"HTTP status {StatusCode} {ReasonPhrase}";
	}
}
