
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.nio.ByteBuffer;
import java.util.concurrent.atomic.AtomicBoolean;

import exceptions.ConnectionClosedException;
import exceptions.TimeoutException;

public class TFTPServer 
{
	public static final int TFTPPORT = 4970;
	public static final int BUFSIZE = 516;
	public static final long TIMEOUTDURATION = 3000;	//timeout duration for sending/receiving packets from client in milliseconds
	public static final String READDIR = "C:\\Users\\xabba\\Desktop\\READDIR\\"; //custom address at your PC
	public static final String WRITEDIR = "C:\\Users\\xabba\\Desktop\\WRITEDIR\\"; //custom address at your PC
	// OP codes
	public static final int OP_RRQ = 1;
	public static final int OP_WRQ = 2;
	public static final int OP_DAT = 3;
	public static final int OP_ACK = 4;
	public static final int OP_ERR = 5;

	public static void main(String[] args) {
		if (args.length > 0) 
		{
			System.err.printf("usage: java %s\n", TFTPServer.class.getCanonicalName());
			System.exit(1);
		}
		//Starting the server
		try 
		{
			TFTPServer server= new TFTPServer();
			server.start();
		}
		catch (SocketException e) 
		{e.printStackTrace();}
	}

	private void start() throws SocketException 
	{
		byte[] buf= new byte[BUFSIZE];

		// Create socket
		DatagramSocket socket= new DatagramSocket(null);

		// Create local bind point 
		SocketAddress localBindPoint= new InetSocketAddress(TFTPPORT);
		socket.bind(localBindPoint);

		System.out.printf("john.doe@email.com", TFTPPORT);

		// Loop to handle client requests 
		while (true) 
		{        

			InetSocketAddress clientAddress = receiveFrom(socket, buf);

			// If clientAddress is null, an error occurred in receiveFrom()
			if (clientAddress == null) 
				continue;

			final StringBuffer requestedFile= new StringBuffer();
			final int reqtype = ParseRQ(buf, requestedFile);

			new Thread() 
			{
				public void run() 
				{
					try 
					{
						DatagramSocket sendSocket= new DatagramSocket(0);

						// Connect to client
						sendSocket.connect(clientAddress);
						//sendSocket.setSoTimeout(TIMEOUTDURATION);

						System.out.printf("%s request from %s for %s using port %d\n",
								(reqtype == OP_RRQ)?"Read":"Write",
										clientAddress.getHostName(), requestedFile.toString(), clientAddress.getPort());  

						// Read request
						if (reqtype == OP_RRQ) 
						{      
							requestedFile.insert(0, READDIR);
							HandleRQ(sendSocket, requestedFile.toString(), OP_RRQ);
						}
						// Write request
						else 
						{                       
							requestedFile.insert(0, WRITEDIR);
							HandleRQ(sendSocket,requestedFile.toString(),OP_WRQ);  
						}
						sendSocket.close();
					} 
					catch (SocketException e) 
					{e.printStackTrace();}
				}
			}.start();
		}
	}

	/**
	 * Reads the first block of data, i.e., the request for an action (read or write).
	 * @param socket (socket to read from)
	 * @param buf (where to store the read data)
	 * @return socketAddress (the socket address of the client)
	 * @throws IOException 
	 */
	private InetSocketAddress receiveFrom(DatagramSocket socket, byte[] buf)
	{
		// Create datagram packet
		DatagramPacket receivePacket = new DatagramPacket(buf, buf.length);

		// Receive packet
		try {
			socket.receive(receivePacket);
		} catch (IOException e) {
			return null;
		}

		// Get client address port from the packet
		InetSocketAddress socketAddress = new InetSocketAddress(receivePacket.getAddress(), receivePacket.getPort());

		return socketAddress;
	}

	/**
	 * Parses the request in buf to retrieve the type of request and requestedFile
	 * 
	 * @param buf (received request)
	 * @param requestedFile (name of file to read/write)
	 * @return opcode (request type: RRQ or WRQ)
	 */
	private int ParseRQ(byte[] buf, StringBuffer requestedFile) 
	{	
		byte[] opcodeBinary = new byte[] {buf[0], buf[1]};
		ByteBuffer wrap = ByteBuffer.wrap(opcodeBinary);

		int opcode = (int)wrap.getShort();

		int bufIndex = 2;
		while(true) {
			byte nextByte = buf[bufIndex];
			if(nextByte != 0) {
				requestedFile.append((char)nextByte);

			}else {
				break;
			}
			bufIndex++;
		}

		return opcode;
	}

	/**
	 * Handles RRQ and WRQ requests 
	 * 
	 * @param sendSocket (socket used to send/receive packets)
	 * @param requestedFile (name of file to read/write)
	 * @param opcode (RRQ or WRQ)
	 * @throws IOException 
	 */
	private void HandleRQ(DatagramSocket sendSocket, String requestedFile, int opcode)
	{		
		if(opcode == OP_RRQ)
		{
			handleRRQ(sendSocket, requestedFile);
			// See "TFTP Formats" in TFTP specification for the DATA and ACK packet contents

		}
		else if (opcode == OP_WRQ) 
		{
			handleWRQ(sendSocket, requestedFile);
		}
		else 
		{
			System.err.println("Invalid request. Sending an error packet.");
			// See "TFTP Formats" in TFTP specification for the ERROR packet contents
			send_ERR(sendSocket, (short)0, "Invalid request opcode");
			return;
		}		
	}
}