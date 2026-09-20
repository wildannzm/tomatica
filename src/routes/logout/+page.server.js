import { prisma } from '$lib/prismaClient';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	const sessionToken = cookies.get('session');

	if (sessionToken) {
		await prisma.session.deleteMany({ where: { token: sessionToken } });
		cookies.delete('session', { path: '/' });
	}

	throw redirect(303, '/login');
}
