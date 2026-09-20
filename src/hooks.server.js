import { prisma } from '$lib/prismaClient';
import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const publicPaths = ['/login', '/api/login'];
	const path = event.url.pathname;

	if (publicPaths.some((p) => path.startsWith(p))) {
		return resolve(event);
	}

	const sessionToken = event.cookies.get('session');

	if (!sessionToken) {
		throw redirect(303, '/login');
	}

	const session = await prisma.session.findUnique({
		where: { token: sessionToken },
		include: { user: true }
	});

	if (!session || session.expiresAt < new Date()) {
		event.cookies.delete('session', { path: '/' });
		throw redirect(303, '/login');
	}

	event.locals.user = {
		id: session.user.id,
		username: session.user.username
	};

	return resolve(event);
}
