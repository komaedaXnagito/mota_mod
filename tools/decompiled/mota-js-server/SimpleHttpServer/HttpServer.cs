using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using SimpleHttpServer.Models;

namespace SimpleHttpServer;

public class HttpServer
{
	private int Port;

	private TcpListener Listener;

	private HttpProcessor Processor;

	private bool IsActive = true;

	public HttpServer(int port, List<Route> routes)
	{
		Port = port;
		Processor = new HttpProcessor();
		foreach (Route route in routes)
		{
			Processor.AddRoute(route);
		}
	}

	public void Listen()
	{
		Listener = new TcpListener(IPAddress.Loopback, Port);
		Listener.Start();
		while (IsActive)
		{
			TcpClient state = Listener.AcceptTcpClient();
			ThreadPool.QueueUserWorkItem(Process, state);
		}
	}

	private void Process(object s)
	{
		Processor.HandleClient((TcpClient)s);
	}
}
