import { prisma } from '$lib/prismaClient';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (locals.user) {
		throw redirect(303, '/');
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required.' });
		}

		const user = await prisma.user.findUnique({
			where: { username: String(username) }
		});

		if (!user) {
			return fail(400, { error: 'Invalid username or password.' });
		}

		const valid = await bcryptjs.compare(String(password), user.password);
		if (!valid) {
			return fail(400, { error: 'Invalid username or password.' });
		}

		// Delete existing sessions for this user
		await prisma.session.deleteMany({ where: { userId: user.id } });

		// Create new session
		const token = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

		await prisma.session.create({
			data: {
				token,
				userId: user.id,
				expiresAt
			}
		});

		cookies.set('session', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60
		});

		return { success: true };
	}
};
