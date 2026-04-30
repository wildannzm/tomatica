<script>
	import { Thermometer, Droplets, Sun, Sprout, CloudRain, Wind, LayoutDashboard, Table2 } from 'lucide-svelte';
	import { supabase } from '$lib/supabaseClient';

	// ─── View State ───────────────────────────────────────────────────
	let activeView = $state('dashboard'); // 'dashboard' | 'table'

	// ─── Reactive State ───────────────────────────────────────────────
	let dataSensor = $state({
		id: null,
		created_at: null,
		air_temperature: 0,
		air_humidity: 0,
		lux: 0,
		soil_moisture: 0,
		rainfall: 0,
		wind_speed: 0
	});

	/** @type {any[]} */
	let tableRows = $state([]);

	// ─── Device online/offline tracking ───────────────────────────────
	// Timestamp (ms) of the last data received from Supabase
	let lastDataTime = $state(/** @type {number|null} */ (null));
	// Current time — updated every 30 s so isOnline re-evaluates automatically
	let now = $state(Date.now());
	// Initial loading state
	let isLoading = $state(true);

	const OFFLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

	// true  → data received within 5 min
	// false → no data yet OR gap > 5 min
	const isOnline = $derived(
		lastDataTime !== null && now - lastDataTime < OFFLINE_THRESHOLD_MS
	);

	// ─── Derived: card array ──────────────────────────────────────────
	const sensorData = $derived([
		{
			id: 1,
			label: 'Suhu Udara',
			value: dataSensor.air_temperature,
			unit: '°C',
			icon: Thermometer,
			color: 'text-red-500',
			bgColor: 'bg-red-50',
			status: dataSensor.air_temperature > 35 ? 'Tinggi' : dataSensor.air_temperature < 18 ? 'Rendah' : 'Normal'
		},
		{
			id: 2,
			label: 'Kelembapan Udara',
			value: dataSensor.air_humidity,
			unit: '%',
			icon: Droplets,
			color: 'text-sky-500',
			bgColor: 'bg-sky-50',
			status: dataSensor.air_humidity > 80 ? 'Tinggi' : dataSensor.air_humidity < 40 ? 'Rendah' : 'Normal'
		},
		{
			id: 3,
			label: 'Intensitas Cahaya',
			value: dataSensor.lux,
			unit: 'Lux',
			icon: Sun,
			color: 'text-amber-500',
			bgColor: 'bg-amber-50',
			status: dataSensor.lux > 5000 ? 'Tinggi' : dataSensor.lux < 1000 ? 'Rendah' : 'Normal'
		},
		{
			id: 4,
			label: 'Kelembapan Tanah',
			value: dataSensor.soil_moisture,
			unit: '%',
			icon: Sprout,
			color: 'text-emerald-500',
			bgColor: 'bg-emerald-50',
			status: dataSensor.soil_moisture > 80 ? 'Basah' : dataSensor.soil_moisture < 30 ? 'Kering' : 'Normal'
		},
		{
			id: 5,
			label: 'Curah Hujan',
			value: dataSensor.rainfall,
			unit: 'mm/h',
			icon: CloudRain,
			color: 'text-indigo-500',
			bgColor: 'bg-indigo-50',
			status: dataSensor.rainfall > 0 ? 'Hujan' : 'Cerah'
		},
		{
			id: 6,
			label: 'Kecepatan Angin',
			value: dataSensor.wind_speed,
			unit: 'm/s',
			icon: Wind,
			color: 'text-teal-500',
			bgColor: 'bg-teal-50',
			status: dataSensor.wind_speed > 10 ? 'Kencang' : dataSensor.wind_speed > 5 ? 'Sedang' : 'Sepoi'
		}
	]);

	// ─── Effect: initial fetch + realtime subscription ─────────────────
	$effect(() => {
		// 1. Fetch latest single row for dashboard
		supabase
			.from('sensor_data')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle()
			.then(({ data, error }) => {
				if (error) console.error('Gagal mengambil data awal:', error.message);
				if (data) {
					dataSensor = data;
					// Seed lastDataTime from the row's created_at timestamp
					lastDataTime = new Date(data.created_at).getTime();
				}
				isLoading = false;
			});

		// 2. Fetch last 50 rows for table view
		supabase
			.from('sensor_data')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(50)
			.then(({ data, error }) => {
				if (error) console.error('Gagal mengambil riwayat:', error.message);
				if (data) tableRows = data;
			});

		// 3. Realtime subscription — auto-update both views on INSERT
		const channel = supabase
			.channel('realtime-sensor-data')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'sensor_data' },
				(payload) => {
					dataSensor = payload.new;
					tableRows = [payload.new, ...tableRows].slice(0, 50);
					// Mark the device as online immediately
					lastDataTime = Date.now();
				}
			)
			.subscribe();

		// 4. Poll every 30 s so isOnline re-evaluates without waiting for new data
		const timer = setInterval(() => { now = Date.now(); }, 30_000);

		return () => {
			clearInterval(timer);
			supabase.removeChannel(channel);
		};
	});

	/**
	 * Format a timestamp string to a short Indonesian locale string.
	 * @param {string} ts
	 */
	function formatTime(ts) {
		return new Date(ts).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });
	}
