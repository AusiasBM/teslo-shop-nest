import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

// el namespace es donde se conectan los clientes para escuchar los eventos
@WebSocketGateway({ cors: true }) 
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,

  ) {}

  // cuando un cliente se conecta
  async handleConnection(client: Socket) {
    
    const token = client.handshake.headers.authorization as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id );
    
    } catch (error) {
      client.disconnect();
      return;
    }

    //console.log({ payload });
    //console.log('client connected', client.id);
    //console.log({ conectados: this.messagesWsService.getConnectedClients() });

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  // cuando un cliente se desconecta
  handleDisconnect(client: Socket) {
    //console.log('client disconnected', client.id);
    this.messagesWsService.removeClient(client.id);

    //console.log({ conectados: this.messagesWsService.getConnectedClients() });

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  // message-from-client 
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {


    //! Emite únicamente al cliente que envía el mensaje
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'Sin mensaje',
    // } );

    //! Emite a todos los clientes conectados menos al cliente que envía el mensaje
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'Sin mensaje',
    // });

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'Sin mensaje',
    });

  }
}
