import Pusher from 'pusher';

const pusher = new Pusher({
	appId: '1409312',
	key: '598286a2c69ac238f324',
	secret: '4acbd3123d2802f7860c',
	cluster: 'us2',
	useTLS: true,
});

export async function notify(event: string, data: any) {
	await pusher.trigger('default', event, data);
}