</script>

<svelte:head>
	<title>Tomatica — Dashboard Monitoring Tanaman Tomat</title>
	<meta
		name="description"
		content="Dashboard IoT untuk pemantauan kondisi tanaman tomat secara real-time."
	/>
	<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M119.77 69.38s1.71-13.05-1.4-18.95-12.71-18.93-32.62-21.28c-10.56-1.24-17.71.16-24.23.93-4.13.49-11.82-2.05-25.63 1.09C25.65 33.5 10.11 42.51 5.06 61.93C2.4 72.16 3.41 83.21 7.94 92.52c8.7 17.86 24.85 22.21 24.85 22.21l32.46 2.64l39.3-16.62l15.22-31.37z' fill='%23ff2a23'/%3E%3Cpath d='M82.03 119.08c20.66-4.04 38.52-22.52 41.63-42.09c2.91-18.31-7.79-30.58-7.79-30.58s1.22 9.77-1.06 20.18c-2.45 11.14-9.54 29.71-32 40.23-27.57 12.91-57.77 4.4-57.77 4.4s20.52 14.99 56.99 7.86z' fill='%23dc0d27'/%3E%3Cpath d='M24.92 52.76c-5.49-1.42-12.34 2.73-13.33 14.88-.91 11.13 5.12 24.54 11.03 22.94 5.02-1.36.19-10.66 1.98-18.29 1.81-7.63 8.69-17.36.32-19.53z' fill='%23fed3b0'/%3E%3Cpath d='M31.87 46.05c-.78 1.01 1.03 5.45 10.22 5.39 9.18-.06 10.72-2.83 14.81-1.59s7.28 6.16 11.8 8.85c6.32 3.76 15.44 2.8 15.38 1.13-.06-1.68-2.29-.82-4.21-3.17-1.92-2.36-5.32-8.59-5.32-8.59s.95-2.92 2.96-2.81c4.64.25 9.8-.67 12.64-2.45 3.4-2.12 4.68-5.39 4.06-6.14-.62-.74-2.55 1.26-3.6 1.07s-7.88-.06-7.88-.06l-8.25-1.34s1.13-4.83 3.36-7.31c2.23-2.48 5.73-5.89 5.66-6.32s-2.88-.05-2.88-.05l-8.69 3.97-6.08 8-11.54 1.49-11.11-7.45s-6.37-5.14-6.66-5.02c-1.61.66.84 3.11 2.69 6.07 1.6 2.57 1.93 3.86 4.09 5.65 2.11 1.74 5.65 3.47 5.65 3.47l-2.54 4.59s-8.19 3.23-9.62 3.23c-1.42.01-4.51-1.16-4.94-.61z' fill='%23bdcf44'/%3E%3Cpath d='M57.51 43.28c3.35.25 5.77 4.7 8.79 7.73 4.41 4.41 7.86 6.71 11.57 7.58 1.86.43 6.13 1.14 6.13 1.14s.62-.43-1.49-1.61c-2.11-1.18-3.38-3.44-3.69-4.49-.31-1.05-1.28-4.5-3.32-7.36s-4.36-4.07-3.62-5.37c.74-1.3 7.14.9 13.3-.09 8.13-1.3 9.37-3.91 9-4.22-.37-.31-5.4 1.18-7.94.62-2.54-.56-4.72-2.3-8.56-2.3-2.62 0-5.18.95-5.87-.48-.58-1.2 1.6-5.21 3.26-6.72 4.03-3.66 8.38-4.53 8.38-5.03 0-1.03-7.07-1.61-11.97 2.3-4.88 3.89-3.96 9-10.3 9-2.11 0-2.92-.5-2.92-.5s-2.83-2.33-6.61-4.38c-3.78-2.05-6.63-1.14-8.81-2.19-2.17-1.05-6.02-3.77-6.39-3.22s2.89 4.27 6.99 7.31 8.69 4.59 7.38 5.83c-1.3 1.24-3.47 2.05-5.52 3.6-2.05 1.55-3.85 3.78-6.33 4.59s-6.56.24-7.12.92c-.56.68 4.32 3.03 11.95 1.61 7.61-1.42 7.63-4.72 13.71-4.27z' fill='%2394a61d'/%3E%3Cpath d='M65.12 4.94c-1.67-.08-3.78 1.24-3.78 1.24s-3.06 3.73-4.27 12.99c-.56 4.28.05 10.03-.07 13.2-.12 3.16-.81 4.34-.62 5.96.19 1.61 1.88 3.43 5.79 3.39 3.14-.03 4.76-2.46 4.7-3.33-.06-.87-2.75-9.74-1.99-17.56.71-7.27 3.36-12.29 3.47-13.34.06-.57-.69-2.43-3.23-2.55z' fill='%23728035'/%3E%3C/svg%3E" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-28" style="font-family: 'Inter', sans-serif;">
	<!-- Navbar -->
	<nav class="sticky top-0 z-50 border-b border-red-100 bg-white/80 shadow-sm backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
			<div class="flex items-center gap-2.5">
				<svg class="h-9 w-9 drop-shadow-sm" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M119.77 69.38s1.71-13.05-1.4-18.95s-12.71-18.93-32.62-21.28c-10.56-1.24-17.71.16-24.23.93c-4.13.49-11.82-2.05-25.63 1.09C25.65 33.5 10.11 42.51 5.06 61.93C2.4 72.16 3.41 83.21 7.94 92.52c8.7 17.86 24.85 22.21 24.85 22.21l32.46 2.64l39.3-16.62l15.22-31.37z" fill="#ff2a23"/>
					<path d="M82.03 119.08c20.66-4.04 38.52-22.52 41.63-42.09c2.91-18.31-7.79-30.58-7.79-30.58s1.22 9.77-1.06 20.18c-2.45 11.14-9.54 29.71-32 40.23c-27.57 12.91-57.77 4.4-57.77 4.4s20.52 14.99 56.99 7.86z" fill="#dc0d27"/>
					<path d="M24.92 52.76c-5.49-1.42-12.34 2.73-13.33 14.88c-.91 11.13 5.12 24.54 11.03 22.94c5.02-1.36.19-10.66 1.98-18.29c1.81-7.63 8.69-17.36.32-19.53z" fill="#fed3b0"/>
					<path d="M31.87 46.05c-.78 1.01 1.03 5.45 10.22 5.39c9.18-.06 10.72-2.83 14.81-1.59s7.28 6.16 11.8 8.85c6.32 3.76 15.44 2.8 15.38 1.13c-.06-1.68-2.29-.82-4.21-3.17c-1.92-2.36-5.32-8.59-5.32-8.59s.95-2.92 2.96-2.81c4.64.25 9.8-.67 12.64-2.45c3.4-2.12 4.68-5.39 4.06-6.14c-.62-.74-2.55 1.26-3.6 1.07s-7.88-.06-7.88-.06l-8.25-1.34s1.13-4.83 3.36-7.31c2.23-2.48 5.73-5.89 5.66-6.32s-2.88-.05-2.88-.05l-8.69 3.97l-6.08 8l-11.54 1.49l-11.11-7.45s-6.37-5.14-6.66-5.02c-1.61.66.84 3.11 2.69 6.07c1.6 2.57 1.93 3.86 4.09 5.65c2.11 1.74 5.65 3.47 5.65 3.47l-2.54 4.59s-8.19 3.23-9.62 3.23c-1.42.01-4.51-1.16-4.94-.61z" fill="#bdcf44"/>
					<path d="M57.51 43.28c3.35.25 5.77 4.7 8.79 7.73c4.41 4.41 7.86 6.71 11.57 7.58c1.86.43 6.13 1.14 6.13 1.14s.62-.43-1.49-1.61c-2.11-1.18-3.38-3.44-3.69-4.49c-.31-1.05-1.28-4.5-3.32-7.36s-4.36-4.07-3.62-5.37c.74-1.3 7.14.9 13.3-.09c8.13-1.3 9.37-3.91 9-4.22c-.37-.31-5.4 1.18-7.94.62c-2.54-.56-4.72-2.3-8.56-2.3c-2.62 0-5.18.95-5.87-.48c-.58-1.2 1.6-5.21 3.26-6.72c4.03-3.66 8.38-4.53 8.38-5.03c0-1.03-7.07-1.61-11.97 2.3c-4.88 3.89-3.96 9-10.3 9c-2.11 0-2.92-.5-2.92-.5s-2.83-2.33-6.61-4.38c-3.78-2.05-6.63-1.14-8.81-2.19c-2.17-1.05-6.02-3.77-6.39-3.22s2.89 4.27 6.99 7.31s8.69 4.59 7.38 5.83c-1.3 1.24-3.47 2.05-5.52 3.6c-2.05 1.55-3.85 3.78-6.33 4.59s-6.56.24-7.12.92c-.56.68 4.32 3.03 11.95 1.61c7.61-1.42 7.63-4.72 13.71-4.27z" fill="#94a61d"/>
					<path d="M65.12 4.94c-1.67-.08-3.78 1.24-3.78 1.24s-3.06 3.73-4.27 12.99c-.56 4.28.05 10.03-.07 13.2c-.12 3.16-.81 4.34-.62 5.96c.19 1.61 1.88 3.43 5.79 3.39c3.14-.03 4.76-2.46 4.7-3.33c-.06-.87-2.75-9.74-1.99-17.56c.71-7.27 3.36-12.29 3.47-13.34c.06-.57-.69-2.43-3.23-2.55z" fill="#728035"/>
				</svg>
				<span class="text-xl font-extrabold tracking-tight text-gray-900"
					>Toma<span class="text-red-500">tica</span></span
				>
			</div>
			<div class="flex items-center gap-3">
				{#if isLoading}
					<!-- Loading: spinning gray dot -->
					<span class="relative flex h-2.5 w-2.5 items-center justify-center" aria-label="Memuat">
						<span class="relative inline-flex h-2.5 w-2.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500"></span>
					</span>
					<span class="hidden text-sm font-medium text-gray-400 sm:inline">Memuat...</span>
				{:else if isOnline}
					<!-- Online: pulsing green dot -->
					<span class="relative flex h-2.5 w-2.5 items-center justify-center" aria-label="Status koneksi: terhubung">
						<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
						<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
					</span>
					<span class="hidden text-sm font-medium text-gray-500 sm:inline">Terhubung</span>
				{:else}
					<!-- Offline: static red dot -->
					<span class="relative flex h-2.5 w-2.5 items-center justify-center" aria-label="Status koneksi: terputus">
						<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
					</span>
					<span class="hidden text-sm font-medium text-red-500 sm:inline">Terputus</span>
				{/if}
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
		<!-- Header Section -->
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
				{activeView === 'dashboard' ? 'Dashboard Monitoring' : 'Tabel Data Sensor'}
			</h1>
			<p class="mt-1 text-sm text-gray-500">
				{activeView === 'dashboard'
					? 'Pemantauan kondisi tanaman tomat secara real-time.'
					: 'Riwayat data sensor dari perangkat IoT.'}
			</p>
		</div>
		
		<!-- ── DASHBOARD VIEW ──────────────────────────────────────────── -->
		{#if activeView === 'dashboard'}
			<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
				{#each sensorData as sensor (sensor.id)}
					<div
						class="group cursor-default rounded-xl border border-gray-100 bg-white p-3.5 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/60"
					>
						<div class="mb-4 flex items-center justify-between">
							<div
								class="{sensor.bgColor} {sensor.color} rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110"
							>
								<sensor.icon class="h-5 w-5" />
							</div>
							<span
								class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 transition-colors duration-300 group-hover:bg-red-50 group-hover:text-red-600"
							>
								{sensor.status}
							</span>
						</div>

						<p class="mb-1 text-sm font-medium text-gray-500">{sensor.label}</p>
						<div class="flex items-baseline gap-1.5">
							<span class="text-3xl font-bold tracking-tight text-gray-900">
								{sensor.value}
							</span>
							<span class="text-sm font-medium text-gray-400">{sensor.unit}</span>
						</div>
					</div>
				{/each}
			</div>

		<!-- ── TABLE VIEW ──────────────────────────────────────────────── -->
		{:else}
			{#if tableRows.length === 0}
				<div class="py-16 text-center text-sm text-gray-400">Memuat data...</div>
			{:else}
				<!-- Mobile: card list (hidden on md+) -->
				<div class="flex flex-col gap-3 md:hidden">
					{#each tableRows as row (row.id)}
						<div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
							<!-- Timestamp header -->
							<p class="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
								{formatTime(row.created_at)}
							</p>
							<div class="grid grid-cols-2 gap-x-4 gap-y-2.5">
								<div class="flex items-center justify-between">
									<span class="text-xs text-gray-500">Suhu</span>
									<span class="text-sm font-bold text-red-500">{row.air_temperature} °C</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-xs text-gray-500">Kelembapan</span>
									<span class="text-sm font-bold text-sky-500">{row.air_humidity} %</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-xs text-gray-500">Cahaya</span>
									<span class="text-sm font-bold text-amber-500">{row.lux} Lux</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-xs text-gray-500">Tanah</span>
									<span class="text-sm font-bold text-emerald-500">{row.soil_moisture} %</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-xs text-gray-500">Hujan</span>
									<span class="text-sm font-bold text-indigo-500">{row.rainfall} mm/h</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-xs text-gray-500">Angin</span>
									<span class="text-sm font-bold text-teal-500">{row.wind_speed} m/s</span>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Desktop: table (hidden below md) -->
				<div class="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b border-gray-100 bg-gray-50">
									<th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Waktu</th>
									<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-red-400">Suhu (°C)</th>
									<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-sky-400">Kelembapan (%)</th>
									<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-amber-400">Cahaya (Lux)</th>
									<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-emerald-400">Tanah (%)</th>
									<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-indigo-400">Hujan (mm/h)</th>
									<th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-teal-400">Angin (m/s)</th>
								</tr>
							</thead>
							<tbody>
								{#each tableRows as row (row.id)}
									<tr class="border-b border-gray-50 transition-colors duration-150 hover:bg-red-50/30">
										<td class="px-4 py-3 font-medium text-gray-600">{formatTime(row.created_at)}</td>
										<td class="px-4 py-3 text-right font-semibold text-red-500">{row.air_temperature}</td>
										<td class="px-4 py-3 text-right font-semibold text-sky-500">{row.air_humidity}</td>
										<td class="px-4 py-3 text-right font-semibold text-amber-500">{row.lux}</td>
										<td class="px-4 py-3 text-right font-semibold text-emerald-500">{row.soil_moisture}</td>
										<td class="px-4 py-3 text-right font-semibold text-indigo-500">{row.rainfall}</td>
										<td class="px-4 py-3 text-right font-semibold text-teal-500">{row.wind_speed}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}

	</main>
</div>

<!-- ── Floating Bottom Navigation ─────────────────────────────────────── -->
<div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
	<div class="flex items-center gap-1 rounded-2xl border border-gray-200/80 bg-white/90 p-1.5 shadow-xl shadow-gray-300/40 backdrop-blur-md">
		<button
			id="nav-dashboard"
			onclick={() => (activeView = 'dashboard')}
			class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200
				{activeView === 'dashboard'
					? 'bg-linear-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200'
					: 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}"
		>
			<LayoutDashboard class="h-4 w-4" />
			<span>Dashboard</span>
		</button>

		<button
			id="nav-table"
			onclick={() => (activeView = 'table')}
			class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200
				{activeView === 'table'
					? 'bg-linear-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200'
					: 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}"
		>
			<Table2 class="h-4 w-4" />
			<span>Tabel</span>
		</button>
	</div>
</div>
