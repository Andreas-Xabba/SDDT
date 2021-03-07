
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

		System.out.printf("Listening at port %d for new requests\n", TFTPPORT);

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

		// Get client address and port from the packet
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

	private void handleRRQ(DatagramSocket sendSocket, String requestedFile) {
		try {
			short readOpcode = 3;
			short block = 1;
			File file = new File(requestedFile);
			if(file.exists()) {
				FileReader reader = new FileReader(file);
				long fileLength = file.length();

				while(true) {

					byte[] buf;

					if(fileLength >= 512) {
						buf = new byte[516]; //2+2+512
						fileLength -= 512;
					}else {
						buf = new byte[4 + (int)fileLength];	//2+2+X
						fileLength -= fileLength;
					}

					ByteBuffer wrap = ByteBuffer.wrap(buf);
					wrap.putShort(0, readOpcode);
					wrap.putShort(2, block);
					for(int i = 4; i < buf.length; i++) {
						buf[i] = (byte)reader.read();	//read the file until the buffer is full
					}

					DatagramPacket newSendPacket = new DatagramPacket(buf, buf.length, sendSocket.getInetAddress(), sendSocket.getPort());

					//System.out.printf("Sending %s to %s using port %d\n", requestedFile, sendSocket.getInetAddress().getHostName(), sendSocket.getPort());

					int tries = 0;
					while(!send_DATA_receive_ACK(sendSocket, newSendPacket, block)) {
						tries++;
						if(tries == 5) {
							throw new TimeoutException("Timed out waiting for ACK from " + sendSocket.getInetAddress() + " using port " + sendSocket.getPort() + "on block " + block + " of " + requestedFile);
						}
					}

					if(fileLength == 0) {
						break;	//if eof has been reached
					}else {
						block++;	//else move to the next block
					}
				}
				reader.close();
				System.out.printf("Completed sending %s in %d block(s) to %s using port %d\n", requestedFile, block, sendSocket.getInetAddress().getHostName(), sendSocket.getPort());
			}else {
				send_ERR(sendSocket, 1, "File not found");
			}
		}catch(IOException e) {
			send_ERR(sendSocket, 0, "Error while handling request");
		}catch(TimeoutException e) {
			System.out.println(e.getMessage());
		}catch(ConnectionClosedException e) {
			System.out.printf("Connection to %s:%s closed by client", sendSocket.getInetAddress().getHostName(), sendSocket.getPort());
		}
	}

	private void handleWRQ(DatagramSocket sendSocket, String offeredFile) {

		try {
			short ackOpcode = 4;
			short ackBlock = 0;
			byte[] ackBuf = new byte[4];
			ByteBuffer ackWrap = ByteBuffer.wrap(ackBuf);
			ackWrap.putShort(0, ackOpcode);
			ackWrap.putShort(2, ackBlock);
			DatagramPacket ackPacket = new DatagramPacket(ackBuf, ackBuf.length);
			sendSocket.send(ackPacket);

			File file = new File(offeredFile);

			if(!file.exists()) {
				file.createNewFile();
				FileWriter writer = new FileWriter(file, true);
				short rBlock = 1;
				while(true) {
					byte[] buf = new byte[516];
					DatagramPacket receivePacket = new DatagramPacket(buf, buf.length);

					int tries = 0;
					while(!receive_DATA_send_ACK(sendSocket, receivePacket, rBlock)) {
						tries ++;
						if(tries == 5) {
							throw new TimeoutException("Time Out waiting for ACK");
						}
					}
					for(int i = 4; i < receivePacket.getLength(); i++) {
						writer.write(buf[i]);
					}

					if(receivePacket.getLength() < 516) {
						break;
					}else {
						rBlock++;
					}

				}

				writer.close();
				String[] splitFile = offeredFile.split("\\\\");
				System.out.printf("Completed receiving %s in %d block(s) from %s using port %d: new path=%s\n", splitFile[splitFile.length -1], rBlock, sendSocket.getInetAddress().getHostName(), sendSocket.getPort(), file.getAbsolutePath());
			}else {
				send_ERR(sendSocket, 6, "File already exist");	
			}

		} catch (IOException e) {
			send_ERR(sendSocket, 2, "Access violation");	// Andreas
		} catch(TimeoutException e) {
			System.out.println(e.getMessage());
		} catch(ConnectionClosedException e) {
			System.out.printf("Connection to %s:%s closed by client", sendSocket.getInetAddress().getHostName(), sendSocket.getPort());
			sendSocket.close();
		}

	}

	private boolean send_DATA_receive_ACK(DatagramSocket sendSocket, DatagramPacket newSendPacket, short sBlock) throws IOException, ConnectionClosedException {
		byte[] buf = new byte[4];
		DatagramPacket receivePacket = new DatagramPacket(buf, buf.length);
		long timeStamp = System.currentTimeMillis();
		try {
			AtomicBoolean receivedData = new AtomicBoolean();
			receivedData.set(false);
			ReceiveThread receiver = new ReceiveThread(sendSocket, receivePacket, receivedData);	//running Socket.receive in a separate thread
			sendSocket.send(newSendPacket);
			receiver.start();
			
			while(true) {
			
				try {
					Thread.sleep(50);	//delay to not continue locking the boolean
					if(System.currentTimeMillis() - timeStamp > TIMEOUTDURATION) {
						receiver.interrupt();
						throw new TimeoutException("acknowledgement timeout");
					}
					if(receivedData.get() == true) {
						break;	// data received
					}
					/*
					if(System.currentTimeMillis() - timeStamp > TIMEOUTDURATION) {
						receiver.interrupt();
						System.out.println("2");
						throw new TimeoutException("acknowledgement timeout");
					}*/
				} catch (InterruptedException e) {
					//sleep interrupted
				}
			}
			ByteBuffer wrap = ByteBuffer.wrap(buf);
			short opcode = wrap.getShort(0);
			short rBlock = wrap.getShort(2);	//read header
			if(opcode == 4 && rBlock == sBlock) {	//if it is the correct packet
				return true;
			}else if(opcode == 5){
				throw new ConnectionClosedException("Received error message");
			}
			return false;
		} catch (SocketTimeoutException e) {
			//if implementing setSoSocketTimeout
			System.out.println("socket timeout");
			return false;
		} catch(TimeoutException e) {
			System.out.println(e.getMessage());
			return false;
		}
	}
	
	private boolean receive_DATA_send_ACK(DatagramSocket sendSocket, DatagramPacket receivePacket, int expectedBlock) throws ConnectionClosedException, IOException
	{
			sendSocket.receive(receivePacket);	//send the data
			ByteBuffer wrap = ByteBuffer.wrap(receivePacket.getData());
			short opcode = wrap.getShort(0);
			short rBlock = wrap.getShort(2);	//read the first 4 bytes of the response
			if(opcode == 3) {	//if response is correct code and block
				byte[] ackBuf = new byte[4];
				short ackOpcode = 4;
				ByteBuffer ackWrap = ByteBuffer.wrap(ackBuf);
				ackWrap.putShort(0, ackOpcode);
				ackWrap.putShort(2, rBlock);
				DatagramPacket ackPacket = new DatagramPacket(ackBuf, ackBuf.length);
				sendSocket.send(ackPacket);	//send an ACK that the packet was received
				if(rBlock == expectedBlock) {
					return true;
				}else {
					return false;
				}	
			}else if(opcode == 5) {
				throw new ConnectionClosedException("Received error message from client");	//else if response was an error, throw connection closed error
			}else {
				send_ERR(sendSocket, 0, "opcode " + opcode + "was received when expecting data");
			}
		return false;
	}

	/**
	 * 
	 * @param sendSocket (client socket that wil receive the error message)
	 * @param errcode	(FTP error code 0 to 6)
	 * @param errMessage	(error message send with the code)
	 */
	private void send_ERR(DatagramSocket sendSocket, int errcode, String errMessage){
		//[errOpcode(5), errcode(0-6), errMessage(string), end(0)]
		try {
			byte[] errBuf = new byte[4 + errMessage.length() + 1];
			short errOpcode = 5;
			byte end = 0;
			ByteBuffer errWrap = ByteBuffer.wrap(errBuf);
			errWrap.putShort(errOpcode);
			errWrap.putShort((short)errcode);
			errWrap.put(errMessage.getBytes());
			errWrap.put(end);
			DatagramPacket errPacket = new DatagramPacket(errBuf, errBuf.length);
			sendSocket.send(errPacket);
		}catch(IOException e) {
			e.printStackTrace();
		}

	}

}