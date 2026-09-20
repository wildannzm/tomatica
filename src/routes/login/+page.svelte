<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { User, Lock, Eye, EyeOff } from 'lucide-svelte';
	import Swal from 'sweetalert2';

	let { form } = $props();
	let loading = $state(false);
	let showPassword = $state(false);

	$effect(() => {
		if (form?.success) {
			Swal.fire({
				icon: 'success',
			title: 'Berhasil!',
			text: 'Selamat datang di Tomatica.',
				timer: 1500,
				showConfirmButton: false,
				customClass: { popup: 'rounded-xl' }
			}).then(() => {
				goto('/');
			});
		}
	});

	$effect(() => {
		if (form?.error) {
			Swal.fire({
				icon: 'error',
				title: 'Gagal Masuk',
				text: form.error,
				customClass: { popup: 'rounded-xl' }
			});
		}
	});
</script>

<svelte:head>
	<title>Login — Tomatica</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gray-50 px-4"
	style="font-family: 'Inter', sans-serif;"
>
	<!-- Decorative background blobs -->
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		<div
			class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-100/60 blur-3xl"
		></div>
		<div
			class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl"
		></div>
	</div>

	<div class="relative w-full max-w-sm">
		<!-- Card -->
		<div class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg shadow-gray-200/50">
			<!-- Logo & Title -->
			<div class="mb-8 text-center">
			<div class="mx-auto mb-4">
				<svg
					class="mx-auto h-14 w-14 drop-shadow-sm"
					viewBox="0 0 128 128"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path
						d="M119.77 69.38s1.71-13.05-1.4-18.95s-12.71-18.93-32.62-21.28c-10.56-1.24-17.71.16-24.23.93c-4.13.49-11.82-2.05-25.63 1.09C25.65 33.5 10.11 42.51 5.06 61.93C2.4 72.16 3.41 83.21 7.94 92.52c8.7 17.86 24.85 22.21 24.85 22.21l32.46 2.64l39.3-16.62l15.22-31.37z"
						fill="#ff2a23"
					/>
					<path
						d="M82.03 119.08c20.66-4.04 38.52-22.52 41.63-42.09c2.91-18.31-7.79-30.58-7.79-30.58s1.22 9.77-1.06 20.18c-2.45 11.14-9.54 29.71-32 40.23c-27.57 12.91-57.77 4.4-57.77 4.4s20.52 14.99 56.99 7.86z"
						fill="#dc0d27"
					/>
					<path
						d="M24.92 52.76c-5.49-1.42-12.34 2.73-13.33 14.88c-.91 11.13 5.12 24.54 11.03 22.94c5.02-1.36.19-10.66 1.98-18.29c1.81-7.63 8.69-17.36.32-19.53z"
						fill="#fed3b0"
					/>
					<path
						d="M31.87 46.05c-.78 1.01 1.03 5.45 10.22 5.39c9.18-.06 10.72-2.83 14.81-1.59s7.28 6.16 11.8 8.85c6.32 3.76 15.44 2.8 15.38 1.13c-.06-1.68-2.29-.82-4.21-3.17c-1.92-2.36-5.32-8.59-5.32-8.59s.95-2.92 2.96-2.81c4.64.25 9.8-.67 12.64-2.45c3.4-2.12 4.68-5.39 4.06-6.14c-.62-.74-2.55 1.26-3.6 1.07s-7.88-.06-7.88-.06l-8.25-1.34s1.13-4.83 3.36-7.31c2.23-2.48 5.73-5.89 5.66-6.32s-2.88-.05-2.88-.05l-8.69 3.97l-6.08 8l-11.54 1.49l-11.11-7.45s-6.37-5.14-6.66-5.02c-1.61.66.84 3.11 2.69 6.07c1.6 2.57 1.93 3.86 4.09 5.65c2.11 1.74 5.65 3.47 5.65 3.47l-2.54 4.59s-8.19 3.23-9.62 3.23c-1.42.01-4.51-1.16-4.94-.61z"
						fill="#bdcf44"
					/>
					<path
						d="M57.51 43.28c3.35.25 5.77 4.7 8.79 7.73c4.41 4.41 7.86 6.71 11.57 7.58c1.86.43 6.13 1.14 6.13 1.14s.62-.43-1.49-1.61c-2.11-1.18-3.38-3.44-3.69-4.49c-.31-1.05-1.28-4.5-3.32-7.36s-4.36-4.07-3.62-5.37c.74-1.3 7.14.9 13.3-.09c8.13-1.3 9.37-3.91 9-4.22c-.37-.31-5.4 1.18-7.94.62c-2.54-.56-4.72-2.3-8.56-2.3c-2.62 0-5.18.95-5.87-.48c-.58-1.2 1.6-5.21 3.26-6.72c4.03-3.66 8.38-4.53 8.38-5.03c0-1.03-7.07-1.61-11.97 2.3c-4.88 3.89-3.96 9-10.3 9c-2.11 0-2.92-.5-2.92-.5s-2.83-2.33-6.61-4.38c-3.78-2.05-6.63-1.14-8.81-2.19c-2.17-1.05-6.02-3.77-6.39-3.22s2.89 4.27 6.99 7.31s8.69 4.59 7.38 5.83c-1.3 1.24-3.47 2.05-5.52 3.6c-2.05 1.55-3.85 3.78-6.33 4.59s-6.56.24-7.12.92c-.56.68 4.32 3.03 11.95 1.61c7.61-1.42 7.63-4.72 13.71-4.27z"
						fill="#94a61d"
					/>
					<path
						d="M65.12 4.94c-1.67-.08-3.78 1.24-3.78 1.24s-3.06 3.73-4.27 12.99c-.56 4.28.05 10.03-.07 13.2c-.12 3.16-.81 4.34-.62 5.96c.19 1.61 1.88 3.43 5.79 3.39c3.14-.03 4.76-2.46 4.7-3.33c-.06-.87-2.75-9.74-1.99-17.56c.71-7.27 3.36-12.29 3.47-13.34c.06-.57-.69-2.43-3.23-2.55z"
						fill="#728035"
					/>
				</svg>
			</div>
				<h1 class="text-xl font-bold text-gray-900">Tomatica</h1>
				<p class="mt-1 text-sm text-gray-400">Dashboard IoT Monitoring</p>
			</div>

			<!-- Form -->
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-4"
			>
				<!-- Username -->
				<div>
					<label for="username" class="mb-1.5 block text-sm font-medium text-gray-700">
						Username
					</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
							<User size={16} class="text-gray-400" />
						</div>
						<input
							type="text"
							id="username"
							name="username"
							required
							autocomplete="username"
							class="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-red-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10"
							placeholder="Masukkan username"
						/>
					</div>
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">
						Password
					</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
							<Lock size={16} class="text-gray-400" />
						</div>
						<input
							type={showPassword ? 'text' : 'password'}
							id="password"
							name="password"
							required
							autocomplete="current-password"
							class="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-red-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10"
							placeholder="Masukkan password"
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition-colors hover:text-gray-600"
							tabindex="-1"
						>
							{#if showPassword}
								<EyeOff size={16} />
							{:else}
								<Eye size={16} />
							{/if}
						</button>
					</div>
				</div>

				<!-- Submit -->
				<button
					type="submit"
					disabled={loading}
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-md hover:shadow-red-500/20 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if loading}
						<svg
							class="h-4 w-4 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							></path>
						</svg>
						Masuk...
					{:else}
						Masuk
					{/if}
				</button>
			</form>
		</div>

		<!-- Footer -->
		<p class="mt-6 text-center text-xs text-gray-400">
			&copy; {new Date().getFullYear()} Tomatica. 		Sistem Monitoring IoT.
		</p>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f9fafb;
	}
</style>
